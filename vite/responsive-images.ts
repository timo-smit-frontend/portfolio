import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import type { Plugin } from 'vite'
import { parseRasterVariant, rasterVariantSrc, variantWidthsFor, type ImageFormat } from '../app/services/responsiveImage'

const ORIGINAL_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'] as const
const IMAGE_FORMATS: ImageFormat[] = ['avif', 'webp']

async function findOriginal(publicDir: string, stem: string): Promise<string | undefined> {
  const relativeStem = stem.replace(/^\//, '')
  for (const extension of ORIGINAL_EXTENSIONS) {
    const candidate = path.join(publicDir, `${relativeStem}${extension}`)
    try {
      await fs.access(candidate)
      return candidate
    } catch {
      continue
    }
  }
  return undefined
}

function encodeQuality(width: number, format: ImageFormat): number {
  if (format === 'avif') return width >= 1000 ? 45 : 50
  return width >= 1000 ? 70 : 75
}

async function resizeToFormat(inputPath: string, width: number, format: ImageFormat): Promise<Buffer> {
  const image = sharp(inputPath).resize({ width, withoutEnlargement: true })
  const quality = encodeQuality(width, format)
  return format === 'avif' ? image.avif({ quality }).toBuffer() : image.webp({ quality }).toBuffer()
}

function contentType(format: ImageFormat): string {
  return format === 'avif' ? 'image/avif' : 'image/webp'
}

function isOriginalImage(fileName: string): boolean {
  return ORIGINAL_EXTENSIONS.some((extension) => fileName.toLowerCase().endsWith(extension))
}

function publicSrcStem(publicDir: string, originalPath: string): string {
  const relativePath = path.relative(publicDir, originalPath).split(path.sep).join('/')
  return `/${relativePath.replace(/\.(png|jpe?g|webp)$/i, '')}`
}

async function findOriginalImages(dir: string, imagesRoot: string): Promise<string[]> {
  const results: string[] = []
  let entries: import('node:fs').Dirent[]
  try {
    entries = await fs.readdir(dir, { withFileTypes: true })
  } catch {
    return results
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...(await findOriginalImages(fullPath, imagesRoot)))
      continue
    }
    if (!entry.isFile() || !isOriginalImage(entry.name)) continue

    const relativeToImages = path.relative(imagesRoot, fullPath).split(path.sep).join('/')
    if (parseRasterVariant(path.posix.join('/images', relativeToImages))) continue

    results.push(fullPath)
  }

  return results
}

export function responsiveImagesPlugin(): Plugin {
  let publicDir = ''
  let outDir = ''
  const cache = new Map<string, Buffer>()

  async function variantBuffer(originalPath: string, width: number, format: ImageFormat): Promise<Buffer> {
    const key = `${originalPath}?w=${width}&f=${format}`
    const cached = cache.get(key)
    if (cached) return cached
    const buffer = await resizeToFormat(originalPath, width, format)
    cache.set(key, buffer)
    return buffer
  }

  return {
    name: 'responsive-images',
    configResolved(config) {
      publicDir = config.publicDir
      outDir = path.resolve(config.root, config.build.outDir)
    },
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const pathname = request.url?.split('?')[0]
        if (!pathname) {
          next()
          return
        }

        const variant = parseRasterVariant(decodeURIComponent(pathname))
        if (!variant) {
          next()
          return
        }

        const originalPath = await findOriginal(publicDir, variant.stem)
        if (!originalPath) {
          next()
          return
        }

        try {
          const body = await variantBuffer(originalPath, variant.width, variant.format)
          response.statusCode = 200
          response.setHeader('Content-Type', contentType(variant.format))
          response.end(body)
        } catch (error) {
          next(error)
        }
      })
    },
    async closeBundle() {
      const imagesDir = path.join(publicDir, 'images')
      const originals = await findOriginalImages(imagesDir, imagesDir)

      for (const originalPath of originals) {
        const stem = publicSrcStem(publicDir, originalPath)
        const placeholderSrc = `${stem}.png`

        for (const width of variantWidthsFor()) {
          for (const format of IMAGE_FORMATS) {
            const body = await variantBuffer(originalPath, width, format)
            const variantRelative = rasterVariantSrc(placeholderSrc, width, format).slice(1)
            const outPath = path.join(outDir, variantRelative)
            await fs.mkdir(path.dirname(outPath), { recursive: true })
            await fs.writeFile(outPath, body)
          }
        }
      }
    }
  }
}

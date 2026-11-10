import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type IndexHtmlTransformContext, type Plugin } from 'vite'
import { applySeoHead } from './app/seo/head.ts'
import { buildLlmsFullTxt, buildLlmsTxt } from './app/seo/llms.ts'
import { getSeoForPath } from './app/seo/pages.ts'
import { buildSitemapXml, writePrerenderedApp, writeSeoBuild, writeSeoPublic } from './vite/seo-prerender.ts'
import { responsiveImagesPlugin } from './vite/responsive-images.ts'

const FONT_START = '<!--app-font-start-->'
const FONT_END = '<!--app-font-end-->'
const BODY_FONT = /outfit-latin-wght-normal.*\.woff2$/

function buildFontPreloadTag(href: string): string {
  return `${FONT_START}\n    <link rel="preload" href="${href}" as="font" type="font/woff2" crossorigin />\n    ${FONT_END}`
}

function applyFontPreload(html: string, href: string | null): string {
  const block = href ? buildFontPreloadTag(href) : `${FONT_START}\n    ${FONT_END}`

  if (html.includes(FONT_START) && html.includes(FONT_END)) {
    return html.replace(new RegExp(`${FONT_START}[\\s\\S]*?${FONT_END}`), block)
  }

  return html
}

function bodyFontHref(ctx: IndexHtmlTransformContext, base: string): string | null {
  const font = ctx.bundle ? Object.values(ctx.bundle).find((item) => item.type === 'asset' && BODY_FONT.test(item.fileName)) : undefined

  if (!font || font.type !== 'asset') {
    return null
  }

  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  return `${normalizedBase}${font.fileName}`
}

/**
 * The page is prerendered, so JavaScript is only needed for hydration. Moving the entry script and its
 * modulepreload links to the end of <body> with a low fetch priority keeps them from competing with the
 * stylesheet, font and hero content that the first paint depends on.
 */
function moveModuleScriptsToBody(html: string): string {
  const scripts = [...html.matchAll(/<script type="module"[^>]*><\/script>\n?/g)].map((match) => match[0].trim())
  const preloads = [...html.matchAll(/<link rel="modulepreload"[^>]*>\n?/g)].map((match) => match[0].trim())
  if (scripts.length === 0 && preloads.length === 0) return html

  let next = html
  for (const tag of [...scripts, ...preloads]) {
    next = next.replace(new RegExp(`[ \\t]*${tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\n?`), '')
  }

  const lowPriority = (tag: string, element: 'script' | 'link') =>
    tag.includes('fetchpriority=') ? tag : tag.replace(`<${element} `, `<${element} fetchpriority="low" `)
  const deferred = [...preloads.map((tag) => lowPriority(tag, 'link')), ...scripts.map((tag) => lowPriority(tag, 'script'))]

  return next.replace('</body>', `    ${deferred.join('\n    ')}\n  </body>`)
}

function fontPreloadPlugin(): Plugin {
  let base = '/'

  return {
    name: 'font-preload',
    configResolved(config) {
      base = config.base
    },
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        return moveModuleScriptsToBody(applyFontPreload(html, bodyFontHref(ctx, base)))
      }
    }
  }
}

function seoPlugin(): Plugin {
  let publicDir = ''
  let outDir = ''

  return {
    name: 'seo-prerender',
    configResolved(config) {
      publicDir = config.publicDir
      outDir = path.resolve(config.root, config.build.outDir)
    },
    configureServer(server) {
      writeSeoPublic(publicDir)

      server.middlewares.use((request, response, next) => {
        const url = request.url?.split('?')[0]

        if (url === '/sitemap.xml') {
          response.setHeader('Content-Type', 'application/xml; charset=utf-8')
          response.end(buildSitemapXml('en'))
          return
        }

        if (url === '/nl/sitemap.xml') {
          response.setHeader('Content-Type', 'application/xml; charset=utf-8')
          response.end(buildSitemapXml('nl'))
          return
        }

        if (url === '/llms.txt') {
          response.setHeader('Content-Type', 'text/plain; charset=utf-8')
          response.end(buildLlmsTxt())
          return
        }

        if (url === '/llms-full.txt') {
          response.setHeader('Content-Type', 'text/plain; charset=utf-8')
          response.end(buildLlmsFullTxt())
          return
        }

        next()
      })
    },
    transformIndexHtml(html) {
      return applySeoHead(html, getSeoForPath('/'))
    },
    buildStart() {
      writeSeoPublic(publicDir)
    },
    async closeBundle() {
      if (process.env.HWC_PRERENDER === '1') {
        return
      }

      writeSeoBuild(outDir)

      process.env.HWC_PRERENDER = '1'
      const { createServer } = await import('vite')
      const vite = await createServer({
        // Its own cache and no WebSocket, so a build also works while the dev server is running.
        server: { middlewareMode: true, hmr: false, ws: false, watch: null },
        cacheDir: 'node_modules/.vite-prerender',
        optimizeDeps: { noDiscovery: true, include: [] },
        appType: 'custom',
        mode: 'production'
      })

      try {
        const { render } = (await vite.ssrLoadModule('/app/entry-server.tsx')) as {
          render: (url: string) => Promise<string>
        }
        await writePrerenderedApp(outDir, render)
      } finally {
        await vite.close()
        delete process.env.HWC_PRERENDER
      }
    }
  }
}

export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss(), responsiveImagesPlugin(), seoPlugin(), fontPreloadPlugin()],
  resolve: {
    alias: {
      '~': path.resolve(import.meta.dirname, 'app')
    }
  }
})

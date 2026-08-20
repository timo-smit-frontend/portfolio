export const SITE_IMAGE_TITLE = 'Timo Smit'
export const SITE_IMAGE_ALT = 'Portrait of Timo Smit'

type ImageCopy = { title: string; alt: string }

const IMAGE_COPY: Record<string, ImageCopy> = {
  '/images/timosmit.webp': { title: SITE_IMAGE_TITLE, alt: SITE_IMAGE_ALT }
}

function normalizeSrc(src: string) {
  return src.startsWith('/public/') ? src.slice('/public'.length) : src
}

export function imageCopyFor(src: string): ImageCopy | undefined {
  return IMAGE_COPY[normalizeSrc(src)]
}

export function imageTitleFor(src: string): string | undefined {
  return imageCopyFor(src)?.title
}

export function imageAltFor(src: string): string | undefined {
  return imageCopyFor(src)?.alt
}

export function resolveImageAlt(src: string, alt?: string) {
  if (alt != null) return alt
  return imageAltFor(src) ?? ''
}

export function resolveImageTitle(src: string, title?: string, alt?: string) {
  if (title != null) return title || undefined
  return imageTitleFor(src) ?? (alt || undefined)
}

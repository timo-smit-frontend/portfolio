export const SITE_URL = 'https://www.timosmit.dev'
export const SITE_NAME = 'Timo Smit'
export const SITE_IMAGE = '/images/timosmit.webp'
export const SITE_THEME_COLOR = '#061A1E'
export const LINKEDIN_URL = 'https://www.linkedin.com/in/timo-smit-09983b14a/'

export function normalizePath(pathname: string): string {
  const path = pathname.split('?')[0]?.split('#')[0] ?? '/'
  if (path.length > 1 && path.endsWith('/')) {
    return path.slice(0, -1)
  }
  return path || '/'
}

export function isCurrentPath(pathname: string, href: string): boolean {
  const current = normalizePath(pathname)
  const target = normalizePath(href)

  if (target === '/' || target === '/nl') return current === target
  return current === target || current.startsWith(`${target}/`)
}

export function canonicalUrl(path: string): string {
  const normalized = normalizePath(path)
  return normalized === '/' ? `${SITE_URL}/` : `${SITE_URL}${normalized}/`
}

export function toAbsoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

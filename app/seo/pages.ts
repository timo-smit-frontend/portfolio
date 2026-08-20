import { canonicalUrl, normalizePath, SITE_DESCRIPTION, SITE_NAME, toAbsoluteUrl } from './site'

export type SeoPage = {
  path: string
  title: string
  description: string
  image: string
  imageAlt: string
  type: 'website' | 'product'
  robots: string
  canonical: string | null
  jsonLd: Record<string, unknown>
}

const homePage: SeoPage = {
  path: '/',
  title: `${SITE_NAME} | Front-end Developer`,
  description: SITE_DESCRIPTION,
  image: toAbsoluteUrl('/images/hero.jpg'),
  imageAlt: SITE_NAME,
  type: 'website',
  robots: 'index, follow',
  canonical: canonicalUrl('/'),
  jsonLd: { '@context': 'https://schema.org', '@graph': [] }
}

export function getSeoForPath(pathname: string): SeoPage {
  const path = normalizePath(pathname)

  if (path === '/404') {
    return {
      ...homePage,
      path,
      title: `${SITE_NAME} | Page not found`,
      description: 'This page does not exist or has been moved.',
      robots: 'noindex, nofollow',
      canonical: null
    }
  }

  return { ...homePage, path, canonical: canonicalUrl(path) }
}

export function getIndexableSeoPages(): SeoPage[] {
  return []
}

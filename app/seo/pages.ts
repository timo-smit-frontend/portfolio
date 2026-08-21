import { SITE_IMAGE_ALT } from '../services/imageCopy'
import { LINKEDIN_URL, SITE_DESCRIPTION, SITE_IMAGE, SITE_NAME, SITE_URL, canonicalUrl, normalizePath, toAbsoluteUrl } from './site'

export type LcpImage = {
  src: string
  maxWidth: number
  sizes: string
}

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
  lcp?: LcpImage
}

const PERSON_ID = `${SITE_URL}/#person`
const WEBSITE_ID = `${SITE_URL}/#website`

function titleWithBrand(pageTitle: string): string {
  return `${pageTitle} | ${SITE_NAME}`
}

function serializeJsonLdGraph(graph: Array<Record<string, unknown>>): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': graph
  }
}

function personNode(): Record<string, unknown> {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: SITE_NAME,
    jobTitle: 'Front-end Developer',
    url: SITE_URL,
    image: toAbsoluteUrl(SITE_IMAGE),
    sameAs: [LINKEDIN_URL]
  }
}

function websiteNode(): Record<string, unknown> {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'en-GB',
    publisher: { '@id': PERSON_ID }
  }
}

function webPageNode({
  path,
  title,
  description,
  type = 'WebPage',
  dateModified
}: {
  path: string
  title: string
  description: string
  type?: string
  dateModified?: string
}): Record<string, unknown> {
  const url = canonicalUrl(path)

  return {
    '@type': type,
    '@id': `${url}#webpage`,
    url,
    name: title,
    description,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': PERSON_ID },
    ...(dateModified ? { dateModified } : {})
  }
}

function page({
  path,
  title,
  description,
  image = SITE_IMAGE,
  imageAlt = SITE_IMAGE_ALT,
  type = 'website',
  robots = 'index, follow',
  extraGraph = [],
  webPageType,
  dateModified,
  lcp
}: {
  path: string
  title: string
  description: string
  image?: string
  imageAlt?: string
  type?: 'website' | 'product'
  robots?: string
  extraGraph?: Array<Record<string, unknown>>
  webPageType?: string
  dateModified?: string
  lcp?: LcpImage
}): SeoPage {
  return {
    path,
    title,
    description,
    image: toAbsoluteUrl(image),
    imageAlt,
    type,
    robots,
    canonical: robots.includes('noindex') ? null : canonicalUrl(path),
    lcp,
    jsonLd: serializeJsonLdGraph(
      robots.includes('noindex')
        ? [personNode(), websiteNode()]
        : [
            personNode(),
            websiteNode(),
            webPageNode({
              path,
              title,
              description,
              type: webPageType ?? (type === 'product' ? 'ItemPage' : 'WebPage'),
              dateModified
            }),
            ...extraGraph
          ]
    )
  }
}

function notFoundPage(path: string): SeoPage {
  return page({
    path,
    title: titleWithBrand('Page not found'),
    description: 'This page does not exist or has been moved.',
    robots: 'noindex, nofollow'
  })
}

export function getSeoForPath(pathname: string): SeoPage {
  const path = normalizePath(pathname)

  if (path === '/') {
    return page({
      path,
      title: `${SITE_NAME} | Front-end Developer`,
      description: SITE_DESCRIPTION
    })
  }

  if (path === '/experience') {
    return page({
      path,
      title: titleWithBrand('Experience'),
      description: 'Front-end work at UBO Agency, Capgemini, Accent Interactive, and SmartHOTEL.',
      webPageType: 'WebPage'
    })
  }

  if (path === '/education') {
    return page({
      path,
      title: titleWithBrand('Education'),
      description: 'CMD, accessibility, consultancy, and React / Next.js.',
      webPageType: 'WebPage'
    })
  }

  if (path === '/contact') {
    return page({
      path,
      title: titleWithBrand('Contact'),
      description: 'Send Timo Smit a message about work, accessibility, or a project.',
      webPageType: 'ContactPage'
    })
  }

  return notFoundPage(path)
}

export function getIndexableSeoPages(): SeoPage[] {
  return [getSeoForPath('/'), getSeoForPath('/experience'), getSeoForPath('/education'), getSeoForPath('/contact')]
}

import { LOCALES, LOCALE_META, localeFromPath, seoPath, stripLocale, type Locale } from '../i18n/locale'
import { messages } from '../i18n/messages'
import { LINKEDIN_URL, SITE_IMAGE, SITE_NAME, SITE_URL, canonicalUrl, normalizePath, toAbsoluteUrl } from './site'

export type LcpImage = {
  src: string
  maxWidth: number
  sizes: string
}

export type SeoAlternate = {
  hrefLang: string
  href: string
}

export type SeoPage = {
  path: string
  locale: Locale
  htmlLang: string
  ogLocale: string
  title: string
  description: string
  image: string
  imageAlt: string
  type: 'website' | 'product'
  robots: string
  canonical: string | null
  alternates: SeoAlternate[]
  jsonLd: Record<string, unknown>
  lcp?: LcpImage
}

const PERSON_ID = `${SITE_URL}/#person`
const WEBSITE_ID = `${SITE_URL}/#website`
const INDEXABLE_PAGES = ['/', '/experience', '/education', '/contact'] as const

function titleWithBrand(pageTitle: string): string {
  return `${pageTitle} | ${SITE_NAME}`
}

function serializeJsonLdGraph(graph: Array<Record<string, unknown>>): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': graph
  }
}

function personNode(jobTitle: string): Record<string, unknown> {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: SITE_NAME,
    jobTitle,
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
    inLanguage: LOCALES.map((locale) => LOCALE_META[locale].html),
    publisher: { '@id': PERSON_ID }
  }
}

function webPageNode({
  path,
  title,
  description,
  inLanguage,
  type = 'WebPage',
  dateModified
}: {
  path: string
  title: string
  description: string
  inLanguage: string
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
    inLanguage,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': PERSON_ID },
    ...(dateModified ? { dateModified } : {})
  }
}

function alternateLinks(page: string): SeoAlternate[] {
  const locales = LOCALES.map((locale) => ({
    hrefLang: LOCALE_META[locale].hrefLang,
    href: canonicalUrl(seoPath(page, locale))
  }))

  return [...locales, { hrefLang: 'x-default', href: canonicalUrl(seoPath(page, 'en')) }]
}

function page({
  path,
  locale,
  title,
  description,
  image = SITE_IMAGE,
  type = 'website',
  robots = 'index, follow',
  extraGraph = [],
  webPageType,
  dateModified,
  lcp
}: {
  path: string
  locale: Locale
  title: string
  description: string
  image?: string
  type?: 'website' | 'product'
  robots?: string
  extraGraph?: Array<Record<string, unknown>>
  webPageType?: string
  dateModified?: string
  lcp?: LcpImage
}): SeoPage {
  const meta = LOCALE_META[locale]
  const t = messages[locale]
  const noindex = robots.includes('noindex')

  return {
    path,
    locale,
    htmlLang: meta.html,
    ogLocale: meta.og,
    title,
    description,
    image: toAbsoluteUrl(image),
    imageAlt: t.image.alt,
    type,
    robots,
    canonical: noindex ? null : canonicalUrl(path),
    alternates: noindex ? [] : alternateLinks(stripLocale(path)),
    lcp,
    jsonLd: serializeJsonLdGraph(
      noindex
        ? [personNode(t.seo.jobTitle), websiteNode()]
        : [
            personNode(t.seo.jobTitle),
            websiteNode(),
            webPageNode({
              path,
              title,
              description,
              inLanguage: meta.html,
              type: webPageType ?? (type === 'product' ? 'ItemPage' : 'WebPage'),
              dateModified
            }),
            ...extraGraph
          ]
    )
  }
}

function notFoundPage(path: string, locale: Locale): SeoPage {
  const t = messages[locale]
  return page({
    path,
    locale,
    title: titleWithBrand(t.seo.notFoundTitle),
    description: t.seo.notFoundDescription,
    robots: 'noindex, nofollow'
  })
}

export function getSeoForPath(pathname: string): SeoPage {
  const path = normalizePath(pathname)
  const locale = localeFromPath(path)
  const pageKey = stripLocale(path)
  const localizedPath = seoPath(pageKey, locale)
  const t = messages[locale]

  if (pageKey === '/') {
    return page({
      path: localizedPath,
      locale,
      title: t.seo.homeTitle,
      description: t.seo.homeDescription
    })
  }

  if (pageKey === '/experience') {
    return page({
      path: localizedPath,
      locale,
      title: titleWithBrand(t.seo.experienceTitle),
      description: t.seo.experienceDescription
    })
  }

  if (pageKey === '/education') {
    return page({
      path: localizedPath,
      locale,
      title: titleWithBrand(t.seo.educationTitle),
      description: t.seo.educationDescription
    })
  }

  if (pageKey === '/contact') {
    return page({
      path: localizedPath,
      locale,
      title: titleWithBrand(t.seo.contactTitle),
      description: t.seo.contactDescription,
      webPageType: 'ContactPage'
    })
  }

  return notFoundPage(path, locale)
}

export function getIndexableSeoPages(locale?: Locale): SeoPage[] {
  const pages = LOCALES.flatMap((item) => INDEXABLE_PAGES.map((pageKey) => getSeoForPath(seoPath(pageKey, item))))
  return locale ? pages.filter((item) => item.locale === locale) : pages
}

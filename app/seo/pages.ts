import { LOCALES, LOCALE_META, localeFromPath, seoPath, stripLocale, type Locale } from '../i18n/locale.ts'
import { messages } from '../i18n/messages.ts'
import {
  ALMA_MATER,
  CERTIFICATES,
  EMPLOYER,
  SIDE_BUSINESS,
  KNOWS_ABOUT,
  LINKEDIN_URL,
  OG_IMAGE,
  PERSON_IMAGE,
  ROBOTS_INDEX,
  SITE_NAME,
  SITE_URL,
  canonicalUrl,
  normalizePath,
  toAbsoluteUrl
} from './site.ts'

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
  imageWidth: number
  imageHeight: number
  imageType: string
  imageAlt: string
  type: 'website' | 'product' | 'profile'
  robots: string
  canonical: string | null
  alternates: SeoAlternate[]
  jsonLd: Record<string, unknown>
  lcp?: LcpImage
}

const PERSON_ID = `${SITE_URL}/#person`
const WEBSITE_ID = `${SITE_URL}/#website`
const SIDE_BUSINESS_ID = `${SITE_URL}/#hello-world-cards`
const INDEXABLE_PAGES = ['/', '/about', '/experience', '/education', '/contact'] as const

function titleWithBrand(pageTitle: string): string {
  return `${pageTitle} | ${SITE_NAME}`
}

function serializeJsonLdGraph(graph: Array<Record<string, unknown>>): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': graph
  }
}

function personNode(locale: Locale): Record<string, unknown> {
  const t = messages[locale]

  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: SITE_NAME,
    givenName: 'Timo',
    familyName: 'Smit',
    jobTitle: t.seo.jobTitle,
    description: t.seo.homeDescription,
    url: `${SITE_URL}/`,
    image: {
      '@type': 'ImageObject',
      url: toAbsoluteUrl(PERSON_IMAGE),
      width: 400,
      height: 400
    },
    worksFor: {
      '@type': 'Organization',
      name: EMPLOYER.name,
      url: EMPLOYER.url
    },
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: ALMA_MATER.name,
      alternateName: ALMA_MATER.alternateName,
      url: ALMA_MATER.url
    },
    hasCredential: [
      {
        '@type': 'EducationalOccupationalCredential',
        name: 'Bachelor of Communication and Multimedia Design',
        credentialCategory: 'degree',
        educationalLevel: 'Bachelor (HBO)',
        recognizedBy: { '@type': 'CollegeOrUniversity', name: ALMA_MATER.name },
        dateCreated: '2023'
      },
      ...CERTIFICATES.map((certificate) => ({
        '@type': 'EducationalOccupationalCredential',
        name: certificate.name,
        credentialCategory: 'certificate',
        recognizedBy: { '@type': 'Organization', name: certificate.issuer },
        dateCreated: certificate.year
      }))
    ],
    knowsAbout: [...KNOWS_ABOUT],
    knowsLanguage: [
      { '@type': 'Language', name: 'Dutch', alternateName: 'nl' },
      { '@type': 'Language', name: 'English', alternateName: 'en' }
    ],
    nationality: { '@type': 'Country', name: 'Netherlands' },
    address: { '@type': 'PostalAddress', addressLocality: 'Utrecht', addressRegion: 'Utrecht', addressCountry: 'NL' },
    homeLocation: {
      '@type': 'Place',
      name: 'Utrecht, the Netherlands',
      address: { '@type': 'PostalAddress', addressLocality: 'Utrecht', addressCountry: 'NL' }
    },
    sameAs: [LINKEDIN_URL]
  }
}

function sideBusinessNode(): Record<string, unknown> {
  return {
    '@type': 'Organization',
    '@id': SIDE_BUSINESS_ID,
    name: SIDE_BUSINESS.name,
    url: SIDE_BUSINESS.url,
    description: SIDE_BUSINESS.description,
    founder: { '@id': PERSON_ID },
    foundingDate: '2026-09'
  }
}

function websiteNode(locale: Locale): Record<string, unknown> {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    description: messages[locale].seo.homeDescription,
    inLanguage: LOCALES.map((item) => LOCALE_META[item].html),
    publisher: { '@id': PERSON_ID },
    author: { '@id': PERSON_ID }
  }
}

function breadcrumbNode(path: string, locale: Locale, pageName: string): Record<string, unknown> {
  const url = canonicalUrl(path)

  return {
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: messages[locale].nav.home,
        item: canonicalUrl(seoPath('/', locale))
      },
      { '@type': 'ListItem', position: 2, name: pageName, item: url }
    ]
  }
}

function webPageNode({
  path,
  title,
  description,
  inLanguage,
  type = 'WebPage',
  dateModified,
  hasBreadcrumb
}: {
  path: string
  title: string
  description: string
  inLanguage: string
  type?: string
  dateModified?: string
  hasBreadcrumb: boolean
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
    ...(type === 'ProfilePage' ? { mainEntity: { '@id': PERSON_ID } } : {}),
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: toAbsoluteUrl(OG_IMAGE.src),
      width: OG_IMAGE.width,
      height: OG_IMAGE.height
    },
    ...(hasBreadcrumb ? { breadcrumb: { '@id': `${url}#breadcrumb` } } : {}),
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
  type = 'website',
  robots = ROBOTS_INDEX,
  extraGraph = [],
  webPageType,
  breadcrumbName,
  dateModified,
  lcp
}: {
  path: string
  locale: Locale
  title: string
  description: string
  type?: SeoPage['type']
  robots?: string
  extraGraph?: Array<Record<string, unknown>>
  webPageType?: string
  /** Name of the page in the breadcrumb trail; omit for the homepage. */
  breadcrumbName?: string
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
    image: toAbsoluteUrl(OG_IMAGE.src),
    imageWidth: OG_IMAGE.width,
    imageHeight: OG_IMAGE.height,
    imageType: OG_IMAGE.type,
    imageAlt: t.seo.ogImageAlt,
    type,
    robots,
    canonical: noindex ? null : canonicalUrl(path),
    alternates: noindex ? [] : alternateLinks(stripLocale(path)),
    lcp,
    jsonLd: serializeJsonLdGraph(
      noindex
        ? [personNode(locale), websiteNode(locale)]
        : [
            personNode(locale),
            websiteNode(locale),
            sideBusinessNode(),
            webPageNode({
              path,
              title,
              description,
              inLanguage: meta.html,
              type: webPageType ?? (type === 'product' ? 'ItemPage' : 'WebPage'),
              dateModified,
              hasBreadcrumb: Boolean(breadcrumbName)
            }),
            ...(breadcrumbName ? [breadcrumbNode(path, locale, breadcrumbName)] : []),
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
      description: t.seo.homeDescription,
      type: 'profile',
      webPageType: 'ProfilePage'
    })
  }

  if (pageKey === '/about') {
    return page({
      path: localizedPath,
      locale,
      title: titleWithBrand(t.seo.aboutTitle),
      description: t.seo.aboutDescription,
      webPageType: 'AboutPage',
      breadcrumbName: t.nav.about
    })
  }

  if (pageKey === '/experience') {
    return page({
      path: localizedPath,
      locale,
      title: titleWithBrand(t.seo.experienceTitle),
      description: t.seo.experienceDescription,
      breadcrumbName: t.nav.experience
    })
  }

  if (pageKey === '/education') {
    return page({
      path: localizedPath,
      locale,
      title: titleWithBrand(t.seo.educationTitle),
      description: t.seo.educationDescription,
      breadcrumbName: t.nav.education
    })
  }

  if (pageKey === '/contact') {
    return page({
      path: localizedPath,
      locale,
      title: titleWithBrand(t.seo.contactTitle),
      description: t.seo.contactDescription,
      webPageType: 'ContactPage',
      breadcrumbName: t.nav.contact
    })
  }

  return notFoundPage(path, locale)
}

export function getIndexableSeoPages(locale?: Locale): SeoPage[] {
  const pages = LOCALES.flatMap((item) => INDEXABLE_PAGES.map((pageKey) => getSeoForPath(seoPath(pageKey, item))))
  return locale ? pages.filter((item) => item.locale === locale) : pages
}

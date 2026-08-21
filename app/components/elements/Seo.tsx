import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { getSeoForPath } from '~/seo/pages'
import { SITE_NAME, SITE_THEME_COLOR } from '~/seo/site'

function upsertMeta(attribute: 'name' | 'property', key: string, content: string) {
  const selector = `meta[${attribute}="${key}"]`
  let element = document.head.querySelector<HTMLMetaElement>(selector)

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)
}

function upsertLink(rel: string, href: string | null) {
  const selector = `link[rel="${rel}"]:not([hreflang])`
  let element = document.head.querySelector<HTMLLinkElement>(selector)

  if (!href) {
    element?.remove()
    return
  }

  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', rel)
    document.head.appendChild(element)
  }

  element.setAttribute('href', href)
}

function upsertHreflang(alternates: Array<{ hrefLang: string; href: string }>) {
  document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((element) => element.remove())

  for (const alternate of alternates) {
    const link = document.createElement('link')
    link.rel = 'alternate'
    link.hreflang = alternate.hrefLang
    link.href = alternate.href
    document.head.appendChild(link)
  }
}

function upsertOgLocaleAlternates(values: string[]) {
  document.head.querySelectorAll('meta[property="og:locale:alternate"]').forEach((element) => element.remove())

  for (const content of values) {
    const meta = document.createElement('meta')
    meta.setAttribute('property', 'og:locale:alternate')
    meta.setAttribute('content', content)
    document.head.appendChild(meta)
  }
}

function upsertJsonLd(data: Record<string, unknown>) {
  const id = 'seo-jsonld'
  let element = document.head.querySelector<HTMLScriptElement>(`script#${id}`)

  if (!element) {
    element = document.createElement('script')
    element.id = id
    element.type = 'application/ld+json'
    document.head.appendChild(element)
  }

  element.textContent = JSON.stringify(data).replace(/</g, '\\u003c')
}

export default function Seo() {
  const { pathname } = useLocation()

  useEffect(() => {
    const seo = getSeoForPath(pathname)

    document.documentElement.lang = seo.htmlLang
    document.title = seo.title
    upsertMeta('name', 'description', seo.description)
    upsertMeta('name', 'robots', seo.robots)
    upsertMeta('name', 'theme-color', SITE_THEME_COLOR)
    upsertLink('canonical', seo.canonical)
    upsertHreflang(seo.alternates)
    upsertMeta('property', 'og:site_name', SITE_NAME)
    upsertMeta('property', 'og:locale', seo.ogLocale)
    upsertOgLocaleAlternates(
      seo.alternates
        .filter((alternate) => alternate.hrefLang !== 'x-default' && alternate.hrefLang !== seo.htmlLang)
        .map((alternate) => alternate.hrefLang.replace('-', '_'))
    )
    upsertMeta('property', 'og:type', seo.type)
    upsertMeta('property', 'og:title', seo.title)
    upsertMeta('property', 'og:description', seo.description)
    upsertMeta('property', 'og:image', seo.image)
    upsertMeta('property', 'og:image:alt', seo.imageAlt)
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', seo.title)
    upsertMeta('name', 'twitter:description', seo.description)
    upsertMeta('name', 'twitter:image', seo.image)
    upsertMeta('name', 'twitter:image:alt', seo.imageAlt)

    if (seo.canonical) {
      upsertMeta('property', 'og:url', seo.canonical)
    } else {
      document.head.querySelector('meta[property="og:url"]')?.remove()
    }

    upsertJsonLd(seo.jsonLd)
  }, [pathname])

  return null
}

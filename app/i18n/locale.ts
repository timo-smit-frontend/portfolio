import { normalizePath } from '../seo/site'

export const LOCALES = ['en', 'nl'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'
export const NL_SEGMENT = 'nl'

export const LOCALE_META: Record<
  Locale,
  {
    html: string
    og: string
    hrefLang: string
    label: string
  }
> = {
  en: { html: 'en-GB', og: 'en_GB', hrefLang: 'en-GB', label: 'EN' },
  nl: { html: 'nl-NL', og: 'nl_NL', hrefLang: 'nl-NL', label: 'NL' }
}

export function localeFromPath(pathname: string): Locale {
  const path = normalizePath(pathname)
  if (path === `/${NL_SEGMENT}` || path.startsWith(`/${NL_SEGMENT}/`)) {
    return 'nl'
  }
  return DEFAULT_LOCALE
}

export function stripLocale(pathname: string): string {
  const path = normalizePath(pathname)
  if (path === `/${NL_SEGMENT}`) return '/'
  if (path.startsWith(`/${NL_SEGMENT}/`)) {
    return path.slice(`/${NL_SEGMENT}`.length) || '/'
  }
  return path
}

export function localizePath(pathname: string, locale: Locale): string {
  const page = stripLocale(pathname)
  if (locale === DEFAULT_LOCALE) {
    return page === '/' ? '/' : `${page}/`
  }
  return page === '/' ? `/${NL_SEGMENT}/` : `/${NL_SEGMENT}${page}/`
}

export function seoPath(pathname: string, locale: Locale): string {
  const localized = localizePath(pathname, locale)
  return normalizePath(localized)
}

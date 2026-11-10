import { localizePath, type Locale } from '~/i18n/locale'

export const PATHS = {
  home: '/',
  about: '/about/',
  experience: '/experience/',
  education: '/education/',
  contact: '/contact/'
} as const

export function homePath(locale: Locale) {
  return localizePath(PATHS.home, locale)
}

export function contactPath(locale: Locale) {
  return localizePath(PATHS.contact, locale)
}

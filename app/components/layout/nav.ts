import { localizePath, type Locale } from '~/i18n/locale'
import { messages } from '~/i18n/messages'

export const PATHS = {
  home: '/',
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

export function primaryNav(locale: Locale) {
  const t = messages[locale]
  return [
    { title: t.nav.experience, to: localizePath(PATHS.experience, locale) },
    { title: t.nav.education, to: localizePath(PATHS.education, locale) }
  ]
}

export function footerNav(locale: Locale) {
  const t = messages[locale]
  return [...primaryNav(locale), { title: t.nav.contact, to: contactPath(locale) }]
}

import { useLocation } from 'react-router'
import { localeFromPath, localizePath, type Locale } from './locale'
import { messages } from './messages'

export function useLocale() {
  const { pathname } = useLocation()
  const locale = localeFromPath(pathname)

  return {
    locale,
    t: messages[locale],
    localize: (path: string) => localizePath(path, locale),
    switchTo: (next: Locale) => localizePath(pathname, next)
  }
}

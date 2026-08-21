import { LOCALES, seoPath } from '../i18n/locale'
import { messages } from '../i18n/messages'
import { getSeoForPath } from './pages'
import { SITE_NAME, canonicalUrl } from './site'

const PAGE_PATHS = ['/', '/experience', '/education', '/contact'] as const

function pageName(path: string): string {
  const seo = getSeoForPath(path)
  const stripped = seo.title.replace(` | ${SITE_NAME}`, '')
  if (stripped === seo.title) return 'Home'
  return stripped
}

export function buildLlmsTxt(): string {
  const pages = LOCALES.flatMap((locale) => {
    const label = locale === 'en' ? 'English' : 'Nederlands'
    const entries = PAGE_PATHS.map((path) => {
      const seo = getSeoForPath(seoPath(path, locale))
      return `- [${pageName(seo.path)}](${canonicalUrl(seo.path)}): ${seo.description}`
    })
    return [`## ${label}`, ...entries, '']
  })

  return [
    `# ${SITE_NAME}`,
    `> ${messages.en.seo.homeDescription}`,
    '',
    `${SITE_NAME} is a front-end developer at UBO Agency.`,
    '',
    '## Pages',
    ...pages
  ].join('\n')
}

export function buildLlmsFullTxt(): string {
  return buildLlmsTxt()
}

import { getSeoForPath } from './pages'
import { SITE_DESCRIPTION, SITE_NAME, canonicalUrl } from './site'

const PAGE_PATHS = ['/', '/experience', '/education', '/contact'] as const

function pageName(path: string): string {
  if (path === '/') return 'Home'
  return getSeoForPath(path).title.replace(` | ${SITE_NAME}`, '')
}

export function buildLlmsTxt(): string {
  const pages = PAGE_PATHS.map((path) => {
    const seo = getSeoForPath(path)
    return `- [${pageName(path)}](${canonicalUrl(path)}): ${seo.description}`
  })

  return [
    `# ${SITE_NAME}`,
    `> ${SITE_DESCRIPTION}`,
    '',
    `${SITE_NAME} is a front-end developer at UBO Agency.`,
    '',
    '## Pages',
    ...pages,
    ''
  ].join('\n')
}

export function buildLlmsFullTxt(): string {
  return buildLlmsTxt()
}

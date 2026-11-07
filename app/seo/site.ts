export const SITE_URL = 'https://www.timosmit.dev'
export const SITE_NAME = 'Timo Smit'
/** Social preview card (1200x630 JPEG, works on LinkedIn, X, Slack, WhatsApp). */
export const OG_IMAGE = { src: '/og-image.jpg', width: 1200, height: 630, type: 'image/jpeg' } as const
/** Portrait used for the Person entity in structured data. */
export const PERSON_IMAGE = '/images/timosmit-headshot.png'
export const SITE_THEME_COLOR = '#061A1E'
export const LINKEDIN_URL = 'https://www.linkedin.com/in/timo-smit-09983b14a/'
export const EMPLOYER = { name: 'UBO Agency', url: 'https://ubo.agency' } as const
export const ALMA_MATER = {
  name: 'Amsterdam University of Applied Sciences',
  alternateName: 'Hogeschool van Amsterdam',
  url: 'https://www.amsterdamuas.com'
} as const
export const SIDE_BUSINESS = {
  name: 'Hello World Cards',
  url: 'https://helloworldcards.com',
  description: 'One-person business in graded Pokémon cards, founded and built by Timo Smit.'
} as const
/** Topics the Person entity is known for; keep in line with the CV, experience and education copy. */
export const KNOWS_ABOUT = [
  'Front-end development',
  'Web accessibility',
  'WCAG',
  'ARIA',
  'Screen reader testing',
  'Keyboard accessibility',
  'React',
  'Next.js',
  'Remix',
  'TypeScript',
  'JavaScript',
  'GraphQL',
  'Tailwind CSS',
  'Design systems',
  'Design tokens',
  'Figma',
  'UX/UI design',
  'Vitest',
  'Playwright',
  'Web performance',
  'AI-assisted development'
] as const
/** Certificates from the CV. */
export const CERTIFICATES = [
  { name: 'Introduction to Web Accessibility (WAI0.1x)', issuer: 'W3C via edX', year: '2024' },
  { name: 'Creating Accessible Websites', issuer: 'Udemy', year: '2024' },
  { name: 'React - The Complete Guide', issuer: 'Udemy', year: '2024' },
  { name: 'Angular - The Complete Guide', issuer: 'Udemy', year: '2023' },
  { name: 'High-Impact Business Writing', issuer: 'Coursera', year: '2023' },
  { name: 'Figma for UX Design', issuer: 'LinkedIn Learning', year: '2021' }
] as const
export const ROBOTS_INDEX = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'

export function normalizePath(pathname: string): string {
  const path = pathname.split('?')[0]?.split('#')[0] ?? '/'
  if (path.length > 1 && path.endsWith('/')) {
    return path.slice(0, -1)
  }
  return path || '/'
}

export function isCurrentPath(pathname: string, href: string): boolean {
  const current = normalizePath(pathname)
  const target = normalizePath(href)

  if (target === '/' || target === '/nl') return current === target
  return current === target || current.startsWith(`${target}/`)
}

export function canonicalUrl(path: string): string {
  const normalized = normalizePath(path)
  return normalized === '/' ? `${SITE_URL}/` : `${SITE_URL}${normalized}/`
}

export function toAbsoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

import { EDUCATIONS } from '../database/educations.ts'
import { EXPERIENCES, type Period } from '../database/experiences.ts'
import { LOCALES, seoPath, type Locale } from '../i18n/locale.ts'
import { messages } from '../i18n/messages.ts'
import { getSeoForPath } from './pages.ts'
import { ALMA_MATER, CERTIFICATES, EMPLOYER, KNOWS_ABOUT, LINKEDIN_URL, SIDE_BUSINESS, SITE_NAME, SITE_URL, canonicalUrl } from './site.ts'

const PAGE_PATHS = ['/', '/experience', '/education', '/contact'] as const

function pageName(path: string): string {
  const seo = getSeoForPath(path)
  const stripped = seo.title.replace(` | ${SITE_NAME}`, '')
  if (stripped === seo.title) return 'Home'
  return stripped
}

/** Turns the small HTML subset used in the content files into Markdown. */
export function htmlToMarkdown(html: string): string {
  return html
    .replace(/<strong>(.*?)<\/strong>/gs, '**$1**')
    .replace(/<em>(.*?)<\/em>/gs, '_$1_')
    .replace(/<\/p>\s*<p>/g, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .trim()
}

function pageList(locale: Locale): string[] {
  return PAGE_PATHS.map((path) => {
    const seo = getSeoForPath(seoPath(path, locale))
    return `- [${pageName(seo.path)}](${canonicalUrl(seo.path)}): ${seo.description}`
  })
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatMonth(value: string): string {
  const [year, month] = value.split('-')
  return `${MONTHS[Number(month) - 1] ?? ''} ${year}`.trim()
}

export function formatPeriod(period?: Period): string {
  if (!period) return ''
  return `${formatMonth(period.start)} – ${period.end ? formatMonth(period.end) : 'present'}`
}

function keyFacts(): string[] {
  return [
    `- Name: ${SITE_NAME}`,
    `- Role: ${messages.en.seo.jobTitle} at [${EMPLOYER.name}](${EMPLOYER.url}) since January 2025; worked on more than 60 websites and web applications there, about half of them on his own, for clients including Casio, NTT DATA, Worldstream and Heinen & Hopman`,
    `- Before that: Front-end Developer (consultant) at Capgemini (Oct 2023 – Dec 2024), on accessibility for the Tweede Kamer der Staten-Generaal (Dutch House of Representatives) and on Project Enhance for the United Nations World Food Programme`,
    `- Side business: owner of [${SIDE_BUSINESS.name}](${SIDE_BUSINESS.url}) (since Sep 2026), graded Pokémon cards; he designs and builds its website and CMS himself in React and TypeScript on Cloudflare`,
    `- Based in: the Netherlands`,
    `- Education: Bachelor of Communication and Multimedia Design (HBO), ${ALMA_MATER.name} (${ALMA_MATER.alternateName}), 2019 – 2023, focused on UX/UI design and front-end development`,
    `- Skills: ${KNOWS_ABOUT.join(', ')}`,
    `- Certificates: ${CERTIFICATES.map((certificate) => `${certificate.name} (${certificate.issuer}, ${certificate.year})`).join('; ')}`,
    '- Languages: Dutch (native), English (fluent), French (basic)',
    `- Website: ${SITE_URL}/`,
    `- LinkedIn: ${LINKEDIN_URL}`,
    `- Contact: ${canonicalUrl('/contact')}`
  ]
}

export function buildLlmsTxt(): string {
  const pages = LOCALES.flatMap((locale) => {
    const label = locale === 'en' ? 'Pages (English)' : 'Pagina’s (Nederlands)'
    return [`## ${label}`, '', ...pageList(locale), '']
  })

  return [
    `# ${SITE_NAME}`,
    '',
    `> ${messages.en.seo.homeDescription}`,
    '',
    `${SITE_NAME} is a front-end developer with a creative background in Communication and Multimedia Design. He builds websites and web applications in React, Next.js, Remix and TypeScript, from reusable components and design systems to API integrations, and is the bridge between design and development so designs end up in code cleanly and accessibly. Client work includes Casio, Fairbanks, Movimento, Brouwer Metaal, IM Duurzaam and Profield at UBO Agency, and the Tweede Kamer der Staten-Generaal and the World Food Programme at Capgemini.`,
    '',
    '## Key facts',
    '',
    ...keyFacts(),
    '',
    ...pages,
    '## Optional',
    '',
    `- [Full profile in Markdown](${SITE_URL}/llms-full.txt): experience, projects and education in one file`,
    `- [Sitemap](${SITE_URL}/sitemap.xml)`,
    ''
  ].join('\n')
}

function experienceSection(): string[] {
  return EXPERIENCES.flatMap((experience) => {
    const heading = experience.link ? `### [${experience.title}](${experience.link})` : `### ${experience.title}`
    const meta = [experience.role?.en, experience.kind?.en, formatPeriod(experience.period)].filter(Boolean).join(' · ')
    const projects = (experience.projects ?? []).flatMap((project) => {
      const projectMeta = [project.role?.en, formatPeriod(project.period)].filter(Boolean).join(' · ')
      return [`#### ${project.title}`, '', ...(projectMeta ? [`_${projectMeta}_`, ''] : []), project.description.en, '']
    })

    return [heading, '', ...(meta ? [`_${meta}_`, ''] : []), experience.description.en, '', ...projects]
  })
}

function educationSection(): string[] {
  return Object.values(EDUCATIONS).flatMap((education) => [`### ${education.title.en}`, '', htmlToMarkdown(education.description.en), ''])
}

export function buildLlmsFullTxt(): string {
  return [
    `# ${SITE_NAME}: full profile`,
    '',
    `> ${messages.en.seo.homeDescription}`,
    '',
    `Source: ${SITE_URL}/ (also available in Dutch at ${canonicalUrl('/nl')}).`,
    '',
    '## Key facts',
    '',
    ...keyFacts(),
    '',
    `## Experience`,
    '',
    `Source: ${canonicalUrl('/experience')}`,
    '',
    ...experienceSection(),
    '## Education and skills',
    '',
    `Source: ${canonicalUrl('/education')}`,
    '',
    ...educationSection(),
    '### Certificates',
    '',
    ...CERTIFICATES.map((certificate) => `- ${certificate.name}, ${certificate.issuer} (${certificate.year})`),
    '',
    '## Contact',
    '',
    `Send a message through ${canonicalUrl('/contact')} or connect on LinkedIn: ${LINKEDIN_URL}`,
    ''
  ].join('\n')
}

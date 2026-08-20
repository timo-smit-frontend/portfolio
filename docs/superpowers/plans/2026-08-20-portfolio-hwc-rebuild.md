# Portfolio HWC Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace this repo with the Hello World Cards app architecture (minus shop), keeping portfolio copy, logos/favicon, and the full-viewport overlay banner, still deploying to GitHub Pages.

**Architecture:** Copy HWC Vite + React Router + Tailwind + SEO prerender into `app/`. Drop worker, products, agenda, Pokémon. Retarget chrome to Timo Smit. Home uses a new `BannerOverlay`; inner pages reuse HWC flex blocks. Contact posts to Web3Forms via an env key, never an email string.

**Tech Stack:** Vite 7, React 19, React Router 7, TypeScript, Tailwind 4, `@radix-ui/react-dialog`, morphicons, gh-pages. Source of HWC files: `/Users/timosmit/projects/personal/helloworldcards` (call this `$HWC` in every `cp`).

**Spec:** `docs/superpowers/specs/2026-08-20-portfolio-hwc-rebuild-design.md`

## Global Constraints

- Keep intro / experience / education copy verbatim. Do not invent LinkedIn copy.
- Keep `ts_logo.png`, `ts_logo_2.png`, `favicon.png`, company logos, education images, `timosmit.webp`.
- Home banner is full-viewport photo + TraitSwapper; trait color is `text-site-envy`.
- No products, agenda, Pokémon, Marktplaats, Instagram, Cloudflare Worker, Wrangler, GTM, or Clarity.
- No email address in repo, client bundle, or UI. Web3Forms key only: `import.meta.env.VITE_WEB3FORMS_ACCESS_KEY`.
- No `framer-motion`. No new test runner. Verify with `npx eslint` on touched files, then `npm run lint` and `npm run build`.
- Node `>=22`. App source lives in `app/` with `~` alias. ESLint forbids raw `<img>`; use `Image`.
- `SITE_URL = https://www.timosmit.dev`. Nav order: Experience → Education → Contact.
- Do not restyle the old `src/` tree; delete it in the last task.

## File structure

Copy unchanged from `$HWC` (do not invent replacements):

- `eslint.config.js`, `.prettierrc`, `.prettierignore`
- `tailwind.config.js`, `vite/seo-prerender.ts`, `vite/responsive-images.ts`, `vite.config.ts`
- `app/entry-server.tsx`, `app/root.tsx`, `app/vite-env.d.ts`
- `app/seo/head.ts`
- `app/services/utils.ts`, `app/services/responsiveImage.ts`
- `app/hooks/initialDocument.tsx`, `app/hooks/useInView.ts`, `app/hooks/useLocationFinder.ts`
- `app/components/elements/Image.tsx`, `Animated.tsx`, `Seo.tsx`, `SkipToMainContent.tsx`, `BurgerMenu.tsx`
- `app/components/layout/ScrollToTop.tsx`
- `app/components/flex/banner/BannerFigcaption.tsx`
- `app/components/flex/content/ContentText.tsx`, `ContentCta.tsx`
- `app/global.css`

Create / replace:

- `package.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` (no worker)
- `index.html` (no GTM)
- `.gitignore`, `.env.example`
- `app/main.tsx`, `app/app.tsx`
- `app/seo/site.ts`, `app/seo/pages.ts`, `app/seo/llms.ts`
- `app/services/contact.ts`, `app/services/imageCopy.ts`
- `app/components/elements/Logo.tsx`, `Breadcrumbs.tsx`, `TraitSwapper.tsx`
- `app/components/layout/Layout.tsx`, `Header.tsx`, `Footer.tsx`
- `app/components/flex/banner/BannerOverlay.tsx`
- `app/components/flex/content/ContentExperiences.tsx`, `ContentEducation.tsx`, `Accordion.tsx`
- `app/components/flex/form/FormContact.tsx`
- `app/database/experiences.ts`, `app/database/educations.ts`
- `app/routes/home.tsx`, `experience.tsx`, `education.tsx`, `contact.tsx`, `privacy.tsx`, `error.tsx`
- `public/robots.txt`, `public/CNAME`, `public/images/**` (moved assets)

Do not copy from `$HWC`: `worker/`, `wrangler.jsonc`, `tsconfig.worker.json`, products/agenda/about routes, `ContentProducts`, `ContentAgenda`, `ContentAbout`, `ContentFaq`, `Pokemon`, `Carousel`, `EnhanceImage`, `BannerCarousel`, `Mailing`, `app/database/products.ts`, `events.ts`, `faq.ts`.

---

### Task 1: HWC tooling scaffold and stub app

**Files:**

- Create: `package.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `index.html`, `app/main.tsx`, `app/app.tsx`, `app/root.tsx`, `app/entry-server.tsx`, `app/vite-env.d.ts`, `app/global.css`
- Copy: `eslint.config.js`, `.prettierrc`, `.prettierignore`, `tailwind.config.js`, `vite.config.ts`, `vite/seo-prerender.ts`, `vite/responsive-images.ts`
- Modify: `.gitignore`
- Delete later (not this task): old `src/` — leave it until Task 10 so copy is available

**Interfaces:**

- Consumes: `$HWC` files listed above
- Produces: Vite app with `~` → `app/`, `npm run dev` / `npm run build` scripts; stub `App` renders one heading

- [ ] **Step 1: Copy HWC config files**

```bash
HWC=/Users/timosmit/projects/personal/helloworldcards
cp "$HWC/eslint.config.js" eslint.config.js
cp "$HWC/.prettierrc" .prettierrc
cp "$HWC/.prettierignore" .prettierignore
cp "$HWC/tailwind.config.js" tailwind.config.js
mkdir -p vite app
cp "$HWC/vite.config.ts" vite.config.ts
cp "$HWC/vite/seo-prerender.ts" vite/seo-prerender.ts
cp "$HWC/vite/responsive-images.ts" vite/responsive-images.ts
cp "$HWC/app/entry-server.tsx" app/entry-server.tsx
cp "$HWC/app/root.tsx" app/root.tsx
cp "$HWC/app/vite-env.d.ts" app/vite-env.d.ts
cp "$HWC/app/global.css" app/global.css
```

- [ ] **Step 2: Write `tsconfig.json` (no worker)**

```json
{
  "files": [],
  "references": [{ "path": "./tsconfig.app.json" }, { "path": "./tsconfig.node.json" }]
}
```

Copy `tsconfig.app.json` and `tsconfig.node.json` from `$HWC` unchanged (`cp "$HWC/tsconfig.app.json" tsconfig.app.json` and the node file).

- [ ] **Step 3: Write `package.json`**

Keep the name `timosmit` and GitHub Pages deploy. Do not add wrangler, embla, or framer-motion.

```json
{
  "name": "timosmit",
  "private": true,
  "type": "module",
  "homepage": "https://www.timosmit.dev",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "dependencies": {
    "@fontsource-variable/outfit": "^5.3.0",
    "@radix-ui/react-dialog": "^1.1.23",
    "clsx": "^2.1.1",
    "lucide": "^1.31.0",
    "morphicons": "^1.7.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router": "^7.6.0",
    "tailwind-merge": "^3.3.0",
    "tw-animate-css": "^1.4.0"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3.3.1",
    "@eslint/js": "^9.39.0",
    "@tailwindcss/vite": "^4.1.0",
    "@types/node": "^26.2.0",
    "@types/react": "^19.2.0",
    "@types/react-dom": "^19.2.0",
    "@typescript-eslint/eslint-plugin": "^8.40.0",
    "@typescript-eslint/parser": "^8.40.0",
    "@vitejs/plugin-react": "^4.7.0",
    "eslint": "^9.39.0",
    "eslint-config-prettier": "^10.1.0",
    "eslint-plugin-jsx-a11y": "^6.10.2",
    "eslint-plugin-prettier": "^5.5.0",
    "eslint-plugin-react": "^7.37.5",
    "eslint-plugin-react-hooks": "^5.2.0",
    "gh-pages": "^6.1.0",
    "prettier": "^3.6.0",
    "sharp": "^0.35.3",
    "tailwindcss": "^4.1.0",
    "typescript": "^5.9.0",
    "vite": "^7.1.0"
  },
  "engines": {
    "node": ">=22.0.0"
  }
}
```

- [ ] **Step 4: Write stub `index.html` (no GTM)**

```html
<!doctype html>
<html lang="en-GB">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/images/favicon.png" type="image/png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!--app-font-start-->
    <!--app-font-end-->
    <!--app-lcp-start-->
    <!--app-lcp-end-->
    <script>
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    </script>
    <!--app-seo-start-->
    <title>Timo Smit | Front-end Developer</title>
    <meta name="description" content="The portfolio of Timo Smit, a front-end developer working at UBO Agency." />
    <!--app-seo-end-->
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/app/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Write stub `app/main.tsx` and `app/app.tsx`**

`app/main.tsx` — copy from `$HWC/app/main.tsx` unchanged.

`app/app.tsx` stub (SEO imports come in Task 3; until then keep this compiling):

```tsx
import { Route, Routes } from 'react-router'
import ScrollToTop from '~/components/layout/ScrollToTop'
import { InitialDocumentProvider } from '~/hooks/initialDocument'
import Root from '~/root'

function HomeStub() {
  return (
    <section className="section">
      <div className="container-full">
        <h1 className="title-l">Timo Smit</h1>
      </div>
    </section>
  )
}

export function App() {
  return (
    <>
      <ScrollToTop />
      <InitialDocumentProvider>
        <Routes>
          <Route element={<Root />}>
            <Route index element={<HomeStub />} />
          </Route>
        </Routes>
      </InitialDocumentProvider>
    </>
  )
}
```

This stub will not typecheck until Task 2 copies `ScrollToTop`, `InitialDocumentProvider`, and `Layout` (used by `root.tsx`). Do Task 2 in the same working tree immediately after this task’s copies, or finish Task 1 only after Task 2 files exist. **Implement Task 1 and Task 2 before running `npm run build`.**

- [ ] **Step 6: Replace `.gitignore`**

```
node_modules
dist
.DS_Store
.env
.env.*
!.env.example
*.local
.cache
.superpowers
query-error.json
.react-router
```

- [ ] **Step 7: Install**

```bash
npm install
```

Expected: lockfile updates, no wrangler.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json tsconfig.json tsconfig.app.json tsconfig.node.json eslint.config.js .prettierrc .prettierignore tailwind.config.js vite.config.ts vite index.html app .gitignore
git commit -m "$(cat <<'EOF'
chore: scaffold Hello World Cards tooling for the portfolio rebuild

EOF
)"
```

---

### Task 2: Shared primitives and layout shell

**Files:**

- Copy from `$HWC`: hooks, `Image`, `Animated`, `Seo`, `SkipToMainContent`, `BurgerMenu`, `ScrollToTop`, `utils.ts`, `responsiveImage.ts`
- Create: `app/components/layout/Layout.tsx` (no `Mailing`)
- Create stub: `app/components/layout/Header.tsx`, `Footer.tsx`, `app/components/elements/Logo.tsx`

**Interfaces:**

- Consumes: HWC `Layout` children API `{ children: ReactNode; className?: string }`
- Produces: `cn()`, `Image`, `Animated`, `Layout` wrapping skip + header + `<main id="main">` + footer

- [ ] **Step 1: Copy primitives**

```bash
HWC=/Users/timosmit/projects/personal/helloworldcards
mkdir -p app/hooks app/services app/components/elements app/components/layout
cp "$HWC/app/hooks/initialDocument.tsx" app/hooks/initialDocument.tsx
cp "$HWC/app/hooks/useInView.ts" app/hooks/useInView.ts
cp "$HWC/app/hooks/useLocationFinder.ts" app/hooks/useLocationFinder.ts
cp "$HWC/app/services/utils.ts" app/services/utils.ts
cp "$HWC/app/services/responsiveImage.ts" app/services/responsiveImage.ts
cp "$HWC/app/components/elements/Image.tsx" app/components/elements/Image.tsx
cp "$HWC/app/components/elements/Animated.tsx" app/components/elements/Animated.tsx
cp "$HWC/app/components/elements/Seo.tsx" app/components/elements/Seo.tsx
cp "$HWC/app/components/elements/SkipToMainContent.tsx" app/components/elements/SkipToMainContent.tsx
cp "$HWC/app/components/elements/BurgerMenu.tsx" app/components/elements/BurgerMenu.tsx
cp "$HWC/app/components/layout/ScrollToTop.tsx" app/components/layout/ScrollToTop.tsx
```

- [ ] **Step 2: Write stub `imageCopy.ts` so `Image` compiles**

`app/services/imageCopy.ts`:

```ts
export const SITE_IMAGE_TITLE = 'Timo Smit'
export const SITE_IMAGE_ALT = 'Portrait of Timo Smit'

type ImageCopy = { title: string; alt: string }

const IMAGE_COPY: Record<string, ImageCopy> = {
  '/images/timosmit.webp': { title: SITE_IMAGE_TITLE, alt: SITE_IMAGE_ALT }
}

function normalizeSrc(src: string) {
  return src.startsWith('/public/') ? src.slice('/public'.length) : src
}

export function imageCopyFor(src: string): ImageCopy | undefined {
  return IMAGE_COPY[normalizeSrc(src)]
}

export function imageTitleFor(src: string): string | undefined {
  return imageCopyFor(src)?.title
}

export function imageAltFor(src: string): string | undefined {
  return imageCopyFor(src)?.alt
}

export function resolveImageAlt(src: string, alt?: string) {
  if (alt != null) return alt
  return imageAltFor(src) ?? ''
}

export function resolveImageTitle(src: string, title?: string, alt?: string) {
  if (title != null) return title || undefined
  return imageTitleFor(src) ?? (alt || undefined)
}
```

- [ ] **Step 3: Write stub Logo, Header, Footer, Layout**

`app/components/elements/Logo.tsx`:

```tsx
import Image from '~/components/elements/Image'

export default function Logo({ className, variant = 'header' }: { className?: string; variant?: 'header' | 'footer' }) {
  const src = variant === 'footer' ? '/images/logo/ts_logo_2.png' : '/images/logo/ts_logo.png'

  return <Image src={src} alt="" width={300} height={300} className={className} />
}
```

`app/components/layout/Layout.tsx`:

```tsx
import { ReactNode } from 'react'
import SkipToMainContent from '~/components/elements/SkipToMainContent'
import Footer from '~/components/layout/Footer'
import Header from '~/components/layout/Header'
import { cn } from '~/services/utils'

export default function Layout({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SkipToMainContent />
      <Header />
      <main id="main" className={cn('flex flex-1 flex-col', className)} tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>
  )
}
```

Stub Header / Footer as empty landmarks so the shell builds; replace in Task 4:

```tsx
export default function Header() {
  return <header />
}
```

```tsx
export default function Footer() {
  return <footer />
}
```

- [ ] **Step 4: Lint and commit**

```bash
npx eslint app --max-warnings=0
git add app
git commit -m "$(cat <<'EOF'
feat: add shared HWC primitives and layout shell

EOF
)"
```

---

### Task 3: SEO for Timo Smit (no Store, no shop)

**Files:**

- Create: `app/seo/site.ts`, `app/seo/pages.ts`, `app/seo/llms.ts`
- Copy: `app/seo/head.ts` from `$HWC` if not already copied
- Modify: `app/app.tsx` — mount `<Seo />`
- Create: `public/robots.txt`

**Interfaces:**

- Consumes: `getSeoForPath(pathname: string): SeoPage`, `getIndexableSeoPages(): SeoPage[]` (same types as HWC `app/seo/pages.ts`)
- Produces: Person + WebSite graph; indexable paths `/`, `/experience`, `/education`, `/contact`, `/privacy`

- [ ] **Step 1: Write `app/seo/site.ts`**

```ts
export const SITE_URL = 'https://www.timosmit.dev'
export const SITE_NAME = 'Timo Smit'
export const SITE_LOCALE = 'en_GB'
export const SITE_DESCRIPTION = 'The portfolio of Timo Smit, a front-end developer working at UBO Agency.'
export const SITE_IMAGE = '/images/timosmit.webp'
export const SITE_THEME_COLOR = '#1c2030'
export const LINKEDIN_URL = 'https://www.linkedin.com/in/timo-smit-09983b14a/'

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

  if (target === '/') return current === '/'
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
```

- [ ] **Step 2: Write `app/seo/pages.ts`**

Keep HWC `SeoPage` / `LcpImage` types and `page()` helper, but:

- `organizationNode()` becomes `@type: 'Person'`, `@id: ${SITE_URL}/#person`, `name: SITE_NAME`, `jobTitle: 'Front-end Developer'`, `url: SITE_URL`, `image: toAbsoluteUrl(SITE_IMAGE)`, `sameAs: [LINKEDIN_URL]` imported from `~/seo/site`
- `websiteNode().publisher` points at that Person `@id`
- `webPageNode().about` points at the Person `@id`
- `getSeoForPath` handles `/`, `/experience`, `/education`, `/contact`, `/privacy`, else 404 `noindex`
- Home title: `Timo Smit | Front-end Developer`
- Home `lcp: { src: SITE_IMAGE, maxWidth: 1600, sizes: '100vw' }`
- `getIndexableSeoPages()` returns those five pages only
- Delete every product/agenda/faq/event helper

Experience / education / contact / privacy titles use `titleWithBrand(pageTitle)` → `${pageTitle} | Timo Smit`.

Descriptions:

- Experience: `Front-end work at UBO Agency, Capgemini, Accent Interactive, and SmartHOTEL.`
- Education: `Accessibility, consultancy, creative development, and React / Next.js.`
- Contact: `Send Timo Smit a message about work, accessibility, or a project.`
- Privacy: `How this portfolio handles the contact form.`

`webPageType`: AboutPage is not used. Experience and Education are `WebPage`. Privacy is `PrivacyPolicy`. Contact is `ContactPage`.

- [ ] **Step 3: Write `app/seo/llms.ts`**

```ts
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

  const privacy = getSeoForPath('/privacy')

  return [
    `# ${SITE_NAME}`,
    `> ${SITE_DESCRIPTION}`,
    '',
    `${SITE_NAME} is a front-end developer at UBO Agency.`,
    '',
    '## Pages',
    ...pages,
    '',
    '## Optional',
    `- [Privacy statement](${canonicalUrl('/privacy')}): ${privacy.description}`,
    ''
  ].join('\n')
}

export function buildLlmsFullTxt(): string {
  return buildLlmsTxt()
}
```

- [ ] **Step 4: Write `public/robots.txt`**

```
# AI agents: https://www.timosmit.dev/llms.txt

User-agent: *
Allow: /

Sitemap: https://www.timosmit.dev/sitemap.xml
```

- [ ] **Step 5: Mount Seo in `app/app.tsx`**

```tsx
import Seo from '~/components/elements/Seo'
```

Render `<Seo />` next to `<ScrollToTop />` like HWC.

- [ ] **Step 6: Commit**

```bash
npx eslint app/seo app/app.tsx --max-warnings=0
git add app/seo app/app.tsx public/robots.txt
git commit -m "$(cat <<'EOF'
feat: add Person SEO, sitemap, and llms.txt for the portfolio

EOF
)"
```

---

### Task 4: Header overlay, footer, breadcrumbs, assets

**Files:**

- Create: `app/components/layout/Header.tsx`, `Footer.tsx`, `app/components/elements/Breadcrumbs.tsx`
- Modify: `app/services/contact.ts` (LinkedIn constant only)
- Move: `public/assets/**` → `public/images/**`

**Interfaces:**

- Consumes: `isCurrentPath`, `SITE_NAME`, `LINKEDIN_URL`
- Produces: overlay header on `/` until `scrollY > 10`; solid header otherwise; footer menu Experience / Education / Contact; LinkedIn only

- [ ] **Step 1: Move images**

```bash
mkdir -p public/images/logo public/images/education
# banner, favicon, wordmarks
mv public/assets/timosmit.webp public/images/timosmit.webp
mv public/assets/favicon.png public/images/favicon.png
mv public/assets/ts_logo.png public/images/logo/ts_logo.png
mv public/assets/ts_logo_2.png public/images/logo/ts_logo_2.png
# company + education (keep filenames)
mv public/assets/logo/* public/images/logo/
mv public/assets/education/* public/images/education/
rmdir public/assets/logo public/assets/education public/assets 2>/dev/null || true
```

Write `public/CNAME` with exactly:

```
www.timosmit.dev
```

- [ ] **Step 2: Write `app/services/contact.ts`**

```ts
import { LINKEDIN_URL } from '~/seo/site'
import { isValidEmail } from './utils'

export { LINKEDIN_URL }

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'

export async function sendContactMessage({ name, email, message }: { name: string; email: string; message: string }) {
  if (!isValidEmail(email)) {
    throw new Error('Invalid email address')
  }

  const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY
  if (!accessKey) {
    throw new Error('Missing form key')
  }

  const response = await fetch(WEB3FORMS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      access_key: accessKey,
      name,
      email,
      message,
      subject: `Portfolio message from ${name}`
    })
  })

  const data = (await response.json()) as { success?: boolean | string; message?: string }

  if (!response.ok || data.success === false || data.success === 'false') {
    throw new Error(data.message ?? 'Failed to send message')
  }
}
```

`.env.example`:

```
VITE_WEB3FORMS_ACCESS_KEY=
```

Add to `app/vite-env.d.ts`:

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WEB3FORMS_ACCESS_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

- [ ] **Step 3: Write Breadcrumbs without products**

Copy `$HWC/app/components/elements/Breadcrumbs.tsx` and replace `PAGE_TITLES` + `crumbsFromPath` so products/agenda/about and `getProductBySlug` are gone:

```ts
const PAGE_TITLES: Record<string, string> = {
  experience: 'Experience',
  education: 'Education',
  contact: 'Contact',
  privacy: 'Privacy statement'
}

function crumbsFromPath(pathname: string): BreadcrumbItem[] {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === '/') return []

  const crumbs: BreadcrumbItem[] = [{ title: 'Home', url: '/' }]
  const segments = path.split('/').filter(Boolean)

  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1
    const url = `/${segments.slice(0, index + 1).join('/')}/`
    const title = PAGE_TITLES[segment] ?? segment
    crumbs.push(isLast ? { title } : { title, url })
  })

  return crumbs
}
```

Keep the HWC JSX for the `<nav aria-label="Breadcrumb">` list.

- [ ] **Step 4: Write Header**

Copy `$HWC/app/components/layout/Header.tsx` structure (Radix sheet, burger, `navLinkClass`, `mobileNavLinkClass`). Replace product/agenda/about links with:

```ts
const EXPERIENCE_URL = '/experience/'
const EDUCATION_URL = '/education/'
const CONTACT_URL = '/contact/'
```

Labels: Experience, Education, Contact. Same three links in desktop nav and `MobileNavLink`s.

Overlay behavior — replace the header `className` with:

```tsx
const isHome = location.pathname === '/'
const overlay = isHome && !isSticky

<header
  className={cn(
    'z-50 text-site-gray-nurse',
    overlay
      ? 'fixed inset-x-0 top-0 border-b border-transparent bg-transparent'
      : 'sticky top-0 border-b border-site-mulled-wine bg-site-dark/90 backdrop-blur-md',
    isHome && isSticky && 'fixed inset-x-0 top-0',
    isSticky && !menuOpen && 'shadow-sm',
    'smooth'
  )}
  aria-hidden={menuOpen ? true : undefined}
>
```

When `isHome && isSticky`, keep the solid HWC bar classes (`bg-site-dark/90`, border, blur) and `fixed` so the bar stays over the photo while scrolling the rest of the page.

Logo: `<Logo className="h-20 w-auto" />` (header variant). `sr-only` text is `SITE_NAME`.

- [ ] **Step 5: Write Footer**

Copy HWC footer grid. Menu:

```ts
const FOOTER_MENU = [
  { title: 'Experience', to: '/experience/' },
  { title: 'Education', to: '/education/' },
  { title: 'Contact', to: '/contact/' }
]
```

Logo: `<Logo variant="footer" className="h-auto w-40 sm:w-46 lg:w-54" />` linking to `/`.

Follow column: LinkedIn only (`LINKEDIN_URL`, `target="_blank"`, `rel="noreferrer noopener"`, sr-only new-tab text). No email column. No Instagram. No Marktplaats.

Legal: `© {new Date().getFullYear()} Timo Smit. All rights reserved.` plus Privacy `Link` to `/privacy/`.

- [ ] **Step 6: Lint, build if SEO stubs resolve, commit**

```bash
npx eslint app/components/layout app/components/elements/Breadcrumbs.tsx app/services/contact.ts --max-warnings=0
git add public app/components/layout app/components/elements/Breadcrumbs.tsx app/services/contact.ts app/vite-env.d.ts .env.example
git commit -m "$(cat <<'EOF'
feat: add overlay header, footer, and portfolio images

EOF
)"
```

---

### Task 5: HWC flex blocks

**Files:**

- Copy: `BannerFigcaption.tsx`, `ContentText.tsx`, `ContentCta.tsx` from `$HWC`

**Interfaces:**

- Consumes: existing HWC prop types for those three components
- Produces: reusable blocks for Home / Experience / Education / Privacy / Contact CTA

- [ ] **Step 1: Copy the three files**

```bash
HWC=/Users/timosmit/projects/personal/helloworldcards
mkdir -p app/components/flex/banner app/components/flex/content
cp "$HWC/app/components/flex/banner/BannerFigcaption.tsx" app/components/flex/banner/BannerFigcaption.tsx
cp "$HWC/app/components/flex/content/ContentText.tsx" app/components/flex/content/ContentText.tsx
cp "$HWC/app/components/flex/content/ContentCta.tsx" app/components/flex/content/ContentCta.tsx
```

- [ ] **Step 2: Lint and commit**

```bash
npx eslint app/components/flex --max-warnings=0
git add app/components/flex
git commit -m "$(cat <<'EOF'
feat: add HWC content and banner blocks

EOF
)"
```

---

### Task 6: Home — BannerOverlay, TraitSwapper, intro, CTA

**Files:**

- Create: `app/components/flex/banner/BannerOverlay.tsx`, `app/components/elements/TraitSwapper.tsx`, `app/routes/home.tsx`
- Modify: `app/app.tsx` — real Home route, lazy inner routes can wait

**Interfaces:**

- Consumes: `TraitSwapper` (no props), `BannerOverlay` with no required props
- Produces: Home page stack: overlay banner, intro `ContentText`, contact `ContentCta`

- [ ] **Step 1: Port TraitSwapper**

Copy `src/components/elements/TraitSwapper.tsx` into `app/components/elements/TraitSwapper.tsx`. Keep the trait list and type/erase / small-screen random behavior. Change the returned span to:

```tsx
return (
  <span id="trait-styling" className="text-site-envy">
    {displayedTrait}
  </span>
)
```

Remove unused `React` default import if ESLint flags it. Keep the 800px small-screen cutoff.

- [ ] **Step 2: Write `BannerOverlay`**

```tsx
import TraitSwapper from '~/components/elements/TraitSwapper'

export default function BannerOverlay() {
  return (
    <section id="banner-overlay" className="relative h-screen overflow-hidden bg-site-dark">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url("/images/timosmit.webp")' }}
        aria-hidden
      />
      <div className="relative flex h-full flex-col">
        <div className="container-full flex flex-1 items-center justify-center">
          <h1 className="title-l max-w-5xl text-center text-balance text-site-gray-nurse">
            <span className="sr-only">Timo Smit, Front-end Developer. </span>
            Timo Smit is a <TraitSwapper /> Front-end Developer!
          </h1>
        </div>
      </div>
    </section>
  )
}
```

Do not put the logo in this section; the overlay `Header` owns it.

- [ ] **Step 3: Write `app/routes/home.tsx`**

Intro copy must match the current site (three `<span>` paragraphs). `ContentText` takes a string `description`, not JSX. Use one string with spaces between the three paragraphs, or pass the first paragraph as `description` and the rest as `sections`. Spec: keep copy verbatim.

Use `sections` for paragraphs 2 and 3 so the first paragraph stays `description`:

- `title`: omit (Home `h1` is the banner). Do not pass `title` on this `ContentText`.
- `description`: the first intro paragraph (Hey everyone… accessibility at my core.)
- `sections`: two items with titles that are visually hidden? Spec says keep copy, not add headings. Better: put all three paragraphs into `description` as a single string with blank lines, and extend `ContentText` only if it cannot render line breaks.

`ContentText` renders `description` as one `<p>`. The current site uses three block spans. Change Home to three `ContentText` `sections` without extra titles by adding an optional `paragraphs?: string[]` prop.

**Do not fork a second intro component.** Add `paragraphs?: string[]` to `ContentText`:

```tsx
paragraphs?: string[]
```

When `paragraphs` is set, render:

```tsx
<div className="flex flex-col gap-4">
  {paragraphs.map((text) => (
    <p key={text.slice(0, 24)} className="content-l text-site-mantle">
      {text}
    </p>
  ))}
</div>
```

instead of the single `description` `<p>`. Home then:

```tsx
import BannerOverlay from '~/components/flex/banner/BannerOverlay'
import ContentCta from '~/components/flex/content/ContentCta'
import ContentText from '~/components/flex/content/ContentText'

export default function Home() {
  return (
    <>
      <BannerOverlay />
      <ContentText
        paragraphs={[
          'Hey everyone, welcome to my portfolio. I am a Front-end Developer currently working for UBO Agency. In june 2023 I finished my bachelor Communication and Multimedia Design at the University of Applied Sciences in Amsterdam. During my studies I became a UX/UI designer and a Front-end Developer in one. Making me a creative developer with user experience and accessibility at my core.',
          'After my studies I started working for Capgemini Netherlands B.V. for about a year. This is where I strenghtened my development and consultant skills. I got to work for clients like United Nations World Food Programme & Tweede Kamer der Staten-Generaal. Learning and consulting alot about React, Next but also accessibility and design.',
          "To me, coding is like putting together a puzzle, a challenging task that's intriguing to solve. Adding creativity and aiming to make something that brings happiness makes the whole process special. Creating something I like and seeing how it affects others is really satisfying."
        ]}
      />
      <ContentCta
        title="Want to know more about me?"
        description="Questions about work, accessibility, or a project? Send a message."
        image="/images/timosmit.webp"
        link={{ url: '/contact/', title: 'Get in touch' }}
      />
    </>
  )
}
```

Keep original spelling (`june`, `strenghtened`, `alot`). The old `<strong>` wrapping on company names is dropped only because `ContentText` paragraphs are plain text; wrap those names in `**`? Spec says verbatim. Use `dangerouslySetInnerHTML` on each paragraph with the original HTML from `src/components/ContentIntro.tsx` instead of plain strings.

Replace `paragraphs?: string[]` with `htmlParagraphs?: string[]` rendered as:

```tsx
{htmlParagraphs?.map((html) => (
  <div
    key={html.slice(0, 24)}
    className="content-l text-site-mantle"
    dangerouslySetInnerHTML={{ __html: html }}
  />
))}
```

Copy the three inner HTML strings from `src/components/ContentIntro.tsx` including `<strong>` tags.

- [ ] **Step 4: Point the index route at Home**

In `app/app.tsx`:

```tsx
import Home from '~/routes/home'
```

`<Route index element={<Home />} />`

- [ ] **Step 5: Lint and commit**

```bash
npx eslint app/routes/home.tsx app/components/flex/banner/BannerOverlay.tsx app/components/elements/TraitSwapper.tsx app/components/flex/content/ContentText.tsx --max-warnings=0
git add app/routes/home.tsx app/components/flex/banner/BannerOverlay.tsx app/components/elements/TraitSwapper.tsx app/components/flex/content/ContentText.tsx app/app.tsx
git commit -m "$(cat <<'EOF'
feat: add overlay home banner, intro, and contact CTA

EOF
)"
```

---

### Task 7: Experience page and accordion

**Files:**

- Create: `app/database/experiences.ts`, `app/components/flex/content/Accordion.tsx`, `app/components/flex/content/ContentExperiences.tsx`, `app/routes/experience.tsx`
- Modify: `app/app.tsx` — lazy `/experience`

**Interfaces:**

- Consumes: `EXPERIENCES: Experience[]` from `app/database/experiences.ts`
- Produces: `ContentExperiences` — one job open (`useState(0)`); nested project toggle independent

```ts
export type ExperienceProject = {
  image: string
  title: string
  role?: string
  period?: string
  width: number
  height: number
  description: string
}

export type Experience = {
  image: string
  title: string
  width: number
  height: number
  description: string
  link?: string
  projects?: ExperienceProject[]
}
```

- [ ] **Step 1: Port `src/data/Experiences.tsx` to `app/database/experiences.ts`**

Keep every string. Rewrite image paths `/assets/logo/` → `/images/logo/`. Export `EXPERIENCES` and the types above. Drop the default export if named is used.

- [ ] **Step 2: Write `Accordion` (no framer-motion)**

```tsx
import { ReactNode } from 'react'
import { cn } from '~/services/utils'

export default function Accordion({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <div className={cn('grid transition-[grid-template-rows] duration-300 ease-in-out', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
      <div className="overflow-hidden">{children}</div>
    </div>
  )
}
```

- [ ] **Step 3: Write `ContentExperiences`**

Port open/toggle logic from `src/components/ContentExperiences.tsx`. Restyle each job as:

```tsx
<li className="list-none overflow-hidden rounded-panel bg-site-gunmetal ring-1 ring-site-mulled-wine">
```

Job button: full width, logo via `Image` (`src={listItem.image}`, `width`, `height`, `alt={listItem.title}`, `className="bg-site-gray-nurse object-contain w-40 h-24 p-4"`), title `h2`/`h3` as in the current file (job title is `h3` because the page `h1` is the banner). Plus/minus text.

Nested Capgemini projects: same panel treatment one level in. `Visit website →` links keep `target="_blank"` `rel="noopener noreferrer"` and `className="link-underline text-site-envy"`.

- [ ] **Step 4: Write `app/routes/experience.tsx`**

```tsx
import BannerFigcaption from '~/components/flex/banner/BannerFigcaption'
import ContentExperiences from '~/components/flex/content/ContentExperiences'

export default function Experience() {
  return (
    <>
      <BannerFigcaption
        title="My professional front-end experiences"
        description="UBO Agency, Capgemini, Accent Interactive, and SmartHOTEL."
        image="/images/timosmit.webp"
      />
      <ContentExperiences />
    </>
  )
}
```

- [ ] **Step 5: Register lazy route**

```tsx
const Experience = lazy(() => import('~/routes/experience'))
```

```tsx
<Route path="experience" element={<Experience />} />
```

Wrap routes in `Suspense fallback={null}` like HWC.

- [ ] **Step 6: Lint and commit**

```bash
npx eslint app/database/experiences.ts app/components/flex/content/Accordion.tsx app/components/flex/content/ContentExperiences.tsx app/routes/experience.tsx app/app.tsx --max-warnings=0
git add app/database/experiences.ts app/components/flex/content/Accordion.tsx app/components/flex/content/ContentExperiences.tsx app/routes/experience.tsx app/app.tsx
git commit -m "$(cat <<'EOF'
feat: add experience page with HWC-styled accordion

EOF
)"
```

---

### Task 8: Education page and tabs

**Files:**

- Create: `app/database/educations.ts`, `app/components/flex/content/ContentEducation.tsx`, `app/routes/education.tsx`
- Modify: `app/app.tsx`

**Interfaces:**

- Consumes: `EDUCATIONS` object from current `src/data/Educations.tsx`
- Produces: tabbed panel, active tab envy/green, inactive gunmetal

- [ ] **Step 1: Port educations data**

Copy `src/data/Educations.tsx` to `app/database/educations.ts`. Replace `/assets/education/` with `/images/education/`. Keep HTML description strings verbatim.

- [ ] **Step 2: Write `ContentEducation`**

Port tab state from `src/components/ContentEducation.tsx`. Classes:

- Active tab: `button-green` (or `bg-site-envy text-site-dark`)
- Inactive: `bg-site-gunmetal text-site-gray-nurse`
- Panel: `rounded-panel bg-site-gunmetal p-8 ring-1 ring-site-mulled-wine grid md:grid-cols-2 gap-10`
- Description: keep `dangerouslySetInnerHTML`
- Image: `Image` with `src={education.image}`, `alt={`${education.title} Timo Smit`}`, `width={475}`, `height={317}`, `className="w-full h-full object-cover"`

Page `h1` is on `BannerFigcaption`, so tab panel titles stay `h2`/`h3`.

- [ ] **Step 3: Write `app/routes/education.tsx`**

```tsx
import BannerFigcaption from '~/components/flex/banner/BannerFigcaption'
import ContentEducation from '~/components/flex/content/ContentEducation'

export default function Education() {
  return (
    <>
      <BannerFigcaption
        title="Education"
        description="Accessibility, consultancy, creative development, and React / Next.js."
        image="/images/timosmit.webp"
      />
      <ContentEducation />
    </>
  )
}
```

- [ ] **Step 4: Lazy route `path="education"`**

- [ ] **Step 5: Lint and commit**

```bash
npx eslint app/database/educations.ts app/components/flex/content/ContentEducation.tsx app/routes/education.tsx app/app.tsx --max-warnings=0
git add app/database/educations.ts app/components/flex/content/ContentEducation.tsx app/routes/education.tsx app/app.tsx
git commit -m "$(cat <<'EOF'
feat: add education page with HWC tabs

EOF
)"
```

---

### Task 9: Contact, privacy, 404

**Files:**

- Create: `app/components/flex/form/FormContact.tsx`, `app/routes/contact.tsx`, `app/routes/privacy.tsx`, `app/routes/error.tsx`
- Modify: `app/app.tsx`

**Interfaces:**

- Consumes: `sendContactMessage`, `LINKEDIN_URL`
- Produces: contact form with no email in JSX; privacy `ContentText`; 404 without Pokémon

- [ ] **Step 1: Write `FormContact`**

Copy `$HWC/app/components/flex/form/FormContact.tsx`. Then:

- Delete `CONTACT_EMAIL`, Instagram, Marktplaats, `MailIcon` email link, `FormContactLinks` split variant’s email block.
- `FormContactLinks` renders one LinkedIn row (use the HWC Instagram icon SVG markup, label `LinkedIn`, `href={LINKEDIN_URL}`).
- Error live region: `Something went wrong. Try again later.` — no mailto.
- Success: `Thanks! I will get back to you soon.`
- Keep honeypot, validation hints, `sendContactMessage`.

- [ ] **Step 2: Write `app/routes/contact.tsx`**

```tsx
import FormContact from '~/components/flex/form/FormContact'

export default function Contact() {
  return (
    <FormContact
      title="Get in touch"
      description="Questions about work, accessibility, or a project? Send a message."
    />
  )
}
```

No FAQ block.

- [ ] **Step 3: Write `app/routes/privacy.tsx`**

```tsx
import ContentText from '~/components/flex/content/ContentText'

export default function Privacy() {
  return (
    <ContentText
      heading="h1"
      title="Privacy statement"
      description="This page says what happens when you visit timosmit.dev or send a message with the contact form."
      image="/images/timosmit.webp"
      updated="20 August 2026"
      sections={[
        {
          title: 'Who I am',
          body: <p>I am Timo Smit, a front-end developer. This site is my portfolio.</p>
        },
        {
          title: 'Messages you send',
          body: (
            <p>
              If you use the contact form, Web3Forms receives your name, email address, and message so I can reply. I do not sell that
              information or use it for ads. If you want a message deleted, say so in a new message and I will remove it.
            </p>
          )
        },
        {
          title: 'Cookies',
          body: (
            <p>
              This site does not set tracking cookies. The contact form is a POST to Web3Forms. You can use the site without sending a
              message.
            </p>
          )
        }
      ]}
    />
  )
}
```

- [ ] **Step 4: Write `app/routes/error.tsx`**

Copy `$HWC/app/routes/error.tsx` and delete the `Pokemon` import and JSX. Keep 404 title, “This page was not found”, “Back to home”.

- [ ] **Step 5: Register routes**

```tsx
const Contact = lazy(() => import('~/routes/contact'))
const Privacy = lazy(() => import('~/routes/privacy'))
const ErrorPage = lazy(() => import('~/routes/error'))
```

```tsx
<Route path="contact" element={<Contact />} />
<Route path="privacy" element={<Privacy />} />
```

Outside `Root`: `<Route path="*" element={<ErrorPage />} />`

- [ ] **Step 6: Lint and commit**

```bash
npx eslint app/components/flex/form/FormContact.tsx app/routes/contact.tsx app/routes/privacy.tsx app/routes/error.tsx app/app.tsx --max-warnings=0
git add app/components/flex/form/FormContact.tsx app/routes/contact.tsx app/routes/privacy.tsx app/routes/error.tsx app/app.tsx
git commit -m "$(cat <<'EOF'
feat: add contact form, privacy page, and 404

EOF
)"
```

---

### Task 10: Remove old app, verify, ship-ready build

**Files:**

- Delete: `src/`, old `vite.config.js` if still present, unused `tailwind` leftover, `dist/` regenerated
- Modify: `app/app.tsx` final route table

**Interfaces:**

- Consumes: all previous routes
- Produces: `npm run lint` and `npm run build` green; no old `src/`; no email/Instagram/Marktplaats in `app/`

- [ ] **Step 1: Final `app/app.tsx`**

Match HWC shape:

```tsx
import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'
import Seo from '~/components/elements/Seo'
import ScrollToTop from '~/components/layout/ScrollToTop'
import { InitialDocumentProvider } from '~/hooks/initialDocument'
import Root from '~/root'
import Home from '~/routes/home'

const Experience = lazy(() => import('~/routes/experience'))
const Education = lazy(() => import('~/routes/education'))
const Contact = lazy(() => import('~/routes/contact'))
const Privacy = lazy(() => import('~/routes/privacy'))
const ErrorPage = lazy(() => import('~/routes/error'))

export function App() {
  return (
    <>
      <ScrollToTop />
      <Seo />
      <InitialDocumentProvider>
        <Suspense fallback={null}>
          <Routes>
            <Route element={<Root />}>
              <Route index element={<Home />} />
              <Route path="experience" element={<Experience />} />
              <Route path="education" element={<Education />} />
              <Route path="contact" element={<Contact />} />
              <Route path="privacy" element={<Privacy />} />
            </Route>
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </Suspense>
      </InitialDocumentProvider>
    </>
  )
}
```

- [ ] **Step 2: Delete the old tree**

```bash
rm -rf src vite.config.js
```

Remove leftover portfolio-only configs that conflict (`env.d.ts` at repo root if it still points at the old app). Keep `docs/`.

- [ ] **Step 3: Lint and build**

```bash
npm run lint
npm run build
```

Expected: typecheck passes; `dist/index.html`, `dist/experience/index.html`, `dist/education/index.html`, `dist/contact/index.html`, `dist/privacy/index.html`, `dist/404.html` exist; `dist/sitemap.xml` lists those URLs on `https://www.timosmit.dev`.

- [ ] **Step 4: Constraint grep**

```bash
rg -n -i "instagram|marktplaats|helloworldcards@|formsubmit|framer-motion|googletagmanager|clarity" app public --glob '!public/images/**'
rg -n "@[a-z0-9.-]+\.(com|nl|dev)" app
```

Expected: no Instagram, Marktplaats, FormSubmit, GTM, Clarity, or personal email. `LINKEDIN_URL` is allowed. Web3Forms host `api.web3forms.com` is allowed.

```bash
rg -n "@" dist/assets/*.js
```

Expected: no `mailto:` and no personal inbox addresses. Web3Forms JSON keys may contain `email` as a field name.

- [ ] **Step 5: Manual smoke (dev)**

```bash
npm run dev
```

- `/` — photo full viewport, transparent nav, TraitSwapper types, nav solid after scroll
- `/experience/` — accordion, Capgemini nested projects, visit links
- `/education/` — four tabs
- `/contact/` — form validation; submit without key shows generic error
- `/privacy/` — three sections
- unknown URL — 404, back home
- Skip link focuses `#main`

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
refactor: remove the old Vite src tree after the HWC rebuild

EOF
)"
```

---

## Spec coverage

| Spec item | Task |
| --- | --- |
| HWC stack, `app/`, Tailwind tokens, no worker | 1 |
| Primitives, Image, Animated, Layout | 2 |
| Person SEO, sitemap, llms, no Store | 3 |
| Overlay header, footer, LinkedIn only, images | 4 |
| BannerFigcaption, ContentText, ContentCta | 5 |
| BannerOverlay, TraitSwapper, intro, CTA | 6 |
| Experience accordion + copy | 7 |
| Education tabs + copy | 8 |
| Contact Web3Forms, privacy, 404 | 9 |
| Delete old src, lint/build/grep | 10 |
| GitHub Pages `gh-pages` | 1 (`deploy` script) |
| No GTM / Instagram / email in source | 1, 4, 9, 10 |

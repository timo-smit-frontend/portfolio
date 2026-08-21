# Portfolio Growf Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle timosmit.dev in place to a Growf-like inner-card landing (white / dark green / gold) while keeping copy, routes, and GitHub Pages.

**Architecture:** Replace HWC color tokens and photo banners with `site-chrome` / `site-green` / `site-gold` utilities and stacked `rounded-4xl` cards. New Home blocks (`BannerHero`, `ContentLogos`, `ContentSelectedWork`, `ContentStory`) compose existing data. Inner pages use `BannerPage` plus restyled experience, education, contact, privacy, and 404.

**Tech Stack:** Vite, React 19, TypeScript, React Router, Tailwind v4, Outfit Variable, existing `Image` + SEO prerender. No new test runner; verification is `npm run lint` and `npm run build`.

## Global Constraints

- Keep intro / experience / education copy verbatim.
- Default SVG `Logo` only in the UI (no `variant="simplified"`).
- TraitSwapper behavior unchanged; trait color is gold.
- No email in source, UI, or built JS. LinkedIn only.
- No Growf fork, WebGL, Spline/LORE, GTM, Instagram, Marktplaats.
- Do not preload `timosmit.webp` as Home LCP.
- `SITE_THEME_COLOR` = `#07140F`.

## File map

- Modify: `tailwind.config.js` — new color tokens
- Modify: `app/global.css` — buttons, titles, inner-card, base, fields
- Create: `app/components/elements/SectionCard.tsx` — section + inner card shell
- Modify: `app/components/layout/Header.tsx` — gold CTA, chrome states
- Modify: `app/components/layout/Footer.tsx` — default logo, gold hovers
- Modify: `app/components/elements/TraitSwapper.tsx` — gold trait
- Modify: `app/components/elements/SkipToMainContent.tsx` — `button-gold`
- Create: `app/components/flex/banner/BannerHero.tsx`
- Create: `app/components/flex/banner/BannerPage.tsx`
- Create: `app/components/flex/content/ContentLogos.tsx`
- Create: `app/components/flex/content/ContentSelectedWork.tsx`
- Create: `app/components/flex/content/ContentStory.tsx`
- Modify: `app/components/flex/content/ContentCta.tsx` — green card, no photo
- Modify: `app/routes/home.tsx` — new block order
- Modify: `app/routes/experience.tsx`, `education.tsx`, `privacy.tsx`, `error.tsx`
- Modify: `app/components/flex/content/ContentExperiences.tsx`, `ContentEducation.tsx`, `ContentText.tsx`
- Modify: `app/components/flex/form/FormContact.tsx`
- Modify: `app/seo/site.ts`, `app/seo/pages.ts`
- Delete: `app/components/flex/banner/BannerOverlay.tsx`, `BannerFigcaption.tsx`

---

### Task 1: Tokens and layout utilities

**Files:**

- Modify: `tailwind.config.js`
- Modify: `app/global.css`
- Create: `app/components/elements/SectionCard.tsx`

- [ ] **Step 1: Replace HWC colors in `tailwind.config.js`**

Add tokens: `site-chrome` `#07140F`, `site-green` `#164A38`, `site-green-fg` `#F7F4EC`, `site-white` `#FFFFFF`, `site-white-fg` `#07140F`, `site-gold` `#E4B84A`, `site-gold-fg` `#07140F`, `site-gold-hover` `#C99A2E`. Keep `site-outfit`. Remove envy/gunmetal/mulled-wine/etc. from use (they may remain unused or be deleted).

- [ ] **Step 2: Update `app/global.css` utilities**

Replace `button-green` with `button-gold` and `button-gold-outline`. Add `title-landing` (`text-6xl sm:text-7xl md:text-8xl lg:text-9xl` tight tracking) and `title-section` (`text-2xl sm:text-3xl md:text-4xl lg:text-5xl`). Body `bg-site-chrome text-site-green-fg`. Focus and selection gold. Fields: white bg, chrome text, gold focus. `mobile-menu-hover` gold. Delete `mat` from use.

- [ ] **Step 3: Add `SectionCard`**

```tsx
export function SectionCard({
  tone,
  first = false,
  id,
  children,
  innerClassName
}: {
  tone: 'green' | 'white'
  first?: boolean
  id?: string
  children: ReactNode
  innerClassName?: string
}) {
  return (
    <section id={id} className={cn('pb-2', first && 'pt-2')}>
      <div className="container-full">
        <div
          className={cn(
            'overflow-clip rounded-4xl',
            tone === 'green' ? 'bg-site-green text-site-green-fg' : 'bg-site-white text-site-white-fg',
            innerClassName
          )}
        >
          {children}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Verify**

Run: `npx tsc -b --pretty false` after later tasks; this task is CSS/shell only.

---

### Task 2: Chrome (header, footer, skip, trait, theme)

**Files:**

- Modify: `app/components/layout/Header.tsx`
- Modify: `app/components/layout/Footer.tsx`
- Modify: `app/components/elements/TraitSwapper.tsx`
- Modify: `app/components/elements/SkipToMainContent.tsx`
- Modify: `app/seo/site.ts`
- Modify: `app/seo/pages.ts`

- [ ] **Step 1: Header**

Logo default. Nav: Experience, Education, Contact. Add gold `Link` **Get in touch** → `/contact/` (`button-gold`, hidden on small next to burger or shown on `lg+`). Overlay on Home when `scrollY ≤ 10`: `fixed` transparent cream text. Else: `sticky` (inner) or `fixed` (home after scroll) `bg-site-chrome/90 backdrop-blur-md`. Hovers/current: gold. Mobile sheet: `bg-site-chrome`. Include gold Get in touch in the sheet.

- [ ] **Step 2: Footer**

Default `Logo` (no simplified). `text-site-green-fg`. Hovers/current `text-site-gold`. Border `border-site-green`.

- [ ] **Step 3: TraitSwapper + skip + SEO**

Trait class `text-site-gold`. Skip link `button-gold`. `SITE_THEME_COLOR = '#07140F'`. Remove Home `lcp` from `getSeoForPath('/')`.

---

### Task 3: Home blocks

**Files:**

- Create: `app/components/flex/banner/BannerHero.tsx`
- Create: `app/components/flex/content/ContentLogos.tsx`
- Create: `app/components/flex/content/ContentSelectedWork.tsx`
- Create: `app/components/flex/content/ContentStory.tsx`
- Modify: `app/components/flex/content/ContentCta.tsx`
- Modify: `app/routes/home.tsx`

- [ ] **Step 1: BannerHero**

Green `SectionCard first`. Extra top padding for fixed header (`pt-28 lg:pt-32`). Kicker `Front-end developer at UBO Agency` (mono-style uppercase tracking optional, Outfit is fine). `h1` with sr-only `Timo Smit, Front-end Developer.` Visible: `Timo Smit is a <TraitSwapper /> Front-end Developer!` class `title-landing text-center`. Buttons: gold Get in touch `/contact/`, outline Experience `/experience/`.

- [ ] **Step 2: ContentLogos**

White card. Label `Companies I’ve done work for.` Logos in order from existing files:

1. `/images/logo/ubo.png` (310×163)
2. `/images/logo/capgemini.svg` (1024×239)
3. `/images/logo/wfp.webp` (360×167)
4. `/images/logo/tweede-kamer.jpg` (1200×339)
5. `/images/logo/accent-interactive.jpeg` (4500×1458)
6. `/images/logo/smart-hotel.jpg` (1000×215)

Decorative `alt` = company name. Horizontal wrap or row, object-contain, modest height.

- [ ] **Step 3: ContentSelectedWork**

Green card, heading `Selected work`. Three white nested tiles from `EXPERIENCES`: `[0]`, `[1].projects[0]`, `[1].projects[1]`. Each: logo, title, description, `Link` to `/experience/`.

- [ ] **Step 4: ContentStory**

White card. Three `htmlParagraphs` from current Home. Photo `/images/timosmit.webp` with `SITE_IMAGE_ALT`, no `priority`. `lg:grid-cols-2` text left photo right; stacked photo under text on small.

- [ ] **Step 5: ContentCta + home route**

Green card, no image. Title/description/link as now. Gold button. `home.tsx` renders Hero → Logos → SelectedWork → Story → Cta. Pass the three paragraphs into Story.

---

### Task 4: Inner pages

**Files:**

- Create: `app/components/flex/banner/BannerPage.tsx`
- Modify: `app/routes/experience.tsx`, `education.tsx`, `privacy.tsx`, `error.tsx`, `contact.tsx` (if needed)
- Modify: `ContentExperiences.tsx`, `ContentEducation.tsx`, `ContentText.tsx`, `FormContact.tsx`

- [ ] **Step 1: BannerPage**

Green `SectionCard first`. Breadcrumbs cream. `h1` `title-section`. Description `content-l`. Padding `px-6 py-16 sm:px-10 lg:px-16 lg:py-20`.

- [ ] **Step 2: Experience**

`BannerPage` with existing title/description (no photo). `ContentExperiences` in a green `SectionCard` wrapping white accordion tiles. Gold open accent and Visit website links. Same accordion behavior.

- [ ] **Step 3: Education**

`BannerPage` existing copy. Tabs: active `button-gold`, inactive `button-gold-outline`. White panel, two columns, images unchanged.

- [ ] **Step 4: Contact**

Do not duplicate `BannerPage` if FormContact already has `h1`. Wrap page in green chrome: white form card, gold submit, fields on white. LinkedIn hover gold. Keep validation/Web3Forms.

- [ ] **Step 5: Privacy**

`ContentText` as white legal card (or BannerPage + white body). Remove `image` prop. Gold link hover. Keep sections/copy/`updated`.

- [ ] **Step 6: 404**

Chrome background, gold `404`, cream title, gold Back to home.

---

### Task 5: Delete old banners and sweep tokens

**Files:**

- Delete: `BannerOverlay.tsx`, `BannerFigcaption.tsx`
- Sweep remaining `button-green`, `site-envy`, `BannerOverlay` in `app/`

- [ ] **Step 1: Delete unused banner files after imports are gone**

- [ ] **Step 2: Replace leftover HWC classes in app source**

- [ ] **Step 3: Run `npm run lint`**

Expected: pass

- [ ] **Step 4: Run `npm run build`**

Expected: typecheck + prerender `/`, `/experience/`, `/education/`, `/contact/`, `/privacy/`, `404.html`

- [ ] **Step 5: Confirm no personal email and no Instagram/Marktplaats URLs in `app/`**

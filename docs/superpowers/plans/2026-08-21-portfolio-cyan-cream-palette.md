# Portfolio Cyan/Cream Palette Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Retint the Growf-style inner-card layout from forest green to dark cyan, and make most cards cream so the site matches Growf’s light/dark rhythm.

**Architecture:** Replace `site-green` / `site-white` tokens with `site-cyan` / `site-cream`. `SectionCard` tones become `'cyan' | 'cream'`. Light cards get dark type (`site-cream-fg`); cyan cards keep light type (`site-cyan-fg`). Header type flips to dark on cream. No new routes or copy.

**Tech Stack:** Vite, React 19, TypeScript, React Router, Tailwind v4, Outfit Variable. No test runner; verification is class sweeps, `npm run lint`, and `npm run build`.

## Global Constraints

- Keep intro / experience / education copy verbatim.
- Default SVG `Logo` only (`currentColor`; no `variant="simplified"`).
- TraitSwapper behavior unchanged; trait color stays gold (`#E4B84A`).
- No email in source, UI, or built JS. LinkedIn only.
- No Growf lemon `#FDF067`, WebGL, Spline/LORE, or Growf fork.
- No new routes, Home blocks, or copy.
- `SITE_THEME_COLOR` = `#061A1E`.

## File map

- Modify: `tailwind.config.js` — chrome/cyan/cream hex values; drop `site-green` / `site-white`
- Modify: `app/global.css` — body, fields, `color-scheme: light`
- Modify: `app/seo/site.ts` — `SITE_THEME_COLOR`
- Modify: `app/components/elements/SectionCard.tsx` — `tone: 'cyan' | 'cream'`
- Modify: `app/components/layout/Header.tsx` — dark type, cream sticky bar, cyan-fg mobile sheet
- Modify: `app/components/layout/Footer.tsx` — `site-cyan` / `site-cyan-fg`
- Modify: `app/components/flex/banner/BannerHero.tsx` — cream + cream-fg
- Modify: `app/components/flex/content/ContentLogos.tsx` — cream
- Modify: `app/components/flex/content/ContentSelectedWork.tsx` — cyan card, cream tiles
- Modify: `app/components/flex/content/ContentStory.tsx` — cream
- Modify: `app/components/flex/content/ContentCta.tsx` — cyan + cyan-fg
- Modify: `app/components/flex/banner/BannerPage.tsx` — cream + cream-fg
- Modify: `app/components/flex/content/ContentExperiences.tsx` — cream card, cream/white nested tiles
- Modify: `app/components/flex/content/ContentEducation.tsx` — cream card, cream-fg inactive tabs
- Modify: `app/components/flex/form/FormContact.tsx` — cream card + cream form
- Modify: `app/components/flex/content/ContentText.tsx` — cream
- Modify: `app/routes/error.tsx` — `text-site-cyan-fg` on chrome

Do not modify `TraitSwapper` or `SkipToMainContent` (already gold). Do not change Home block order.

**Rename rule (do not apply blindly):** `site-green-fg` was light type for dark green cards. Cards that become cream must use `site-cream-fg` (dark), not `site-cyan-fg` (light). Cyan cards (selected work, CTA, footer, 404, mobile sheet) use `site-cyan-fg`.

---

### Task 1: Tokens, SectionCard, theme color

**Files:**

- Modify: `tailwind.config.js`
- Modify: `app/global.css`
- Modify: `app/seo/site.ts`
- Modify: `app/components/elements/SectionCard.tsx`

**Interfaces:**

- Consumes: existing Tailwind v4 `@config` + `SectionCard` callers (still `'green' | 'white'` until later tasks)
- Produces: tokens `site-chrome` `#061A1E`, `site-cyan` `#145A63`, `site-cyan-fg` `#F4F7F6`, `site-cream` `#F4F3EE`, `site-cream-fg` `#061A1E`, `site-gold` `#E4B84A`, `site-gold-fg` `#061A1E`, `site-gold-hover` `#C99A2E`. `SectionCard` `tone: 'cyan' | 'cream'`. `SITE_THEME_COLOR = '#061A1E'`.

After this task, TypeScript will fail on leftover `tone="green"` / `tone="white"` until Tasks 3–4. That is expected; do not leave the tree compiling mid-task if you stop after Task 1 — finish Task 1’s token/shell files, then continue. Prefer completing Tasks 1–4 in one session if splitting would leave a red `tsc`.

- [ ] **Step 1: Replace color tokens in `tailwind.config.js`**

Replace the `colors` object so forest green and pure white are gone:

```js
colors: {
  'site-chrome': '#061A1E',
  'site-cyan': '#145A63',
  'site-cyan-fg': '#F4F7F6',
  'site-cream': '#F4F3EE',
  'site-cream-fg': '#061A1E',
  'site-gold': '#E4B84A',
  'site-gold-fg': '#061A1E',
  'site-gold-hover': '#C99A2E'
}
```

Leave `borderRadius`, `boxShadow`, and `fontFamily` unchanged.

- [ ] **Step 2: Update `app/global.css` base and fields**

In `@utility field`, replace green/white with cyan/cream:

```css
@utility field {
  @apply w-full resize-none rounded-xl border border-site-cyan/20 bg-site-cream px-4 py-3 text-base text-site-cream-fg placeholder:text-site-cream-fg/50 smooth;
}
```

In `@layer base` `html, body`, use chrome + cyan-fg (gutter/404 default) and light color scheme:

```css
html,
body {
  @apply min-h-screen max-w-full bg-site-chrome font-site-outfit text-site-cyan-fg antialiased;
  color-scheme: light;
}
```

Do not change `button-gold`, `button-gold-outline`, titles, focus, or selection.

- [ ] **Step 3: Set theme color in `app/seo/site.ts`**

```ts
export const SITE_THEME_COLOR = '#061A1E'
```

- [ ] **Step 4: Rename `SectionCard` tones**

```tsx
export default function SectionCard({
  tone,
  first = false,
  id,
  children,
  innerClassName,
  sectionRef
}: {
  tone: 'cyan' | 'cream'
  first?: boolean
  id?: string
  children: ReactNode
  innerClassName?: string
  sectionRef?: Ref<HTMLElement>
}) {
  return (
    <section id={id} ref={sectionRef} className={cn('pb-2', first && 'pt-2')}>
      <div className="container-full">
        <div
          className={cn(
            'overflow-clip rounded-4xl',
            tone === 'cyan' ? 'bg-site-cyan text-site-cyan-fg' : 'bg-site-cream text-site-cream-fg',
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

Keep the same imports (`ReactNode`, `Ref`, `cn`).

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.js app/global.css app/seo/site.ts app/components/elements/SectionCard.tsx
git commit -m "feat: swap forest green tokens for cyan and cream"
```

---

### Task 2: Header and footer

**Files:**

- Modify: `app/components/layout/Header.tsx`
- Modify: `app/components/layout/Footer.tsx`

**Interfaces:**

- Consumes: Task 1 tokens (`site-cream`, `site-cream-fg`, `site-cyan`, `site-cyan-fg`, `site-chrome`)
- Produces: Header bar uses dark type on cream; mobile sheet uses chrome + cyan-fg; footer inner card is cyan

- [ ] **Step 1: Header bar and nav pills — dark type on cream**

In `Header.tsx`, change the desktop nav pill class:

```tsx
const navLinkClass =
  'inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium smooth hover:bg-site-cream-fg/10 aria-[current=page]:bg-site-cream-fg/15'
```

Change the `<header>` wrapper and sticky inner bar:

```tsx
<header className="pointer-events-none fixed inset-x-0 top-0 z-50 text-site-cream-fg">
  <div className="container-full pt-2">
    <div
      className={cn(
        'pointer-events-auto flex items-center justify-between rounded-4xl px-5 smooth',
        isSticky ? 'h-16 bg-site-cream/90 shadow backdrop-blur-md' : 'h-20 bg-transparent'
      )}
    >
```

Leave scroll logic (`scrollY > 10`), gold Get in touch, and nav map unchanged.

- [ ] **Step 2: Header burger trigger vs mobile sheet**

Burger **trigger** lives on the cream header — dark type:

```tsx
<SheetPrimitive.Trigger
  className="relative z-10 inline-flex size-10 items-center justify-center rounded-full text-site-cream-fg hover:bg-site-cream-fg/10 lg:hidden"
```

Sheet **overlay** stays `bg-site-chrome/80`. Sheet **content** and close button are chrome + light type:

```tsx
<SheetPrimitive.Content
  aria-modal="true"
  onCloseAutoFocus={(event) => event.preventDefault()}
  className="fixed inset-0 z-50 flex h-full flex-col bg-site-chrome text-site-cyan-fg shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:duration-200 data-[state=open]:duration-300"
>
```

```tsx
<SheetPrimitive.Close
  className="inline-flex size-10 items-center justify-center rounded-full text-site-cyan-fg hover:bg-site-cyan-fg/10"
```

Keep `mobileNavLinkClass`, gold Get in touch in the sheet, and `PRIMARY_NAV` as they are.

- [ ] **Step 3: Footer — cyan card**

Replace `site-green` / `site-green-fg` with cyan equivalents. Footer shell:

```tsx
<footer className="pb-2 text-site-cyan-fg">
  <div className="container-full">
    <div className="overflow-clip rounded-4xl bg-site-cyan px-6 py-12 sm:px-10 lg:px-16 lg:py-16">
```

Heading muted color `text-site-cyan-fg/55`. Legal row:

```tsx
<div className="mt-12 flex flex-col gap-4 border-t border-site-cyan-fg/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
  <p className="text-sm font-medium leading-7 text-site-cyan-fg/70">
    © {new Date().getFullYear()} Timo Smit. All rights reserved.
  </p>
  <Link
    to="/privacy/"
    className="link-underline w-fit text-sm font-medium leading-7 text-site-cyan-fg/70 transition-colors hover:text-site-gold aria-[current=page]:text-site-gold"
```

Keep logo, gold Get in touch, menu/LinkedIn links, and gold hovers.

- [ ] **Step 4: Commit**

```bash
git add app/components/layout/Header.tsx app/components/layout/Footer.tsx
git commit -m "feat: use cream header type and cyan footer"
```

---

### Task 3: Home section tones

**Files:**

- Modify: `app/components/flex/banner/BannerHero.tsx`
- Modify: `app/components/flex/content/ContentLogos.tsx`
- Modify: `app/components/flex/content/ContentSelectedWork.tsx`
- Modify: `app/components/flex/content/ContentStory.tsx`
- Modify: `app/components/flex/content/ContentCta.tsx`

**Interfaces:**

- Consumes: `SectionCard` `tone: 'cyan' | 'cream'` from Task 1
- Produces: Home rhythm cream → cream → cyan → cream → cyan. TraitSwapper stays gold via existing `text-site-gold`.

Do not edit `app/routes/home.tsx` (block order already correct).

- [ ] **Step 1: `BannerHero` — cream, dark type**

```tsx
<SectionCard
  tone="cream"
  first
  id="banner-hero"
  innerClassName="relative flex min-h-[calc(100dvh-1rem)] flex-col items-center justify-center px-6 pb-16 pt-28 sm:px-10 lg:px-24 lg:pt-32"
>
```

Kicker and outline button must be dark (cream-fg), not cyan-fg:

```tsx
<p className="text-sm font-semibold uppercase tracking-[0.16em] text-site-cream-fg/70">Front-end developer at UBO Agency</p>
```

```tsx
<Link to="/experience/" className="button-gold-outline text-site-cream-fg">
  Experience
</Link>
```

Leave `title-landing`, sr-only SEO span, TraitSwapper, and gold Get in touch unchanged.

- [ ] **Step 2: `ContentLogos` and `ContentStory` — cream**

`ContentLogos.tsx`:

```tsx
<SectionCard tone="cream" id="content-logos" innerClassName="px-6 py-12 sm:px-10 lg:px-16 lg:py-16">
```

```tsx
<p className="text-center text-sm font-semibold uppercase tracking-[0.16em] text-site-cream-fg/60">Places I’ve worked for.</p>
```

`ContentStory.tsx`:

```tsx
<SectionCard tone="cream" id="content-story" innerClassName="px-6 py-16 sm:px-10 lg:px-16 lg:py-20">
```

Do not change paragraphs or the photo.

- [ ] **Step 3: `ContentSelectedWork` — cyan card, cream tiles**

```tsx
<SectionCard tone="cyan" id="content-selected-work" innerClassName="px-6 py-16 sm:px-10 lg:px-16 lg:py-20">
```

Tile and link:

```tsx
<Link
  to="/experience/"
  className="flex h-full flex-col gap-4 rounded-2xl bg-site-cream p-6 text-site-cream-fg smooth hover:ring-2 hover:ring-site-gold"
>
```

```tsx
<p className="content-s grow text-site-cream-fg/80">{item.description}</p>
<span className="text-sm font-semibold text-site-cyan">View experience →</span>
```

Leave heading `Selected work`, data source, and `/experience/` links unchanged.

- [ ] **Step 4: `ContentCta` — cyan**

```tsx
<SectionCard tone="cyan" id={id} innerClassName="flex flex-col items-center px-6 py-16 text-center sm:px-10 lg:px-16 lg:py-20">
```

```tsx
<p className="content-l text-site-cyan-fg/80">{description}</p>
```

Leave gold button and props unchanged.

- [ ] **Step 5: Commit**

```bash
git add app/components/flex/banner/BannerHero.tsx app/components/flex/content/ContentLogos.tsx app/components/flex/content/ContentSelectedWork.tsx app/components/flex/content/ContentStory.tsx app/components/flex/content/ContentCta.tsx
git commit -m "feat: apply cream hero and cyan selected-work cards"
```

---

### Task 4: Inner pages

**Files:**

- Modify: `app/components/flex/banner/BannerPage.tsx`
- Modify: `app/components/flex/content/ContentExperiences.tsx`
- Modify: `app/components/flex/content/ContentEducation.tsx`
- Modify: `app/components/flex/form/FormContact.tsx`
- Modify: `app/components/flex/content/ContentText.tsx`
- Modify: `app/routes/error.tsx`

**Interfaces:**

- Consumes: `SectionCard` tones from Task 1
- Produces: Experience, Education, Contact, Privacy banners/bodies are cream with dark type. 404 stays chrome with cyan-fg type and gold CTA.

- [ ] **Step 1: `BannerPage` — cream**

```tsx
<SectionCard tone="cream" first id="banner-page" innerClassName="px-6 pt-28 pb-16 sm:px-10 lg:px-16 lg:pt-32 lg:pb-20" sectionRef={ref}>
  <div className="flex flex-col gap-8">
    <Breadcrumbs className="text-site-cream-fg/70" />
    <div className="flex max-w-3xl flex-col gap-4">
      <Animated delay={100}>
        <h1 className="title-section text-balance">{title}</h1>
      </Animated>
      <Animated delay={200}>
        <p className="content-l text-site-cream-fg/80">{description}</p>
      </Animated>
    </div>
  </div>
</SectionCard>
```

- [ ] **Step 2: `ContentExperiences` — cream outer, nested tiles with ring**

Outer card:

```tsx
<SectionCard tone="cream" id="content-experiences" innerClassName="px-6 py-16 sm:px-10 lg:px-16 lg:py-20">
```

Logo chip: light fill that still contrasts on cream (`bg-white`, not cyan-fg which is almost cream):

```tsx
<span className={cn('flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-2.5', className)}>
```

Visit link:

```tsx
<a href={href} target="_blank" rel="noopener noreferrer" className="button-gold-outline mt-2 w-fit text-site-cream-fg">
```

Project nested card (was `bg-site-green-fg/70`):

```tsx
<div className={cn('overflow-hidden rounded-2xl bg-white ring-1 ring-site-chrome/8', open && 'ring-2 ring-site-gold')}>
```

Project meta/description: `text-site-cream-fg/60` and `text-site-cream-fg/80`.

Job card:

```tsx
<article className={cn('overflow-hidden rounded-3xl bg-site-cream text-site-cream-fg ring-1 ring-site-chrome/8', open && 'ring-2 ring-site-gold')}>
```

Job description: `text-site-cream-fg/80`. Keep gold index, gold Projects label, accordion behavior, copy, and Visit website URLs.

The extra `ring-1 ring-site-chrome/8` on the job article is required so cream-on-cream tiles do not flatten into the parent card.

- [ ] **Step 3: `ContentEducation` — cream, dark inactive tabs**

```tsx
<SectionCard tone="cream" innerClassName="flex flex-col gap-8 px-6 py-16 sm:px-10 lg:px-16 lg:py-20">
```

Inactive tab type must be dark (the card is no longer green):

```tsx
className={cn(activeTopic === key ? 'button-gold' : 'button-gold-outline text-site-cream-fg', 'cursor-pointer')}
```

Panel:

```tsx
<div id="tab-content" className="grid w-full gap-10 rounded-2xl bg-white p-8 text-site-cream-fg ring-1 ring-site-chrome/8 md:grid-cols-2">
```

Description: `text-site-cream-fg/80`. Do not change tab copy or images.

- [ ] **Step 4: `FormContact` — cream page + cream form**

Outer:

```tsx
<SectionCard
  tone="cream"
  first
  id="form-contact"
  innerClassName="px-6 pt-28 pb-16 sm:px-10 lg:px-16 lg:pt-32 lg:pb-20"
  sectionRef={ref}
>
```

Breadcrumbs / description:

```tsx
<Breadcrumbs className="text-site-cream-fg/70" />
```

```tsx
<p className="content-l text-site-cream-fg/80">{description}</p>
```

Form surface (nested, so white + ring):

```tsx
<form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-2xl bg-white p-6 text-site-cream-fg ring-1 ring-site-chrome/8 sm:p-8 lg:p-10">
```

Error hints: `text-site-cream-fg/70`. Success (readable cyan on cream):

```tsx
{
  status === 'success' && <p className="content-s text-site-cyan">Thanks! I will get back to you soon.</p>
}
{
  status === 'error' && <p className="content-s text-site-cream-fg/70">Something went wrong. Try again later.</p>
}
```

Do not change Web3Forms, honeypot, validation copy, or LinkedIn.

- [ ] **Step 5: `ContentText` (Privacy) and 404**

`ContentText.tsx` already uses `tone="white"` and `site-white-fg`. Switch to cream:

```tsx
<SectionCard tone="cream" first id={id} innerClassName="px-6 pt-28 pb-16 sm:px-10 lg:px-16 lg:pt-32 lg:pb-20" sectionRef={ref}>
```

Replace every `text-site-white-fg` with `text-site-cream-fg` (including `/60` and `/80` opacity variants). Keep gold link hover and copy.

`app/routes/error.tsx` — chrome page, light type via cyan-fg:

```tsx
<main
  className="flex min-h-screen flex-col items-center justify-center bg-site-chrome py-16 text-site-cyan-fg sm:py-24 lg:py-32"
  aria-labelledby="error-title"
>
```

```tsx
<p className="content-l text-site-cyan-fg/80">This page does not exist or has been moved.</p>
```

Leave gold `404` and gold Back to home.

- [ ] **Step 6: Commit**

```bash
git add app/components/flex/banner/BannerPage.tsx app/components/flex/content/ContentExperiences.tsx app/components/flex/content/ContentEducation.tsx app/components/flex/form/FormContact.tsx app/components/flex/content/ContentText.tsx app/routes/error.tsx
git commit -m "feat: restyle inner pages onto cream cards"
```

---

### Task 5: Sweep leftover tokens and verify

**Files:**

- Sweep: `app/`, `tailwind.config.js`
- Test: lint + build (no new test files)

**Interfaces:**

- Consumes: Tasks 1–4 class names
- Produces: zero `site-green`, `site-white`, `tone="green"`, `tone="white"` in `app/` or `tailwind.config.js`

- [ ] **Step 1: Grep for leftover old tokens**

Run:

```bash
rg -n "site-green|site-white|tone=\"green\"|tone=\"white\"|tone: 'green'|tone: 'white'" app tailwind.config.js
```

Expected: no matches. If any remain, replace using the Task 1 rename rule (cream-fg on cream cards, cyan-fg on cyan/chrome).

- [ ] **Step 2: Confirm gold and theme color**

Run:

```bash
rg -n "site-gold|#061A1E|#E4B84A" app/seo/site.ts app/components/elements/TraitSwapper.tsx tailwind.config.js
```

Expected: `SITE_THEME_COLOR` is `#061A1E`; TraitSwapper still has `text-site-gold`; gold tokens exist in Tailwind.

- [ ] **Step 3: Confirm no personal email in app source**

Run:

```bash
rg -n "@" app --glob '!**/node_modules/**' | rg -i "gmail|hotmail|icloud|timosmit@"
```

Expected: no personal email addresses.

- [ ] **Step 4: Run lint**

Run: `npm run lint`

Expected: pass (exit 0).

- [ ] **Step 5: Run build**

Run: `npm run build`

Expected: typecheck succeeds; prerender writes `/`, `/experience/`, `/education/`, `/contact/`, `/privacy/`, and `404.html`.

- [ ] **Step 6: Commit sweep-only fixes if Step 1 required edits; otherwise skip empty commit**

```bash
git add -u app tailwind.config.js
git commit -m "chore: remove leftover green and white token classes"
```

Only run this commit if `git status` shows remaining diffs from the sweep.

---

## Spec coverage

| Spec item                                                 | Task                             |
| --------------------------------------------------------- | -------------------------------- |
| Token hex table + rename                                  | Task 1                           |
| `SectionCard` `'cyan' \| 'cream'`                         | Task 1                           |
| `SITE_THEME_COLOR` `#061A1E`                              | Task 1                           |
| `color-scheme: light`, fields                             | Task 1                           |
| Header dark type, cream/90 sticky, chrome mobile sheet    | Task 2                           |
| Footer cyan                                               | Task 2                           |
| Hero / logos / story cream; selected work + CTA cyan      | Task 3                           |
| View experience `text-site-cyan`                          | Task 3                           |
| BannerPage, experience, education, contact, privacy cream | Task 4                           |
| Nested tiles ring so they don’t flatten                   | Task 4                           |
| 404 chrome + cyan-fg + gold                               | Task 4                           |
| Sweep `site-green` / `site-white`                         | Task 5                           |
| lint + build + no email                                   | Task 5                           |
| Gold CTAs / TraitSwapper unchanged                        | Tasks 2–3 (no TraitSwapper edit) |
| No copy/route/block changes                               | All tasks                        |

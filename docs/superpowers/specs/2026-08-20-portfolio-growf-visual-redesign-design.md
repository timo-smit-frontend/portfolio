# Portfolio Growf-style visual redesign

Date: 2026-08-20

This spec supersedes `2026-08-20-portfolio-hwc-rebuild-design.md` for look, Home composition, banners, chrome, and color tokens. Stack, routes, verbatim copy, Web3Forms, and “no email in source” still apply; they are restated here so this file is the single source for the redesign.

## Problem

timosmit.dev already uses the Hello World Cards app shape (React Router, flex blocks, GitHub Pages). The look is still HWC (gunmetal, envy green, full-bleed photo hero). The site should sell Timo as a front-end developer with a Growf-like landing: large type, rounded section cards, proof, selected work, then story. Palette is white, dark green, and gold yellow — not Growf stone/lemon and not HWC envy/gunmetal.

## Goal

Restyle this repository in place. Keep the stack, routes, data, and copy. Rebuild chrome and Home as Growf-like rounded sections on a dark green page. Do not fork `growf-website`, do not add WordPress/GraphQL, and do not add Growf WebGL or Spline/LORE fonts.

## Constraints

- Keep intro, experience, and education copy verbatim (`home.tsx` paragraphs, `app/database/experiences.ts`, `app/database/educations.ts`).
- Keep company logos, education images, `timosmit.webp`, and the existing SVG `Logo` (default variant).
- Do not use `Logo` `variant="simplified"` in the UI. The variant may stay in the component unused.
- TraitSwapper behavior stays (type/erase on large screens, one random trait on small screens). The trait word is gold.
- Do not ship products, agenda, Pokémon, Marktplaats, Instagram, or a Cloudflare Worker.
- Do not put an email address in the repo, client bundle, or visible UI.
- Do not add Google Tag Manager or Clarity.
- Do not rewrite experience/education copy from LinkedIn.
- Do not copy Growf product blocks (pricing, agents, integrations marketplace, dither canvases).

## Approach

Replace HWC visual tokens and photo banners with a new token set and Growf-like inner-card layout. Add Home blocks that fit a portfolio. Restyle Experience, Education, Contact, Privacy, and 404 to the same system. Delete unused banner components once nothing imports them.

## Stack

Unchanged, except CSS tokens:

| Piece       | Choice                                                |
| ----------- | ----------------------------------------------------- |
| App         | Vite + React 19 + TypeScript + React Router           |
| Source root | `app/` with `~` alias                                 |
| CSS         | Tailwind v4, Outfit Variable, new site tokens below   |
| Images      | existing `Image` component + `vite` responsive images |
| SEO         | `app/seo/*` + `vite/seo-prerender.ts`                 |
| Lint/format | existing ESLint (no raw `<img>`) and Prettier         |
| Deploy      | GitHub Pages via `gh-pages` (`npm run deploy`)        |
| Domain      | `https://www.timosmit.dev`                            |

Node 22.

## Visual system

Page background (gutter around cards) is near-black green. Large rounded inner cards use dark green where Growf uses grey, and white where Growf uses nested light surfaces. Primary actions are gold, not lemon `#FDF067` and not HWC envy.

| Token             | Hex       | Use                                                                        |
| ----------------- | --------- | -------------------------------------------------------------------------- |
| `site-chrome`     | `#07140F` | Page background, header solid bar, footer                                  |
| `site-green`      | `#164A38` | Inner section cards that were grey on Growf                                |
| `site-green-fg`   | `#F7F4EC` | Type and icons on green                                                    |
| `site-white`      | `#FFFFFF` | Nested cards, forms, proof strip, story, legal                             |
| `site-white-fg`   | `#07140F` | Type on white                                                              |
| `site-gold`       | `#E4B84A` | Primary buttons, TraitSwapper word, accordion/tab active, focus, selection |
| `site-gold-fg`    | `#07140F` | Text on gold buttons                                                       |
| `site-gold-hover` | `#C99A2E` | Primary button hover (darken gold, do not swap to green or white)          |

`SITE_THEME_COLOR` becomes `#07140F`.

Layout language, taken from Growf but not their brand type:

- `container-full` stays (centered, padded).
- Sections are stacked inner cards with an 8px (`0.5rem`) vertical gap, `rounded-4xl`, `overflow-clip`.
- Green cards: `bg-site-green text-site-green-fg`.
- White cards: `bg-site-white text-site-white-fg`.
- Body: `bg-site-chrome`, Outfit, `color-scheme: dark`.
- Focus-visible: 3px gold outline, 2px offset.
- Selection: gold background, chrome text.

Buttons:

- `button-gold`: pill, gold fill, `site-gold-fg` text. Hover uses `site-gold-hover`.
- `button-gold-outline`: pill, transparent, cream/white border and type on green; chrome border and type on white. Hover fills gold.
- Remove `button-green` and HWC `mat` / envy hover utilities from use.

Type: keep Outfit. Scale like Growf, not like HWC `title-l`:

- Hero `h1`: `text-6xl sm:text-7xl md:text-8xl lg:text-9xl` with tight negative tracking.
- Section titles: current `title-xl` / `title-l` is too small for Home; use a `title-landing` / `title-section` pair matching the sizes above and Growf `title-section` (~`text-2xl` to `text-5xl`).
- Body: existing `content-*` sizes are fine on white and green if contrast stays (cream on green, chrome on white).

No Spline Sans, no LORE Alternates, no Bayer/cloud dither, no three.js.

## Routes

| Path           | Page                                        |
| -------------- | ------------------------------------------- |
| `/`            | Home                                        |
| `/experience/` | Experience                                  |
| `/education/`  | Education                                   |
| `/contact/`    | Contact                                     |
| `/privacy/`    | Privacy                                     |
| unknown        | 404 (`dist/404.html` plus client `*` route) |

Trailing slashes stay. Routes stay in `app/app.tsx` under `Root`, except 404 outside the layout.

Nav order everywhere (header desktop, header mobile, footer): Experience → Education → Contact. Privacy only in the footer legal row.

## Header and footer

Header: sticky, logo (default SVG, `currentColor`), three nav links, gold **Get in touch** → `/contact/`, burger sheet on small screens.

Two visual states:

- **Home, at top (`scrollY ≤ 10`):** transparent over the first green hero card. Cream text, gold CTA still gold. No solid fill.
- **Home after `scrollY > 10`, and all other pages:** solid `bg-site-chrome/90`, `backdrop-blur-md`, cream text, gold CTA.

Skip-to-main stays above the header.

Footer: same grid as now (logo, Menu, Follow, legal row). Default logo, not simplified, not `ts_logo_2.png`. Menu and LinkedIn only. Hover and current page use gold, not envy. Legal: `© {year} Timo Smit. All rights reserved.` and Privacy statement. Footer sits on `site-chrome` with cream type. No email column.

## Home

`h1` is the TraitSwapper headline. Keep `sr-only` “Timo Smit, Front-end Developer.” for SEO.

Block order, all copy existing except the proof-strip label and hero kicker (short facts already in the intro, not new claims):

1. **`BannerHero`** (green inner card, no photo)  
   Kicker: `Front-end developer at UBO Agency`.  
   Headline: `Timo Smit is a <TraitSwapper /> Front-end Developer!` with the trait in `text-site-gold`.  
   Buttons: gold **Get in touch** → `/contact/`; outline **Experience** → `/experience/`.

2. **`ContentLogos`** (white inner card)  
   Label: `Companies I’ve done work for.`  
   Logos in this order, using existing files: UBO, Capgemini, WFP, Tweede Kamer, Accent Interactive, SmartHOTEL.  
   Decorative; no new case-study claims.

3. **`ContentSelectedWork`** (green inner card, white nested tiles)  
   Exactly three tiles, existing copy and logos:
   - UBO Agency (`EXPERIENCES[0]`)
   - Tweede Kamer der Staten-Generaal (`EXPERIENCES[1].projects[0]`)
   - Project Enhance (`EXPERIENCES[1].projects[1]`)  
     Each tile: logo, title, description, link to `/experience/` (not a new detail URL).  
     Accent Interactive and SmartHOTEL do not appear here.

4. **`ContentStory`** (white inner card)  
   The three intro paragraphs from `home.tsx` unchanged.  
   Photo `/images/timosmit.webp`: two columns from `lg` up (text left, photo right); stacked on small screens with the photo under the paragraphs. `alt` describes Timo; this is content, not a hero background.

5. **`ContentCta`** (green inner card, no photo)  
   Title: `Want to know more about me?`  
   Description: `Questions about my work, accessibility, or a project? Send me a message.`  
   Gold **Get in touch** → `/contact/`.

Do not keep `BannerOverlay` on Home.

## Inner pages

No full-bleed photo banners. No `BannerFigcaption`. Each inner page with a title opens with **`BannerPage`**: green inner card, `h1`, existing one-liner. Main content follows in a white (or green-with-white-tiles) inner card.

### Experience

`BannerPage`: `My professional front-end experiences` / `UBO Agency, Capgemini, Accent Interactive, and SmartHOTEL.`

Then `ContentExperiences`. Job order, copy, logos, and Visit website links unchanged:

1. UBO Agency
2. Capgemini, with nested Tweede Kamer der Staten-Generaal and Project Enhance
3. Accent Interactive
4. SmartHOTEL

Accordion: one parent job open at a time, first open by default. Nested Capgemini projects toggle independently of the parent. Open state uses a gold accent (border or label), not envy. White tiles on the green page card.

### Education

`BannerPage`: `Education` / `Accessibility, consultancy, creative development, and React / Next.js.`

Then `ContentEducation`. Same four tabs, copy, and images:

- Accessibility
- Consultancy & Client Work
- Creative Developer
- React & Next.js

Active tab: `button-gold`. Inactive: outline. Panel: white card, image + text, same two-column idea as now.

### Contact

`FormContact` stays the data/behavior owner. Visual: `BannerPage` is optional if the form already has title + description; do not duplicate headings. Title `Get in touch`, description `Questions about my work, accessibility, or a project? Send me a message.` White form card on green chrome. Gold submit. Fields on white with chrome text and gold focus.

- Submit: Web3Forms via `import.meta.env.VITE_WEB3FORMS_ACCESS_KEY` only. Key may be in the client bundle; destination email must not.
- `.env.example` keeps `VITE_WEB3FORMS_ACCESS_KEY=` empty. Missing key: do not submit, show `Something went wrong. Try again later.`
- Validation copy unchanged (`Don't forget to add your name.` and the other existing hints).
- Secondary contact: LinkedIn only (`https://www.linkedin.com/in/timo-smit-09983b14a/`). No email, Instagram, or Marktplaats.

### Privacy

Existing sections and body copy. `h1` `Privacy statement` plus the existing description and `updated` date. White legal card. No photo.

### 404

No Pokémon. Mark, `This page was not found`, gold **Back to home**. Green or chrome background, cream type.

## Components to add, restyle, remove

Add: `BannerHero`, `BannerPage`, `ContentLogos`, `ContentSelectedWork`, `ContentStory`.

Restyle in place: `Header`, `Footer`, `ContentCta` (drop required image), `ContentExperiences`, `ContentEducation`, `FormContact`, `ContentText` (privacy), error page, `TraitSwapper` accent color.

Remove from the UI (delete files if unreferenced): `BannerOverlay`, `BannerFigcaption`. Do not render simplified logo.

## Assets and SEO

Keep `/images/...` as now. Open Graph / `SITE_IMAGE` stays `/images/timosmit.webp` (the portrait is still the share image even though it is not the Home LCP).

Do **not** preload `timosmit.webp` as Home LCP. The Home LCP element is the hero headline (text). Education tab images and the story photo load lazily except the story photo may use default lazy below the fold.

JSON-LD, canonical URLs, `llms.txt`, indexable paths, and `SITE_DESCRIPTION` stay as in the HWC spec. `sameAs`: LinkedIn only.

## Explicitly out of scope

- Forking or importing `growf-website` as the app
- Growf WebGL, dither, Spline/LORE, pricing, integrations, agents
- Cloudflare Worker, Wrangler
- Shop, products, agenda, Pokémon, Marktplaats, Instagram
- Showing or storing the contact email in source
- GTM, Clarity, or other analytics
- New experience/education copy
- Using the simplified logo
- A test runner; verification is `npm run lint` and `npm run build`

## Verification

- `npm run lint` passes.
- `npm run build` typechecks and prerenders `/`, `/experience/`, `/education/`, `/contact/`, `/privacy/`, and `404.html`.
- Home has no full-bleed photo hero; TraitSwapper still types; trait is gold.
- Header is transparent on Home at top, solid after scroll and on inner pages; gold Get in touch is visible in the header.
- Proof strip shows the six logos; selected work shows only UBO, Tweede Kamer, and Project Enhance.
- Experience accordion and education tabs still work with kept copy.
- Contact form does not contain a personal email string in the built JS.
- No Instagram or Marktplaats URLs in the app.
- `gh-pages` deploy script still publishes `dist/`.
- No `button-green`, `site-envy`, or `BannerOverlay` usage remains in rendered pages.

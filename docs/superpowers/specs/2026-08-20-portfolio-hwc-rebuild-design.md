# Portfolio rebuild from Hello World Cards

Date: 2026-08-20

## Problem

timosmit.dev is a single-page Vite React site with its own layout, colors, and GitHub Pages deploy. Hello World Cards is the intended implementation standard (React Router, Tailwind tokens, SEO prerender, shared flex blocks, a11y). The portfolio should be rewritten to that standard without becoming a shop.

## Goal

Replace this repository with the Hello World Cards app architecture, minus shop/product/agenda. Keep only this site’s copy, logos/favicon, and the current full-viewport banner (photo + TraitSwapper). Deploy remains GitHub Pages on `https://www.timosmit.dev`.

## Constraints

- Keep existing intro, experience, and education copy verbatim.
- Keep `ts_logo.png`, `ts_logo_2.png`, `favicon.png`, company logos, education images, and `timosmit.webp`.
- Keep the banner as a full-viewport photo with centered TraitSwapper headline.
- Do not ship products, agenda, Pokémon, Marktplaats, Instagram, or a Cloudflare Worker.
- Do not put an email address in the repo, client bundle, or visible UI.
- Do not add Google Tag Manager or Clarity unless a later spec adds them.

## Approach

Copy the Hello World Cards codebase into this repo, delete shop-only pieces, retarget chrome and content. Do not restyle the current `src/` tree in place.

## Stack

Same as Hello World Cards, except hosting:

| Piece | Choice |
| --- | --- |
| App | Vite + React 19 + TypeScript + React Router |
| Source root | `app/` with `~` alias |
| CSS | Tailwind v4, Outfit Variable, HWC color tokens and utilities (`site-dark`, `site-envy`, `container-full`, `button-green`, `title-*`, `content-*`, `mat`, `section`) |
| Images | HWC `Image` component + `vite/responsive-images.ts` |
| SEO | `app/seo/*` + `vite/seo-prerender.ts` (per-route HTML, sitemap, `llms.txt`) |
| Lint/format | HWC ESLint (including no raw `<img>`) and Prettier |
| Deploy | GitHub Pages via `gh-pages` (`npm run deploy`). No Wrangler, no `worker/` |
| Domain | `https://www.timosmit.dev` |

Node 22, matching HWC.

## Routes

| Path | Page |
| --- | --- |
| `/` | Home |
| `/experience/` | Experience |
| `/education/` | Education |
| `/contact/` | Contact |
| `/privacy/` | Privacy |
| unknown | 404 (`dist/404.html` plus client `*` route) |

Trailing slashes match HWC. Register routes in `app/app.tsx` under the shared `Root` layout, except 404 which stays outside the layout like HWC.

Nav order everywhere (header desktop, header mobile, footer): Experience → Education → Contact. Privacy only in the footer legal row.

## Header and banner

`Header` is the HWC sticky bar (logo, nav, burger sheet) with two visual states:

- **Home, at top:** transparent over the photo. White/gray-nurse text. No solid background, no bottom border until scroll.
- **Home after `scrollY > 10`, and all other pages:** HWC solid bar (`bg-site-dark/90`, `backdrop-blur-md`, `border-site-mulled-wine`).

The Home hero is a new `BannerOverlay` (not `BannerFigcaption`):

- Background: `/images/timosmit.webp`, `h-screen`, cover, same general crop as today.
- Headline centered: `Timo Smit is a <TraitSwapper /> Front-end Developer!`
- Trait accent uses `text-site-envy` (not the old yellow).
- TraitSwapper behavior stays (type/erase on large screens, one random trait on small screens).
- Logo in the overlay header is `ts_logo.png`, not the HWC SVG wordmark.
- Skip-to-main still sits above the header.

Inner pages do not use `BannerOverlay`. They use HWC `BannerFigcaption` or `ContentText` with breadcrumbs, like HWC about/privacy.

## Pages

### Home

1. `BannerOverlay` (page `h1` is the TraitSwapper headline; add an `sr-only` title if needed for SEO: “Timo Smit, Front-end Developer”).
2. `ContentText` with the three existing intro paragraphs (UBO, CMD, Capgemini / WFP / Tweede Kamer, puzzle/creativity).
3. `ContentCta` titled “Want to know more about me?” linking to `/contact/`. Image: `/images/timosmit.webp`. No Instagram.

### Experience

`BannerFigcaption` with `h1` “My professional front-end experiences”, a one-line description, and `/images/timosmit.webp`. Then a new `ContentExperiences` block.

Jobs stay in this order, copy unchanged:

1. UBO Agency
2. Capgemini, with nested projects Tweede Kamer der Staten-Generaal and Project Enhance
3. Accent Interactive
4. SmartHOTEL

Accordion behavior stays: one job open at a time (first open by default); nested Capgemini projects toggle independently of the parent. Restyle to HWC panels (`rounded-panel`, `bg-site-gunmetal`, `ring-site-mulled-wine`). Company logos stay. External “Visit website” links stay. Do not use HWC `ContentFaq` (that component is static Q&A, not an accordion).

Drop `framer-motion`. Implement the height reveal with CSS / the same animation utilities HWC already uses (`tw-animate-css`), or a small local accordion without a new animation library.

### Education

`BannerFigcaption` with `h1` “Education”, a one-line description, and `/images/timosmit.webp`. Then the tabbed panel. Same four tabs, copy and images unchanged:

- Accessibility
- Consultancy & Client Work
- Creative Developer
- React & Next.js

Restyle tabs and the two-column panel to HWC tokens. Active tab: `button-green` / envy fill. Inactive: gunmetal.

### Contact

HWC `FormContact` layout: title, short description, name / email / message, submit.

- Submit goes to Web3Forms using `import.meta.env.VITE_WEB3FORMS_ACCESS_KEY` only. That key may exist in the client bundle; the destination email must not.
- Ship `.env.example` with `VITE_WEB3FORMS_ACCESS_KEY=` empty. If the key is missing at runtime, the form does not submit and shows a generic error (“Something went wrong. Try again later.”).
- Success and validation copy follow HWC (inline errors, email format check).
- Secondary contact: LinkedIn only (`https://www.linkedin.com/in/timo-smit-09983b14a/`). No email, no Instagram, no Marktplaats.

`.env` holds the access key and is gitignored. Local `npm run deploy` must be run with the key present so the production bundle can submit.

### Privacy

HWC `ContentText` with `heading="h1"` and dated sections. Rewrite for a personal portfolio:

- Who you are (Timo Smit, front-end developer).
- What the contact form sends (name, email, message) via Web3Forms, used only to reply, not sold.
- No GTM/Clarity section unless those tools are added later.
- Cookies: none required for the site to work; Web3Forms is a form POST, not a tracking pixel.

### 404

HWC error page minus `Pokemon`. 404 mark, “This page was not found”, “Back to home”.

## Footer

HWC footer grid:

- `ts_logo_2.png` linking home (click does not need the old scroll-to-header helper; router home is enough; on Home, the logo may scroll to top).
- Menu: Experience, Education, Contact.
- Follow: LinkedIn only.
- Legal row: `© {year} Timo Smit. All rights reserved.` and Privacy statement.

No email column.

## Assets

Move current `public/assets/` files into `public/images/` (banner, logos, favicon, company logos, education photos). All app references use `/images/...`. Do not use the HWC SVG favicon.

## SEO

`SITE_URL = https://www.timosmit.dev`
`SITE_NAME = Timo Smit`
`SITE_DESCRIPTION` from the current meta description, tightened to one sentence: “The portfolio of Timo Smit, a front-end developer working at UBO Agency.”
`SITE_IMAGE` = the banner photo.
JSON-LD: `Person` + `WebSite` + `WebPage` (not `Store`). `sameAs`: LinkedIn only.
Indexable paths: the five real pages above. Product/agenda SEO helpers are deleted.
`llms.txt` / `llms-full.txt` describe the portfolio, not the shop.
LCP preload on Home is the banner photo.

## Explicitly out of scope

- Cloudflare Worker, Wrangler, custom security headers from `worker/index.ts`
- Shop, products, agenda, Pokémon sprites, Marktplaats
- Instagram
- Showing or storing the contact email in source
- GTM, Clarity, or other analytics
- New experience/education copy from LinkedIn
- A test runner (HWC has none); verification is `npm run lint` and `npm run build`

## Verification

- `npm run lint` passes.
- `npm run build` typechecks, prerenders `/`, `/experience/`, `/education/`, `/contact/`, `/privacy/`, and `404.html`.
- Homepage overlay: transparent nav on the photo, solid after scroll; TraitSwapper still types.
- Experience accordion and education tabs still work with the kept copy.
- Contact form does not contain an email string in the built JS (`rg` / search the bundle for `@` addresses belonging to Timo must find none).
- No Instagram or Marktplaats URLs in the app.
- `gh-pages` deploy script still publishes `dist/`.

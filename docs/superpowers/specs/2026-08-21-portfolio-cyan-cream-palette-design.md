# Portfolio cyan/cream palette

Date: 2026-08-21

This spec supersedes the **visual system, card tones, header contrast, and theme color** in `2026-08-20-portfolio-growf-visual-redesign-design.md`. Stack, routes, copy, Web3Forms, TraitSwapper behavior, and “no email in source” still apply; they are not restated except where a token rename touches a class name.

## Problem

The Growf-style inner-card layout is in place, but the palette is forest green on almost every surface (`#07140F` gutter, `#164A38` hero, selected work, CTA, footer, inner banners). Growf.io is cream/stone cards on a dark gutter with lemon CTAs. The portfolio should keep gold, not lemon, and keep a brand hue — but that hue should be dark cyan, and most cards should be cream so the site is not a wall of green.

## Goal

Retint and rebalance in place. Light cream hero and inner pages like Growf. Dark cyan only on selected work, CTA, and footer. Gold CTAs and TraitSwapper stay.

## Constraints

- Do not change intro, experience, or education copy.
- Do not add Growf lemon `#FDF067`, WebGL, Spline/LORE, or a Growf fork.
- Do not put an email address in source or UI.
- Keep default SVG `Logo` (`currentColor` will pick up cream-fg on the header and cyan-fg on the footer).
- TraitSwapper behavior unchanged; the trait word stays gold.
- No new routes, blocks, or copy.

## Visual system

| Token | Hex | Use |
| --- | --- | --- |
| `site-chrome` | `#061A1E` | Page gutter, 404 background, mobile menu sheet |
| `site-cyan` | `#145A63` | Dark cards: selected work, CTA, footer |
| `site-cyan-fg` | `#F4F7F6` | Type and icons on cyan |
| `site-cream` | `#F4F3EE` | Light cards (Growf stone-100 analog, not `#FFFFFF`) |
| `site-cream-fg` | `#061A1E` | Type on cream |
| `site-gold` | `#E4B84A` | Primary buttons, TraitSwapper, accordion/tab active, focus, selection |
| `site-gold-fg` | `#061A1E` | Text on gold buttons |
| `site-gold-hover` | `#C99A2E` | Primary button hover |

`SITE_THEME_COLOR` becomes `#061A1E`.

Rename Tailwind tokens and classes:

- `site-green` → `site-cyan`
- `site-green-fg` → `site-cyan-fg`
- `site-white` → `site-cream`
- `site-white-fg` → `site-cream-fg`

`SectionCard` `tone` becomes `'cyan' | 'cream'` (not `'green' | 'white'`).

Layout language unchanged: `container-full`, 8px vertical gap, `rounded-4xl`, `overflow-clip`. Body: `bg-site-chrome`, Outfit. `color-scheme: light` so form controls match cream cards. Focus-visible: 3px gold outline, 2px offset. Selection: gold background, chrome text.

Buttons:

- `button-gold`: unchanged (gold fill, `site-gold-fg` text, hover `site-gold-hover`).
- `button-gold-outline`: `border-current`. Dark on cream, cream on cyan. Hover fills gold.

Type scale unchanged (`title-landing`, `title-section`, existing `content-*`).

## Card tones

| Block | Tone |
| --- | --- |
| `BannerHero` | Cream. Dark type, gold trait, gold CTA, outline Experience |
| `ContentLogos` | Cream |
| `ContentSelectedWork` | Cyan. Nested cream tiles. “View experience →” is `text-site-cyan` |
| `ContentStory` | Cream |
| `ContentCta` | Cyan |
| Footer inner card | Cyan |
| `BannerPage` (Experience, Education, Privacy) | Cream. Breadcrumbs and body copy use cream-fg |
| Experience / education / contact / privacy body cards | Cream. Nested tiles stay cream with the existing chrome ring so they don’t flatten into the parent; gold open/active accent |
| 404 | Chrome page, cream type, gold mark and Back to home |

Home block order unchanged: Hero → Logos → Selected work → Story → CTA.

## Header and footer

Header sits on cream, so type is dark, not cream-on-green.

- **Home, at top (`scrollY ≤ 10`):** transparent over the cream hero. `text-site-cream-fg`, gold **Get in touch**.
- **Home after `scrollY > 10`, and all other pages:** `bg-site-cream/90`, `backdrop-blur-md`, same dark type, gold CTA.
- Nav hover/current: gold. Nav pill hover background uses `site-cream-fg/10` (not cyan-fg).
- **Mobile sheet:** `bg-site-chrome text-site-cyan-fg` (full-screen overlay). Gold Get in touch in the sheet.

Footer: cyan inner card, `text-site-cyan-fg`, gold hovers/current. Border on the legal row: `border-site-cyan-fg/15`.

Skip-to-main stays `button-gold`.

## Components to touch

Tokens: `tailwind.config.js`, `app/global.css`, `app/seo/site.ts`.

Rename tones/classes in: `SectionCard`, `Header`, `Footer`, `BannerHero`, `BannerPage`, `ContentLogos`, `ContentSelectedWork`, `ContentStory`, `ContentCta`, `ContentExperiences`, `ContentEducation`, `ContentText`, `FormContact`, `SkipToMainContent`, `TraitSwapper` (only if it still references green/white), error route.

Sweep leftover `site-green`, `site-white`, `tone="green"`, `tone="white"` from `app/`.

Do not add or delete routes or Home blocks.

## Explicitly out of scope

- Copy rewrites
- Growf lemon, stone-800 cards, WebGL, dither, Spline/LORE
- New sections or case-study pages
- Analytics, email in source, simplified logo

## Verification

- `npm run lint` passes.
- `npm run build` typechecks and prerenders existing paths.
- Hero and inner banners are cream with dark type; selected work, CTA, and footer are cyan.
- Header is dark type on cream (transparent at Home top, cream/90 after scroll).
- No `site-green` or `site-white` classes remain in `app/` or `tailwind.config.js`.
- Gold CTAs and TraitSwapper still gold.
- Contact form still has no personal email string in built JS.

import type { Direction } from '~/game/sprites'

/*
 * The furniture of the interiors, drawn pixel by pixel on the room canvas. Every piece follows the same rules so
 * the rooms read as one set: a 1px ink outline, a soft drop shadow on the floor, light from the top left (a lit
 * top edge and left side, the right side and front faces in shade), the floor showing between legs and feet, and
 * one or two small props or fittings that say what the piece is.
 */

export const TILE = 16
export const INK = '#14202a'

export type FurnitureKind =
  | 'desk'
  | 'shelf'
  | 'bed'
  | 'sofa'
  | 'table'
  | 'plant'
  | 'lamp'
  | 'rug'
  | 'mailbox'
  | 'counter'
  | 'crate'
  | 'chair'
  | 'officeChair'
  | 'nightstand'
  | 'cooler'
  | 'printer'
  | 'trophies'
  | 'globe'
  | 'parcels'
  | 'bench'
  | 'fireplace'
  /** Someone to talk to, standing behind a counter one row down (it hides their legs). */
  | 'clerk'

export type Furniture = {
  id: string
  kind: FurnitureKind
  x: number
  y: number
  w?: number
  h?: number
  color?: string
  label?: string
  interactive?: boolean
  /** Chairs: which way the seat faces (default: towards the back wall, seen from behind). */
  face?: 'left' | 'right'
}

/** How far a piece of furniture reaches above its footprint (for drawing order and clicks). */
export const RISE: Record<FurnitureKind, number> = {
  desk: 12,
  shelf: 20,
  bed: 2,
  sofa: 5,
  table: 3,
  plant: 6,
  lamp: 16,
  rug: 0,
  mailbox: 7,
  counter: 5,
  crate: 0,
  chair: 2,
  officeChair: 12,
  nightstand: 11,
  cooler: 14,
  printer: 4,
  trophies: 20,
  globe: 11,
  parcels: 6,
  bench: 2,
  fireplace: 21,
  clerk: 3
}

/** Parse `#rrggbb` (or the `rgb(r g b)` this used to return) and lighten or darken every channel by `amount`. */
export function shade(color: string, amount: number) {
  const [r, g, b] = color.startsWith('#')
    ? [0, 2, 4].map((k) => parseInt(color.slice(1 + k, 3 + k), 16))
    : (color.match(/\d+/g) ?? ['0', '0', '0']).slice(0, 3).map(Number)
  const hex = (v: number) =>
    Math.max(0, Math.min(255, v + amount))
      .toString(16)
      .padStart(2, '0')
  return `#${hex(r!)}${hex(g!)}${hex(b!)}`
}

export type Ctx = CanvasRenderingContext2D
export const px = (ctx: Ctx, color: string, x: number, y: number, w = 1, h = 1) => {
  ctx.fillStyle = color
  ctx.fillRect(x, y, w, h)
}

const SHADOW = 'rgb(6 14 20 / 0.35)'
const GOLD = '#e4b84a'
const GOLD_DARK = '#b8862e'
const GLINT = '#fff1c4'
const PAPER = '#efe7d6'
const PAPER_LINE = '#9a9586'

/** The soft shadow every piece casts on the floor, two rows tall. */
const floorShadow = (ctx: Ctx, x: number, y: number, w: number) => px(ctx, SHADOW, x, y, w, 2)

/** A solid block in the house style: an ink outline, lit along the top and left, in shade along the right and bottom. */
function block(ctx: Ctx, x: number, y: number, w: number, h: number, c: string) {
  px(ctx, INK, x, y, w, h)
  px(ctx, c, x + 1, y + 1, w - 2, h - 2)
  px(ctx, shade(c, 12), x + 1, y + 2, 1, h - 3)
  px(ctx, shade(c, -22), x + w - 2, y + 2, 1, h - 3)
  px(ctx, shade(c, -30), x + 1, y + h - 2, w - 2, 1)
  px(ctx, shade(c, 32), x + 1, y + 1, w - 2, 1)
}

/** A cardboard box seen from the front and a little above: `top` rows of lid, the front below, with packing tape. */
function carton(ctx: Ctx, x: number, y: number, w: number, h: number, top: number, c: string) {
  px(ctx, INK, x, y, w, h)
  px(ctx, shade(c, 20), x + 1, y + 1, w - 2, top)
  px(ctx, shade(c, 38), x + 1, y + 1, w - 2, 1)
  px(ctx, c, x + 1, y + 1 + top, w - 2, h - 2 - top)
  px(ctx, shade(c, -16), x + 1, y + 1 + top, w - 2, 1)
  px(ctx, shade(c, -24), x + w - 2, y + 2 + top, 1, h - 3 - top)
  px(ctx, shade(c, -32), x + 1, y + h - 2, w - 2, 1)
  const tx = x + Math.floor(w / 2) - 1
  px(ctx, '#e8d7a8', tx, y + 1, 2, h - 2)
  px(ctx, '#cbb88a', tx + 1, y + 2 + top, 1, h - 3 - top)
}

/** A small gold cup on a shelf whose board is at `floor`: bowl, two handles, a stem and a foot. */
function cup(ctx: Ctx, x: number, floor: number) {
  px(ctx, INK, x - 1, floor - 7, 7, 3)
  px(ctx, INK, x, floor - 8, 5, 6)
  px(ctx, GOLD, x + 1, floor - 7, 3, 3)
  px(ctx, GOLD_DARK, x - 1, floor - 6, 1, 1)
  px(ctx, GOLD_DARK, x + 5, floor - 6, 1, 1)
  px(ctx, GLINT, x + 1, floor - 7, 1, 1)
  px(ctx, GOLD_DARK, x + 3, floor - 6, 1, 2)
  px(ctx, INK, x, floor - 2, 5, 2)
  px(ctx, GOLD_DARK, x + 2, floor - 3, 1, 1)
  px(ctx, GOLD, x + 1, floor - 2, 3, 1)
}

/** A framed award plaque standing on a shelf, with a coloured emblem. */
function plaque(ctx: Ctx, x: number, floor: number, c: string) {
  px(ctx, INK, x, floor - 7, 5, 7)
  px(ctx, '#b98c55', x + 1, floor - 6, 3, 5)
  px(ctx, '#f8f8f0', x + 1, floor - 5, 3, 3)
  px(ctx, c, x + 2, floor - 4, 1, 1)
  px(ctx, shade(c, -30), x + 1, floor - 1, 3, 1)
}

const BRASS = '#d9a84a'
export const CHAIR_COLOR = '#4b5f78'
const BRASS_DARK = '#9a7330'
/** Lampshade fabric, warm from the bulb inside. */
const SHADE = '#ecc86a'

/**
 * A lit lampshade: a trapezoid `rows` tall centred on `cx`, narrow at the top (`topHalf`) and flaring to `botHalf`,
 * with a highlight on the left, shade on the right, faint pleats, a glowing lower edge and the bulb under the rim.
 */
function drawLampShade(ctx: Ctx, cx: number, top: number, rows: number, topHalf: number, botHalf: number, color: string) {
  px(ctx, INK, cx - topHalf - 1, top - 1, 2 * topHalf + 2, 1)
  for (let k = 0; k < rows; k++) {
    const half = topHalf + Math.round(((botHalf - topHalf) * k) / (rows - 1))
    const left = cx - half
    const w = 2 * half
    const y = top + k
    px(ctx, INK, left - 1, y, w + 2, 1)
    px(ctx, color, left, y, w, 1)
    for (let x = cx - 1; x > left + 1; x -= 3) px(ctx, shade(color, -14), x, y, 1, 1)
    for (let x = cx + 2; x < left + w - 2; x += 3) px(ctx, shade(color, -14), x, y, 1, 1)
    px(ctx, shade(color, 30), left, y, 1, 1)
    px(ctx, shade(color, -34), left + w - 2, y, 2, 1)
  }
  // The lower edge glows where the light spills out, and the bulb shows through the opening.
  px(ctx, '#fff1c4', cx - botHalf + 1, top + rows - 1, 2 * botHalf - 3, 1)
  px(ctx, INK, cx - botHalf - 1, top + rows, 2 * botHalf + 2, 1)
  px(ctx, '#fff6d6', cx - 2, top + rows, 4, 1)
}

const METAL = '#5d6572'
const CHROME = '#a9b2bc'

/**
 * An office chair on a five-star base with casters, a gas lift, armrests and a contoured back rest, turned to
 * `face` (the way the seat looks). `part` splits it for a seated hero: 'base' is everything behind you, 'front'
 * what is in front of you (the back rest when you sit with your back to the room, the near armrest side on).
 */
export function drawOfficeChair(ctx: Ctx, X: number, Y: number, c: string, face: Direction, part: 'all' | 'base' | 'front') {
  const flip = face === 'right'
  const q = (color: string, x: number, y: number, w = 1, h = 1) => px(ctx, color, flip ? X + 16 - x - w : X + x, Y + y, w, h)
  const hi = shade(c, 34)
  const lo = shade(c, -24)
  const base = part !== 'front'
  const front = part !== 'base'
  const shadow = 'rgb(6 14 20 / 0.35)'

  if (face === 'left' || face === 'right') {
    if (base) {
      // Side on: the base is a flat star with three casters showing, the back rest stands up behind you.
      q(shadow, 2, 14, 13, 2)
      q(INK, 2, 13, 12, 2)
      q(METAL, 3, 13, 10, 1)
      q(INK, 2, 15, 2, 1)
      q(INK, 7, 15, 2, 1)
      q(INK, 12, 15, 2, 1)
      q(INK, 7, 11, 2, 2)
      q(CHROME, 7, 11, 1, 2)
      // Back rest, slightly curved, on a stem behind the seat.
      q(INK, 11, 0, 4, 10)
      q(INK, 10, 1, 1, 8)
      q(c, 11, 1, 3, 8)
      q(hi, 11, 1, 1, 8)
      q(lo, 13, 2, 1, 7)
      q(INK, 12, 9, 2, 2)
      // Seat cushion.
      q(INK, 3, 8, 11, 4)
      q(c, 4, 9, 9, 2)
      q(hi, 4, 9, 9, 1)
    }
    if (front) {
      // The near armrest.
      q(INK, 5, 5, 7, 3)
      q(shade(c, -10), 6, 6, 5, 1)
      q(INK, 9, 8, 1, 1)
    }
    return
  }

  if (base) {
    // Five-star base: two legs to the sides, two to the front, a caster on every tip.
    q(shadow, 1, 13, 14, 3)
    q(INK, 2, 12, 12, 2)
    q(METAL, 3, 12, 10, 1)
    q(INK, 4, 14, 2, 1)
    q(INK, 10, 14, 2, 1)
    q(METAL, 5, 13, 1, 1)
    q(METAL, 10, 13, 1, 1)
    q(INK, 1, 13, 2, 2)
    q(INK, 13, 13, 2, 2)
    q(INK, 3, 15, 2, 1)
    q(INK, 11, 15, 2, 1)
    // Gas lift.
    q(INK, 7, 10, 2, 3)
    q(CHROME, 7, 10, 1, 2)
  }

  if (face === 'down') {
    if (!base) return
    // Facing you: the back rest stands behind the seat, armrests either side.
    q(INK, 4, -1, 8, 1)
    q(INK, 3, 0, 10, 8)
    q(c, 4, 0, 8, 7)
    q(hi, 4, 0, 8, 1)
    q(lo, 5, 3, 6, 1)
    q(INK, 2, 6, 12, 5)
    q(c, 3, 7, 10, 2)
    q(hi, 3, 7, 10, 1)
    q(lo, 3, 9, 10, 1)
    for (const x of [0, 13]) {
      q(INK, x, 4, 3, 3)
      q(shade(c, -10), x + 1, 5, 1, 1)
      q(INK, x + (x ? 0 : 2), 7, 1, 3)
    }
    return
  }

  // Facing the desk, seen from behind: the seat peeks out under the armrests; the back rest is nearest to you.
  if (base) {
    q(INK, 1, 6, 14, 4)
    q(c, 2, 7, 12, 2)
    q(hi, 2, 7, 12, 1)
  }
  if (front) {
    for (const x of [0, 13]) {
      q(INK, x, 5, 3, 4)
      q(hi, x + 1, 6, 1, 1)
      q(lo, x + 1, 7, 1, 1)
    }
    // Rounded back rest with a lit top edge and a lumbar seam.
    q(INK, 4, 4, 8, 1)
    q(INK, 3, 5, 10, 6)
    q(INK, 4, 11, 8, 1)
    q(c, 4, 5, 8, 6)
    q(hi, 5, 5, 6, 1)
    q(shade(c, 14), 4, 6, 1, 4)
    q(lo, 11, 6, 1, 5)
    q(lo, 5, 8, 6, 1)
    q(lo, 4, 10, 8, 1)
  }
}

/* ---------------------------------------------------------------------------
 * Pixel furniture. (X, Y) is the top-left of the footprint in art pixels.
 * ------------------------------------------------------------------------- */

export function drawFurniture(ctx: Ctx, f: Furniture, lit: boolean, frame = 0, face: Direction = 'up') {
  const X = f.x * TILE
  const Y = f.y * TILE
  const W = (f.w ?? 1) * TILE
  const H = (f.h ?? 1) * TILE
  const shadow = 'rgb(6 14 20 / 0.35)'

  switch (f.kind) {
    case 'rug': {
      const c = f.color ?? '#a84552'
      px(ctx, shade(c, -40), X + 2, Y + 2, W - 4, H - 4)
      px(ctx, c, X + 3, Y + 3, W - 6, H - 6)
      px(ctx, shade(c, 22), X + 6, Y + 6, W - 12, 1)
      px(ctx, shade(c, 22), X + 6, Y + H - 7, W - 12, 1)
      px(ctx, shade(c, 22), X + 6, Y + 6, 1, H - 12)
      px(ctx, shade(c, 22), X + W - 7, Y + 6, 1, H - 12)
      const cx = X + W / 2
      const cy = Y + H / 2
      for (let k = 0; k < 4; k++) {
        px(ctx, '#e4b84a', cx - 4 + k, cy - k, 1, 1)
        px(ctx, '#e4b84a', cx + 3 - k, cy - k, 1, 1)
        px(ctx, '#e4b84a', cx - 4 + k, cy + k, 1, 1)
        px(ctx, '#e4b84a', cx + 3 - k, cy + k, 1, 1)
      }
      for (let fx = X + 4; fx < X + W - 4; fx += 3) {
        px(ctx, '#efe7d6', fx, Y + 1, 1, 1)
        px(ctx, '#efe7d6', fx, Y + H - 2, 1, 1)
      }
      break
    }
    case 'desk': {
      // A bureau: the desktop on a drawer pedestal (right) and a panel leg (left), with open knee space between
      // where the chair goes and a modesty panel at the back.
      const c = f.color ?? '#a8743f'
      const body = shade(c, -30)
      const ped = X + W - 13
      px(ctx, shadow, X + 1, Y + 13, W - 2, 3)
      px(ctx, shade(c, -62), X + 3, Y + 8, ped - X - 3, 3)
      px(ctx, INK, X + 3, Y + 11, ped - X - 3, 1)
      px(ctx, INK, X, Y + 7, 4, 9)
      px(ctx, body, X + 1, Y + 8, 2, 7)
      px(ctx, shade(c, -14), X + 1, Y + 8, 1, 7)
      px(ctx, INK, ped, Y + 7, 13, 9)
      px(ctx, body, ped + 1, Y + 8, 11, 7)
      px(ctx, INK, ped + 1, Y + 11, 11, 1)
      for (const dy of [Y + 8, Y + 12]) {
        px(ctx, shade(c, -16), ped + 1, dy, 11, 1)
        px(ctx, INK, ped + 5, dy + 1, 3, 1)
        px(ctx, '#e4b84a', ped + 6, dy + 1, 1, 1)
      }
      // Desktop with a lit back edge and its front edge in shade.
      px(ctx, INK, X, Y - 1, W, 9)
      px(ctx, shade(c, 12), X + 1, Y, W - 2, 5)
      px(ctx, shade(c, 34), X + 1, Y, W - 2, 1)
      px(ctx, shade(c, -18), X + 1, Y + 5, W - 2, 2)
      px(ctx, shade(c, -4), X + 1, Y + 5, W - 2, 1)
      // Monitor, keyboard, mug.
      const mx = X + W / 2 - 9
      px(ctx, INK, mx, Y - 12, 18, 12)
      px(ctx, lit ? '#9ff0d0' : '#5fb3c2', mx + 1, Y - 11, 16, 9)
      px(ctx, 'rgb(255 255 255 / 0.5)', mx + 2, Y - 10, 6, 1)
      px(ctx, 'rgb(255 255 255 / 0.35)', mx + 2, Y - 8, 10, 1)
      px(ctx, 'rgb(255 255 255 / 0.35)', mx + 2, Y - 6, 8, 1)
      px(ctx, INK, mx + 7, Y - 1, 4, 3)
      px(ctx, INK, X + W / 2 - 7, Y + 1, 14, 5)
      px(ctx, '#d9d4c2', X + W / 2 - 6, Y + 2, 12, 3)
      px(ctx, '#f4efe0', X + W / 2 - 6, Y + 2, 12, 1)
      for (let k = X + W / 2 - 5; k < X + W / 2 + 5; k += 2) px(ctx, '#9a9586', k, Y + 3, 1, 1)
      px(ctx, '#9a9586', X + W / 2 - 6, Y + 4, 12, 1)
      px(ctx, INK, X + 3, Y - 1, 6, 6)
      px(ctx, INK, X + 9, Y, 1, 3)
      px(ctx, PAPER, X + 4, Y, 4, 4)
      px(ctx, '#ffffff', X + 4, Y, 1, 3)
      px(ctx, '#c0473b', X + 4, Y + 2, 4, 1)
      break
    }
    case 'shelf': {
      // A bookcase: a crown on top, side panels, three shelves and a plinth on two feet. The books are mostly in
      // the case's own colour, of mixed sizes, with a leaning book or an ornament here and there, laid out
      // differently for every case so a row of them does not repeat.
      const wood = '#7d532c'
      const back = shade(wood, -46)
      const top = Y - 20
      const accent = f.color ?? '#c0473b'
      const books = [accent, '#e4b84a', shade(accent, -34), '#efe7d6', accent, '#35589c', shade(accent, 26), '#3f8a5e']
      const inL = X + 3
      const inR = X + W - 3
      px(ctx, shadow, X + 1, Y + 14, W - 2, 2)
      px(ctx, INK, X, top, W, Y + 15 - top)
      // Crown with a lit top edge.
      px(ctx, shade(wood, 32), X + 1, top + 1, W - 2, 1)
      px(ctx, shade(wood, 10), X + 1, top + 2, W - 2, 1)
      // Side panels, lit on the left, and the dark back of the case.
      px(ctx, shade(wood, 16), X + 1, top + 4, 1, Y + 8 - top)
      px(ctx, wood, X + 2, top + 4, 1, Y + 8 - top)
      px(ctx, shade(wood, -18), inR, top + 4, 2, Y + 8 - top)
      px(ctx, back, inL, top + 4, W - 6, Y + 8 - top)
      // Plinth on two feet, with the floor showing between them.
      px(ctx, shade(wood, 18), X + 1, Y + 12, W - 2, 1)
      px(ctx, shade(wood, -10), X + 1, Y + 13, W - 2, 1)
      for (const fx of [X, X + W - 4]) {
        px(ctx, INK, fx, Y + 15, 4, 1)
        px(ctx, shade(wood, -24), fx + 1, Y + 14, 2, 1)
      }
      for (let shelf = 0; shelf < 3; shelf++) {
        const cy = top + 4 + shelf * 10
        const floor = cy + 8
        if (shelf < 2) {
          px(ctx, shade(wood, 22), X + 1, floor, W - 2, 1)
          px(ctx, wood, X + 1, floor + 1, W - 2, 1)
        }
        // The board above casts a shadow over the tops of the books.
        px(ctx, shade(back, -14), inL, cy, W - 6, 1)
        const seed = f.x * 5 + shelf * 3
        const decor = (f.x + shelf) % 3 === 0 ? (f.x + shelf * 2) % 3 : -1
        const limit = decor >= 0 ? inR - 4 : inR
        let bx = inL
        let k = seed
        while (bx < limit) {
          const bw = Math.min([2, 2, 1, 3, 2, 1][k % 6]!, limit - bx)
          const bh = 5 + ((k * 5) % 3)
          const color = books[(k * 3 + shelf) % books.length]!
          const by = floor - bh
          px(ctx, color, bx, by, bw, bh)
          if (bw > 1) px(ctx, shade(color, 34), bx, by, 1, bh)
          px(ctx, shade(color, -40), bx, by + 1, bw, 1)
          if (bh > 6) px(ctx, shade(color, -40), bx, floor - 2, bw, 1)
          bx += bw
          k++
          // Now and then a gap, with a book leaning into it.
          if (decor < 0 && k % 4 === 0 && limit - bx >= 4) {
            const lean = books[(k + 5) % books.length]!
            for (let r = 0; r < 6; r++) px(ctx, r < 2 ? lean : shade(lean, -12), bx + Math.floor((5 - r) / 2), floor - 6 + r, 2, 1)
            px(ctx, shade(lean, 34), bx + 2, floor - 6, 1, 2)
            bx += 4
          }
        }
        if (decor === 0) {
          // A small stack lying flat.
          px(ctx, INK, limit, floor - 4, 4, 4)
          px(ctx, books[(seed + 1) % books.length]!, limit, floor - 2, 4, 2)
          px(ctx, shade(books[(seed + 1) % books.length]!, 30), limit, floor - 2, 4, 1)
          px(ctx, books[(seed + 4) % books.length]!, limit + 1, floor - 4, 3, 2)
          px(ctx, '#efe7d6', limit + 3, floor - 4, 1, 2)
        } else if (decor === 1) {
          // A potted succulent.
          px(ctx, '#b8633a', limit + 1, floor - 3, 2, 3)
          px(ctx, '#8a4628', limit + 2, floor - 3, 1, 3)
          px(ctx, '#2f7550', limit, floor - 6, 4, 3)
          px(ctx, '#6fbf86', limit + 1, floor - 6, 1, 1)
          px(ctx, '#4f9a6a', limit + 2, floor - 5, 1, 1)
        } else if (decor === 2) {
          // A little gold cup.
          px(ctx, '#e4b84a', limit, floor - 6, 4, 2)
          px(ctx, '#fff1c4', limit, floor - 6, 1, 1)
          px(ctx, '#b8862e', limit + 1, floor - 4, 2, 2)
          px(ctx, '#e4b84a', limit, floor - 2, 4, 2)
          px(ctx, '#b8862e', limit, floor - 1, 4, 1)
        }
      }
      break
    }
    case 'bed': {
      // A double bed against the wall: a panelled headboard between two posts, two plump pillows, the sheet
      // turned down over a quilted duvet that hangs over the sides, and a low footboard on short legs.
      const c = f.color ?? '#35589c'
      const wood = '#8a5a30'
      floorShadow(ctx, X + 1, Y + H - 2, W - 2)
      px(ctx, INK, X, Y, W, H - 1)
      px(ctx, wood, X + 1, Y + 1, W - 2, 5)
      px(ctx, shade(wood, 34), X + 1, Y + 1, W - 2, 1)
      px(ctx, shade(wood, -26), X + 1, Y + 5, W - 2, 1)
      for (let k = X + 8; k < X + W - 6; k += 6) px(ctx, shade(wood, -18), k, Y + 2, 1, 3)
      for (const bx of [X, X + W - 4]) {
        px(ctx, INK, bx, Y - 2, 4, 8)
        px(ctx, shade(wood, -12), bx + 1, Y - 1, 2, 6)
        px(ctx, shade(wood, 30), bx + 1, Y - 1, 1, 1)
      }
      // Mattress and sheet.
      px(ctx, '#f4efe0', X + 2, Y + 6, W - 4, H - 9)
      px(ctx, '#d9d4c2', X + W - 3, Y + 6, 1, H - 9)
      for (const pxl of [X + 4, X + W / 2 + 1]) {
        const pw = W / 2 - 5
        px(ctx, INK, pxl, Y + 6, pw, 8)
        px(ctx, '#ffffff', pxl + 1, Y + 7, pw - 2, 5)
        px(ctx, '#d9d4c2', pxl + 1, Y + 11, pw - 2, 1)
        px(ctx, '#d9d4c2', pxl + pw - 2, Y + 8, 1, 3)
        px(ctx, '#e6e1d0', pxl + 3, Y + 9, pw - 6, 1)
      }
      // The turned-down sheet, then the duvet with a lit top, quilting and its drape over the far side in shade.
      px(ctx, INK, X + 1, Y + 15, W - 2, 1)
      px(ctx, '#ffffff', X + 2, Y + 16, W - 4, 2)
      px(ctx, '#d9d4c2', X + 2, Y + 17, W - 4, 1)
      px(ctx, c, X + 1, Y + 18, W - 2, H - 22)
      px(ctx, shade(c, 28), X + 2, Y + 18, W - 4, 1)
      px(ctx, shade(c, 12), X + 1, Y + 18, 1, H - 22)
      px(ctx, shade(c, -26), X + W - 3, Y + 18, 2, H - 22)
      for (let qy = Y + 21; qy < Y + H - 5; qy += 4)
        for (let qx = X + 5; qx < X + W - 4; qx += 2) px(ctx, shade(c, -18), qx + ((qy - Y) % 8 ? 1 : 0), qy, 1, 1)
      px(ctx, shade(c, -34), X + 1, Y + H - 4, W - 2, 1)
      // Footboard and legs.
      px(ctx, INK, X, Y + H - 3, W, 2)
      px(ctx, shade(wood, 20), X + 1, Y + H - 3, W - 2, 1)
      px(ctx, INK, X + 1, Y + H - 1, 2, 1)
      px(ctx, INK, X + W - 3, Y + H - 1, 2, 1)
      break
    }
    case 'sofa': {
      // A tufted sofa: the back rest with buttons and piping, rolled arms, two seat cushions, two throw pillows and
      // short wooden feet.
      const c = f.color ?? '#2f7f8a'
      floorShadow(ctx, X + 1, Y + 14, W - 2)
      px(ctx, INK, X, Y - 6, W, 20)
      px(ctx, shade(c, -26), X + 1, Y - 5, W - 2, 8)
      px(ctx, shade(c, -4), X + 1, Y - 5, W - 2, 1)
      px(ctx, shade(c, -40), X + 1, Y + 2, W - 2, 1)
      for (let bx = X + 6; bx < X + W - 5; bx += 5) {
        px(ctx, shade(c, -48), bx, Y - 2, 1, 1)
        px(ctx, shade(c, -12), bx - 1, Y - 3, 1, 1)
      }
      // Two seat cushions with a lit front roll.
      const half = Math.floor((W - 8) / 2)
      for (const cx of [X + 4, X + 4 + half]) {
        px(ctx, INK, cx - 1, Y + 2, 1, 10)
        px(ctx, c, cx, Y + 3, half - 1, 8)
        px(ctx, shade(c, 18), cx, Y + 3, half - 1, 1)
        px(ctx, shade(c, 30), cx, Y + 8, half - 1, 1)
        px(ctx, shade(c, -20), cx, Y + 10, half - 1, 1)
      }
      px(ctx, INK, X + W - 5, Y + 2, 1, 10)
      // Rolled arms, a little higher than the seat, lit on top.
      for (const ax of [X + 1, X + W - 4]) {
        px(ctx, shade(c, -12), ax, Y - 3, 3, 15)
        px(ctx, shade(c, 16), ax, Y - 3, 3, 1)
        px(ctx, shade(c, 4), ax, Y - 2, 1, 13)
        px(ctx, shade(c, -30), ax + 2, Y - 2, 1, 13)
      }
      px(ctx, INK, X + 4, Y - 3, 1, 5)
      px(ctx, INK, X + W - 5, Y - 3, 1, 5)
      // Throw pillows, set at a slight angle.
      px(ctx, INK, X + 5, Y - 3, 7, 6)
      px(ctx, GOLD, X + 6, Y - 2, 5, 4)
      px(ctx, GLINT, X + 6, Y - 2, 2, 1)
      px(ctx, GOLD_DARK, X + 9, Y, 2, 2)
      px(ctx, INK, X + W - 12, Y - 3, 7, 6)
      px(ctx, '#f4efe0', X + W - 11, Y - 2, 5, 4)
      px(ctx, '#ffffff', X + W - 11, Y - 2, 2, 1)
      px(ctx, '#cfc6b4', X + W - 8, Y, 2, 2)
      // Wooden feet.
      for (const fx of [X + 2, X + W - 4]) {
        px(ctx, INK, fx, Y + 13, 2, 3)
        px(ctx, '#8a5a30', fx, Y + 13, 1, 2)
      }
      break
    }
    case 'table': {
      // A wooden top on four legs: the floor shows between them, the back legs stand inset under the apron.
      const c = f.color ?? '#b89058'
      const leg = shade(c, -40)
      px(ctx, shadow, X + 3, Y + 11, W - 6, 4)
      for (const lx of [X + 5, X + W - 7]) {
        px(ctx, INK, lx, Y + 8, 2, 4)
        px(ctx, shade(leg, -16), lx, Y + 8, 1, 3)
      }
      for (const lx of [X + 1, X + W - 4]) {
        px(ctx, INK, lx, Y + 8, 3, 8)
        px(ctx, leg, lx + 1, Y + 8, 1, 7)
      }
      // Top slab with a lit back edge, faint grain, and its front edge in shade.
      px(ctx, INK, X, Y - 3, W, 12)
      px(ctx, shade(c, 14), X + 1, Y - 2, W - 2, 7)
      px(ctx, shade(c, 36), X + 1, Y - 2, W - 2, 1)
      px(ctx, shade(c, 4), X + 4, Y + 1, 9, 1)
      px(ctx, shade(c, 4), X + W - 14, Y + 3, 10, 1)
      px(ctx, shade(c, -22), X + 1, Y + 5, W - 2, 3)
      px(ctx, shade(c, -6), X + 1, Y + 5, W - 2, 1)
      // An open book and a mug.
      px(ctx, INK, X + 5, Y - 2, 11, 6)
      px(ctx, '#c0473b', X + 6, Y - 1, 9, 4)
      px(ctx, '#efe7d6', X + 6, Y - 1, 4, 3)
      px(ctx, '#efe7d6', X + 11, Y - 1, 4, 3)
      px(ctx, '#9a9586', X + 7, Y, 2, 1)
      px(ctx, '#9a9586', X + 12, Y, 2, 1)
      px(ctx, INK, X + W - 10, Y - 2, 5, 5)
      px(ctx, '#efe7d6', X + W - 9, Y - 1, 3, 3)
      px(ctx, '#6b4a2e', X + W - 9, Y - 1, 3, 1)
      px(ctx, INK, X + W - 5, Y, 1, 2)
      break
    }
    case 'plant': {
      // A leafy plant in a terracotta pot with a rolled rim. No wind indoors: the trees outside sway, this stands still.
      const pot = f.color ?? '#b8633a'
      floorShadow(ctx, X + 3, Y + 14, 10)
      px(ctx, INK, X + 4, Y + 8, 8, 7)
      px(ctx, pot, X + 5, Y + 10, 6, 4)
      px(ctx, shade(pot, 24), X + 5, Y + 10, 1, 4)
      px(ctx, shade(pot, -28), X + 10, Y + 10, 1, 4)
      px(ctx, shade(pot, -40), X + 5, Y + 13, 6, 1)
      px(ctx, INK, X + 3, Y + 7, 10, 3)
      px(ctx, shade(pot, 20), X + 4, Y + 8, 8, 1)
      px(ctx, shade(pot, -14), X + 11, Y + 8, 1, 1)
      // Round crown of leaves: dark gaps between three tones, with a few tips breaking the outline.
      const [dark, mid, light, glint] = ['#245f40', '#2f7550', '#4f9a6a', '#6fbf86']
      px(ctx, INK, X + 4, Y - 7, 8, 1)
      px(ctx, INK, X + 2, Y - 6, 12, 1)
      px(ctx, INK, X + 1, Y - 5, 14, 10)
      px(ctx, INK, X + 2, Y + 5, 12, 1)
      px(ctx, INK, X + 4, Y + 6, 8, 1)
      px(ctx, INK, X + 7, Y - 8, 2, 1)
      px(ctx, INK, X, Y - 1, 1, 2)
      px(ctx, INK, X + 15, Y + 1, 1, 2)
      px(ctx, mid, X + 4, Y - 6, 8, 1)
      px(ctx, mid, X + 2, Y - 5, 12, 10)
      px(ctx, mid, X + 4, Y + 5, 8, 1)
      px(ctx, dark, X + 9, Y + 1, 5, 4)
      px(ctx, dark, X + 2, Y + 2, 4, 3)
      px(ctx, dark, X + 7, Y - 1, 1, 3)
      px(ctx, light, X + 3, Y - 5, 5, 4)
      px(ctx, light, X + 8, Y - 4, 4, 3)
      px(ctx, light, X + 5, Y + 1, 3, 3)
      px(ctx, light, X + 10, Y + 1, 2, 1)
      px(ctx, glint, X + 4, Y - 4, 2, 1)
      px(ctx, glint, X + 9, Y - 3, 1, 1)
      px(ctx, glint, X + 6, Y + 1, 1, 1)
      px(ctx, mid, X + 1, Y - 1, 1, 2)
      px(ctx, dark, X + 14, Y + 1, 1, 2)
      break
    }
    case 'lamp': {
      // Floor lamp: weighted brass base, a slim pole with a knuckle, and a pleated fabric shade lit from inside.
      px(ctx, shadow, X + 3, Y + 13, 10, 2)
      px(ctx, INK, X + 4, Y + 11, 8, 4)
      px(ctx, BRASS, X + 5, Y + 11, 6, 1)
      px(ctx, BRASS_DARK, X + 5, Y + 12, 6, 2)
      px(ctx, INK, X + 7, Y - 8, 2, 20)
      px(ctx, BRASS, X + 7, Y - 7, 1, 18)
      px(ctx, INK, X + 6, Y + 2, 4, 2)
      px(ctx, BRASS, X + 7, Y + 2, 2, 1)
      drawLampShade(ctx, X + 8, Y - 15, 7, 3, 6, f.color ?? SHADE)
      break
    }
    case 'mailbox': {
      // A round-topped post box on a pole, with a letter slot, a door seam and a raised flag.
      const c = f.color ?? '#b8433a'
      floorShadow(ctx, X + 3, Y + 14, 10)
      px(ctx, INK, X + 6, Y + 2, 4, 13)
      px(ctx, '#4a566e', X + 7, Y + 2, 2, 12)
      px(ctx, '#6a7890', X + 7, Y + 2, 1, 12)
      px(ctx, INK, X + 5, Y + 13, 6, 2)
      px(ctx, INK, X + 3, Y - 8, 10, 1)
      block(ctx, X + 1, Y - 7, 14, 11, c)
      px(ctx, INK, X + 1, Y - 7, 1, 1)
      px(ctx, INK, X + 14, Y - 7, 1, 1)
      px(ctx, INK, X + 4, Y - 4, 8, 2)
      px(ctx, shade(c, -40), X + 4, Y - 2, 8, 1)
      px(ctx, shade(c, -22), X + 2, Y + 1, 12, 1)
      px(ctx, INK, X + 13, Y - 11, 1, 6)
      px(ctx, INK, X + 13, Y - 12, 3, 4)
      px(ctx, GOLD, X + 14, Y - 11, 2, 2)
      break
    }
    case 'counter': {
      // The post office counter: a wooden worktop with a lit edge and grain, a front of raised panels on a kick
      // plate, and on top a stack of forms with a pen, a stamp on its pad and a brass bell (the clerk's spot in the
      // middle is kept clear).
      const c = f.color ?? '#4f6fb3'
      const top = '#b89058'
      floorShadow(ctx, X + 1, Y + 14, W - 2)
      px(ctx, INK, X, Y - 4, W, 19)
      px(ctx, top, X + 1, Y - 3, W - 2, 5)
      px(ctx, shade(top, 36), X + 1, Y - 3, W - 2, 1)
      for (let gx = X + 6; gx < X + W - 8; gx += 13) px(ctx, shade(top, -10), gx, Y - 1 + ((gx - X) % 2), 7, 1)
      px(ctx, shade(top, -30), X + 1, Y + 2, W - 2, 1)
      px(ctx, c, X + 1, Y + 4, W - 2, 10)
      px(ctx, shade(c, -46), X + 1, Y + 4, W - 2, 1)
      for (let k = X + 3; k + 12 <= X + W - 2; k += 16) {
        px(ctx, shade(c, -26), k, Y + 6, 12, 6)
        px(ctx, c, k + 1, Y + 7, 10, 4)
        px(ctx, shade(c, 22), k + 1, Y + 7, 10, 1)
        px(ctx, shade(c, 10), k + 1, Y + 8, 1, 3)
        px(ctx, shade(c, -14), k + 10, Y + 8, 1, 3)
      }
      px(ctx, shade(c, -40), X + 1, Y + 13, W - 2, 1)
      // Forms and a pen.
      px(ctx, INK, X + 5, Y - 3, 10, 5)
      px(ctx, PAPER, X + 6, Y - 2, 8, 3)
      px(ctx, '#ffffff', X + 6, Y - 2, 8, 1)
      px(ctx, PAPER_LINE, X + 7, Y, 5, 1)
      px(ctx, INK, X + 15, Y - 3, 1, 1)
      px(ctx, '#35589c', X + 13, Y - 2, 2, 1)
      px(ctx, '#35589c', X + 11, Y - 1, 2, 1)
      // Stamp on its ink pad.
      px(ctx, INK, X + W - 27, Y - 1, 8, 3)
      px(ctx, '#c0473b', X + W - 26, Y, 6, 1)
      px(ctx, INK, X + W - 24, Y - 5, 3, 5)
      px(ctx, '#8a5a30', X + W - 23, Y - 4, 1, 3)
      // Brass bell.
      px(ctx, INK, X + W - 14, Y - 1, 8, 3)
      px(ctx, GOLD_DARK, X + W - 13, Y, 6, 1)
      px(ctx, INK, X + W - 13, Y - 4, 6, 3)
      px(ctx, GOLD, X + W - 12, Y - 3, 4, 2)
      px(ctx, GLINT, X + W - 12, Y - 3, 1, 1)
      px(ctx, INK, X + W - 11, Y - 5, 2, 1)
      break
    }
    case 'chair': {
      const c = f.color ?? '#7d532c'
      if (f.face) {
        // Side on, facing the table: the seat on four legs, the back rest standing up on the far side.
        const back = f.face === 'right' ? X + 3 : X + 10
        floorShadow(ctx, X + 3, Y + 14, 10)
        px(ctx, INK, X + 4, Y + 12, 1, 4)
        px(ctx, INK, X + 11, Y + 12, 1, 4)
        px(ctx, INK, X + 6, Y + 12, 1, 3)
        px(ctx, INK, X + 9, Y + 12, 1, 3)
        px(ctx, shade(c, -26), X + 5, Y + 13, 6, 1)
        px(ctx, INK, X + 3, Y + 6, 10, 7)
        px(ctx, c, X + 4, Y + 7, 8, 5)
        px(ctx, shade(c, 30), X + 4, Y + 7, 8, 1)
        px(ctx, shade(c, 12), X + 4, Y + 8, 1, 3)
        px(ctx, shade(c, -24), X + 4, Y + 11, 8, 1)
        px(ctx, INK, back, Y - 2, 3, 15)
        px(ctx, shade(c, 14), back + 1, Y - 1, 1, 13)
        px(ctx, shade(c, 40), back + 1, Y - 1, 1, 1)
        px(ctx, shade(c, -20), back + 1, Y + 3, 1, 1)
        break
      }
      // Seen from behind: the top rail and a centre splat between two posts, the seat showing either side.
      floorShadow(ctx, X + 3, Y + 14, 10)
      px(ctx, INK, X + 4, Y + 12, 1, 4)
      px(ctx, INK, X + 11, Y + 12, 1, 4)
      px(ctx, INK, X + 3, Y + 6, 10, 7)
      px(ctx, c, X + 4, Y + 7, 8, 5)
      px(ctx, shade(c, 30), X + 4, Y + 7, 8, 1)
      px(ctx, shade(c, -24), X + 4, Y + 11, 8, 1)
      for (const bx of [X + 3, X + 10]) {
        px(ctx, INK, bx, Y - 1, 3, 13)
        px(ctx, shade(c, 12), bx + 1, Y - 1, 1, 12)
      }
      px(ctx, INK, X + 6, Y + 1, 4, 8)
      px(ctx, c, X + 7, Y + 1, 2, 7)
      px(ctx, shade(c, 20), X + 7, Y + 1, 1, 7)
      px(ctx, INK, X + 3, Y - 2, 10, 4)
      px(ctx, shade(c, 16), X + 4, Y - 1, 8, 2)
      px(ctx, shade(c, 40), X + 4, Y - 1, 8, 1)
      break
    }
    case 'officeChair':
      // Centred on its footprint: under a two-tile desk it stands in the middle, in front of the screen.
      drawOfficeChair(ctx, X + (W - TILE) / 2, Y, f.color ?? CHAIR_COLOR, face, 'all')
      break
    case 'fireplace': {
      // Brick fireplace set into the back wall (the house's chimney is above it), with a wooden mantel, a stone
      // hearth and a log fire that flickers on two frames.
      const brick = '#9d4f3a'
      px(ctx, INK, X, Y - 18, W, 31)
      px(ctx, brick, X + 1, Y - 17, W - 2, 29)
      for (let row = 0; row < 7; row++) {
        const by = Y - 14 + row * 4
        px(ctx, shade(brick, -26), X + 1, by, W - 2, 1)
        for (let bx = X + 1 + (row % 2 ? 3 : 7); bx < X + W - 1; bx += 8) px(ctx, shade(brick, -26), bx, by - 3, 1, 3)
      }
      px(ctx, INK, X - 1, Y - 21, W + 2, 4)
      px(ctx, '#8a5a2c', X, Y - 20, W, 2)
      px(ctx, '#b07a44', X, Y - 20, W, 1)
      // Opening with the fire.
      px(ctx, INK, X + 7, Y - 9, W - 14, 21)
      px(ctx, '#1c1210', X + 8, Y - 8, W - 16, 20)
      px(ctx, '#6b4a2e', X + 10, Y + 8, W - 20, 2)
      px(ctx, '#4f3520', X + 12, Y + 7, W - 24, 1)
      const flames = frame % 2 ? [3, 7, 5, 8, 4] : [6, 4, 8, 5, 7]
      flames.forEach((h, i) => {
        const fx = X + 10 + i * 2 + (i > 2 ? 1 : 0)
        px(ctx, '#e0602c', fx, Y + 7 - h, 2, h)
        px(ctx, '#f6a63a', fx, Y + 8 - Math.ceil(h * 0.6), 2, Math.ceil(h * 0.6) - 1)
        if (h > 5) px(ctx, '#fff1c4', fx, Y + 6 - Math.floor(h * 0.3), 1, 2)
      })
      // Hearth.
      px(ctx, INK, X - 1, Y + 12, W + 2, 4)
      px(ctx, '#a39a88', X, Y + 12, W, 2)
      px(ctx, '#cfc6b4', X, Y + 12, W, 1)
      break
    }
    case 'nightstand': {
      // A two-drawer bedside table on short legs, with a glazed lamp on top.
      const c = '#8a5c32'
      floorShadow(ctx, X + 2, Y + 14, 12)
      px(ctx, INK, X + 3, Y + 13, 2, 3)
      px(ctx, INK, X + 11, Y + 13, 2, 3)
      block(ctx, X + 2, Y + 3, 12, 11, c)
      px(ctx, INK, X + 3, Y + 8, 10, 1)
      px(ctx, shade(c, 20), X + 3, Y + 9, 10, 1)
      for (const dy of [Y + 6, Y + 11]) {
        px(ctx, INK, X + 7, dy, 2, 1)
        px(ctx, GOLD, X + 7, dy - 1, 2, 1)
      }
      px(ctx, INK, X + 1, Y + 1, 14, 3)
      px(ctx, shade(c, 38), X + 2, Y + 2, 12, 1)
      // Bedside lamp: a round glazed pot with a small shade.
      px(ctx, INK, X + 4, Y + 1, 8, 1)
      px(ctx, INK, X + 5, Y - 4, 6, 6)
      px(ctx, '#4f8f9f', X + 6, Y - 3, 4, 4)
      px(ctx, '#2f6f80', X + 8, Y - 3, 2, 4)
      px(ctx, '#9fd0dc', X + 6, Y - 3, 1, 2)
      px(ctx, INK, X + 7, Y - 5, 2, 1)
      drawLampShade(ctx, X + 8, Y - 10, 5, 2, 4, SHADE)
      break
    }
    case 'cooler': {
      // A water cooler: a ribbed blue bottle upside down on a white cabinet with two taps, a drip tray, a door and a
      // stack of paper cups on the side.
      const body = '#e6e2d6'
      floorShadow(ctx, X + 3, Y + 14, 11)
      px(ctx, INK, X + 4, Y + 13, 2, 3)
      px(ctx, INK, X + 10, Y + 13, 2, 3)
      block(ctx, X + 3, Y + 1, 10, 13, body)
      px(ctx, INK, X + 5, Y + 3, 6, 5)
      px(ctx, '#2e3c4a', X + 6, Y + 4, 4, 3)
      px(ctx, '#3d64ad', X + 6, Y + 4, 1, 2)
      px(ctx, '#c0473b', X + 9, Y + 4, 1, 2)
      px(ctx, CHROME, X + 6, Y + 6, 4, 1)
      px(ctx, shade(body, -26), X + 4, Y + 9, 8, 1)
      px(ctx, INK, X + 10, Y + 10, 1, 2)
      // Paper cups in a holder on the side.
      px(ctx, INK, X + 13, Y + 2, 3, 7)
      px(ctx, PAPER, X + 14, Y + 3, 1, 5)
      px(ctx, '#ffffff', X + 14, Y + 3, 1, 1)
      // The bottle, with the neck going into the cabinet, two ribs, a bubble and air at the top.
      px(ctx, INK, X + 6, Y - 1, 4, 3)
      px(ctx, '#5fb3c8', X + 7, Y, 2, 1)
      px(ctx, INK, X + 5, Y - 13, 6, 1)
      px(ctx, INK, X + 4, Y - 12, 8, 12)
      px(ctx, '#8fd3ea', X + 5, Y - 12, 6, 11)
      px(ctx, '#c8ecf6', X + 5, Y - 12, 6, 2)
      px(ctx, '#d6f2fb', X + 6, Y - 10, 1, 8)
      px(ctx, '#5fb3c8', X + 10, Y - 10, 1, 9)
      px(ctx, '#6cc0d8', X + 5, Y - 7, 6, 1)
      px(ctx, '#6cc0d8', X + 5, Y - 3, 6, 1)
      px(ctx, '#ffffff', X + 8, Y - 5, 1, 1)
      break
    }
    case 'printer': {
      // An office printer: paper standing in the feed tray at the back, a control panel with a small screen, a
      // printed page in the output slot, a paper drawer below and four little feet.
      const c = '#c3c9d0'
      floorShadow(ctx, X + 1, Y + 14, 14)
      px(ctx, INK, X + 3, Y - 4, 10, 7)
      px(ctx, PAPER, X + 4, Y - 3, 8, 5)
      px(ctx, '#ffffff', X + 4, Y - 3, 8, 1)
      px(ctx, '#d9d4c2', X + 11, Y - 2, 1, 4)
      px(ctx, INK, X + 2, Y + 13, 2, 3)
      px(ctx, INK, X + 12, Y + 13, 2, 3)
      block(ctx, X + 1, Y + 1, 14, 13, c)
      px(ctx, INK, X + 9, Y + 2, 5, 3)
      px(ctx, '#5fb3c2', X + 10, Y + 3, 2, 1)
      px(ctx, '#6fbf86', X + 12, Y + 3, 1, 1)
      px(ctx, INK, X + 3, Y + 5, 10, 1)
      px(ctx, PAPER, X + 4, Y + 6, 8, 3)
      px(ctx, PAPER_LINE, X + 5, Y + 7, 5, 1)
      px(ctx, '#d9d4c2', X + 4, Y + 8, 8, 1)
      px(ctx, INK, X + 2, Y + 10, 12, 1)
      px(ctx, shade(c, 18), X + 2, Y + 11, 12, 1)
      px(ctx, INK, X + 6, Y + 12, 4, 1)
      break
    }
    case 'trophies': {
      // A glass display cabinet built like the bookcase (crown, side panels, plinth on feet), with two glass doors:
      // cups and award plaques for the brands Timo built for.
      const wood = '#5f3c1f'
      const glass = '#2a4a58'
      const top = Y - 20
      floorShadow(ctx, X + 1, Y + 14, W - 2)
      px(ctx, INK, X, top, W, Y + 15 - top)
      px(ctx, shade(wood, 36), X + 1, top + 1, W - 2, 1)
      px(ctx, shade(wood, 12), X + 1, top + 2, W - 2, 1)
      px(ctx, shade(wood, 20), X + 1, top + 4, 1, Y + 7 - top)
      px(ctx, wood, X + 2, top + 4, 1, Y + 7 - top)
      px(ctx, shade(wood, -16), X + W - 3, top + 4, 2, Y + 7 - top)
      px(ctx, glass, X + 3, top + 4, W - 6, Y + 7 - top)
      for (let k = 0; k < 3; k++) {
        const floor = top + 12 + k * 9
        px(ctx, shade(glass, -14), X + 3, floor - 8, W - 6, 1)
        if (k === 0) {
          plaque(ctx, X + 3, floor, '#3d64ad')
          cup(ctx, X + 8, floor)
        } else if (k === 1) cup(ctx, X + 6, floor)
        else {
          plaque(ctx, X + 3, floor, '#c0473b')
          plaque(ctx, X + 8, floor, '#3f8a5e')
        }
        px(ctx, shade(wood, 26), X + 1, floor, W - 2, 1)
      }
      // The glass door: a brass knob on its frame, and light catching the glass on the diagonal.
      px(ctx, GOLD, X + W - 3, top + 16, 1, 3)
      px(ctx, GLINT, X + W - 3, top + 16, 1, 1)
      for (let k = 0; k < 6; k++) px(ctx, 'rgb(255 255 255 / 0.22)', X + 10 - Math.floor(k / 2), top + 5 + k, 1, 1)
      px(ctx, 'rgb(255 255 255 / 0.16)', X + 3, top + 4, 1, Y + 7 - top)
      // Plinth on two feet.
      px(ctx, shade(wood, 18), X + 1, Y + 12, W - 2, 1)
      px(ctx, shade(wood, -10), X + 1, Y + 13, W - 2, 1)
      for (const fx of [X, X + W - 4]) {
        px(ctx, INK, fx, Y + 15, 4, 1)
        px(ctx, shade(wood, -24), fx + 1, Y + 14, 2, 1)
      }
      break
    }
    case 'globe': {
      // A desk globe: a shaded sphere with continents, a brass meridian ring with pins at the poles, on a turned
      // wooden stand.
      const cx = X + 8
      const cy = Y - 3
      const r = 6
      floorShadow(ctx, X + 3, Y + 14, 10)
      px(ctx, INK, X + 4, Y + 12, 8, 3)
      px(ctx, '#8a5a30', X + 5, Y + 12, 6, 1)
      px(ctx, '#6b4422', X + 5, Y + 13, 6, 1)
      px(ctx, INK, X + 7, Y + 4, 2, 8)
      px(ctx, '#8a5a30', X + 7, Y + 5, 1, 7)
      px(ctx, INK, X + 6, Y + 10, 4, 2)
      for (let dy = -r; dy <= r; dy++) {
        const half = Math.round(Math.sqrt(r * r - dy * dy + 2))
        px(ctx, INK, cx - half - 1, cy + dy, 2 * half + 2, 1)
        px(ctx, '#3d86b5', cx - half, cy + dy, 2 * half, 1)
        px(ctx, '#2c6690', cx + half - 3, cy + dy, 3, 1)
        if (dy === -r || dy === r) px(ctx, INK, cx - half, cy + dy - Math.sign(dy), 2 * half, 1)
      }
      px(ctx, '#4f9a6a', cx - 4, cy - 4, 4, 3)
      px(ctx, '#4f9a6a', cx - 2, cy - 1, 2, 2)
      px(ctx, '#3f8a5e', cx + 1, cy, 3, 4)
      px(ctx, '#2f7550', cx + 3, cy + 1, 1, 3)
      px(ctx, '#d8c080', cx - 3, cy + 3, 2, 1)
      px(ctx, '#c8e8f8', cx - 4, cy - 5, 2, 1)
      px(ctx, '#c8e8f8', cx - 5, cy - 4, 1, 2)
      // Meridian ring round the right side, with the axis pins.
      for (let dy = -r - 1; dy <= r + 1; dy++) {
        const half = Math.round(Math.sqrt((r + 1) * (r + 1) - dy * dy + 2))
        px(ctx, dy < 0 ? BRASS : BRASS_DARK, cx + half, cy + dy, 1, 1)
      }
      px(ctx, BRASS, cx - 1, cy - r - 2, 2, 1)
      px(ctx, BRASS_DARK, cx - 1, cy + r + 1, 2, 1)
      break
    }
    case 'parcels': {
      // A stack of parcels waiting to go out. Every stack is a little different (sizes, cardboard, labels), so a
      // store room full of them does not repeat.
      const seed = f.x * 3 + f.y * 5
      const tones = ['#c49a62', '#b48a56', '#d0a870']
      const lower = tones[seed % 3]!
      const upper = tones[(seed + 1) % 3]!
      const o = seed % 2
      floorShadow(ctx, X + 1, Y + 14, 14)
      carton(ctx, X + 1, Y + 2, 14, 13, 3, lower)
      if (seed % 4 !== 3) {
        const w = 11 - o
        const bx = X + 2 + o * 2
        carton(ctx, bx, Y - 6, w, 9, 2, upper)
        px(ctx, '#f8f8f0', bx + 1, Y - 2, 3, 2)
        px(ctx, PAPER_LINE, bx + 1, Y - 1, 2, 1)
      } else {
        px(ctx, '#f8f8f0', X + 3, Y + 8, 4, 3)
        px(ctx, PAPER_LINE, X + 3, Y + 9, 3, 1)
      }
      if (seed % 3 !== 2) {
        // A shipping label with a red stripe.
        px(ctx, '#f8f8f0', X + 10, Y + 7, 4, 4)
        px(ctx, '#c0473b', X + 10, Y + 7, 4, 1)
        px(ctx, PAPER_LINE, X + 10, Y + 9, 3, 1)
      }
      break
    }
    case 'bench': {
      // A waiting-room bench: two wooden slats for the back, a slatted seat, metal arms and legs.
      const wood = '#9a6a3c'
      floorShadow(ctx, X + 1, Y + 14, W - 2)
      for (const lx of [X + 3, X + W - 5]) {
        px(ctx, INK, lx, Y + 3, 2, 13)
        px(ctx, METAL, lx, Y + 3, 1, 12)
      }
      px(ctx, INK, X + 1, Y - 2, W - 2, 7)
      px(ctx, wood, X + 2, Y - 1, W - 4, 2)
      px(ctx, shade(wood, 30), X + 2, Y - 1, W - 4, 1)
      px(ctx, shade(wood, -54), X + 2, Y + 1, W - 4, 1)
      px(ctx, shade(wood, -10), X + 2, Y + 2, W - 4, 2)
      px(ctx, shade(wood, 14), X + 2, Y + 2, W - 4, 1)
      px(ctx, INK, X + 1, Y + 7, W - 2, 6)
      px(ctx, shade(wood, 30), X + 2, Y + 8, W - 4, 1)
      px(ctx, wood, X + 2, Y + 9, W - 4, 1)
      px(ctx, shade(wood, -54), X + 2, Y + 10, W - 4, 1)
      px(ctx, shade(wood, -20), X + 2, Y + 11, W - 4, 1)
      for (const ax of [X, X + W - 3]) {
        px(ctx, INK, ax, Y + 4, 3, 7)
        px(ctx, CHROME, ax + 1, Y + 5, 1, 1)
        px(ctx, METAL, ax + 1, Y + 6, 1, 4)
      }
      break
    }
    case 'crate': {
      // A wooden crate: the lid's boards on top, the front framed by rails and corner posts with a diagonal brace
      // and nails at the corners.
      const c = '#a07a48'
      const frame = shade(c, -26)
      floorShadow(ctx, X + 1, Y + 14, 14)
      px(ctx, INK, X + 1, Y, 14, 14)
      px(ctx, shade(c, 22), X + 2, Y + 1, 12, 3)
      px(ctx, shade(c, 40), X + 2, Y + 1, 12, 1)
      px(ctx, shade(c, -6), X + 6, Y + 1, 1, 3)
      px(ctx, shade(c, -6), X + 10, Y + 1, 1, 3)
      px(ctx, c, X + 2, Y + 4, 12, 9)
      px(ctx, shade(c, -14), X + 4, Y + 8, 8, 1)
      for (let k = 0; k < 8; k++) px(ctx, frame, X + 4 + k, Y + 10 - Math.round((k * 4) / 7), 1, 1)
      px(ctx, frame, X + 2, Y + 4, 12, 2)
      px(ctx, frame, X + 2, Y + 11, 12, 2)
      px(ctx, shade(c, -8), X + 2, Y + 4, 2, 9)
      px(ctx, shade(c, -36), X + 12, Y + 4, 2, 9)
      px(ctx, shade(c, 8), X + 2, Y + 4, 12, 1)
      for (const [nx, ny] of [
        [3, 5],
        [12, 5],
        [3, 11],
        [12, 11]
      ] as const)
        px(ctx, '#d8d0bc', X + nx, Y + ny, 1, 1)
      break
    }
  }
}

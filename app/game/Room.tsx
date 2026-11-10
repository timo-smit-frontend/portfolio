import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useMotionPreference } from '~/components/motion/MotionPreference'
import { gameScale, setupPixelCanvas, spriteCanvas } from '~/game/canvas'
import {
  createCompanion,
  drawCompanion,
  isAt,
  onBed,
  pet,
  placeNear,
  position as companionPosition,
  remember,
  sendToBed,
  updateCompanion,
  type Bed
} from '~/game/companion'
import { applyLighting, LAMP_COLOR, lampPulse, type Light } from '~/game/lighting'
import {
  BUBBLE,
  BUBBLE_PALETTE,
  CLERK,
  CLERK_BLINK,
  CLERK_PALETTE,
  HERO_BLINK,
  HERO_FRAMES,
  HERO_HEIGHT,
  HERO_PALETTE,
  HERO_SIT,
  TALK,
  type Direction
} from '~/game/sprites'
import { quietOnPointer } from '~/game/quietFocus'
import { doorBusy, sceneRevealed, trackFocus } from '~/game/transition'
import { TURN_HOLD_MS } from '~/game/world'
import { cn } from '~/services/utils'

/**
 * A room seen from above, in the same pixel style and night lighting as the town. Walk with the arrow keys
 * (while the room has focus) or by clicking; Enter or a click uses the furniture in front of you; the mat by
 * the door takes you back outside. Everything a piece of furniture does is also a normal control in the page
 * content, so the canvas itself stays hidden from assistive tech.
 */

const TILE = 16
const INK = '#14202a'
/** Indoor darkness: lighter than the town's, the rooms are lit. */
const NIGHT = 'rgb(6 16 26 / 0.45)'
const STEP_MS = 165
/** Sitting down on an office chair: a quarter turn of the swivel, lowering onto the seat, getting up again. */
const SWIVEL_MS = 95
const SIT_MS = 190
const RISE_MS = 150
/** The seated hero, seen from behind, is cut off this many rows down: the back rest hides the rest. */
const SIT_BACK_ROWS = 14

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

export type WallDecor = { kind: 'window' | 'frame' | 'clock' | 'board' | 'whiteboard' | 'shelf' | 'mailslots'; x: number; color?: string }

type Point = { x: number; y: number }

/** The swivel's quarter turns, clockwise as seen from above: 0 faces the back wall (the desk). */
const TURNS: Direction[] = ['up', 'right', 'down', 'left']
type Swivel = { angle: number; target: number }
const poseOf = (s: Swivel) => TURNS[((Math.round(s.angle) % 4) + 4) % 4]!
/** Aim the seat at `dir` with the shortest turn from where it is heading now (a half turn goes clockwise). */
const turnTo = (s: Swivel, dir: Direction) => {
  const diff = (((TURNS.indexOf(dir) - s.target) % 4) + 4) % 4
  s.target += diff === 3 ? -1 : diff
}
const OPPOSITE: Record<Direction, Direction> = { up: 'down', down: 'up', left: 'right', right: 'left' }
const dirTo = (from: Point, to: Point): Direction => (to.x > from.x ? 'right' : to.x < from.x ? 'left' : to.y < from.y ? 'up' : 'down')

const DIRS: Record<Direction, Point> = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } }
const KEY_TO_DIR: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
  W: 'up',
  S: 'down',
  A: 'left',
  D: 'right'
}

/** How far a piece of furniture reaches above its footprint (for drawing order and clicks). */
const RISE: Record<FurnitureKind, number> = {
  desk: 12,
  shelf: 20,
  bed: 0,
  sofa: 5,
  table: 3,
  plant: 6,
  lamp: 16,
  rug: 0,
  mailbox: 7,
  counter: 4,
  crate: 0,
  chair: 2,
  officeChair: 12,
  nightstand: 10,
  cooler: 14,
  printer: 4,
  trophies: 20,
  globe: 9,
  parcels: 8,
  bench: 2,
  fireplace: 21,
  clerk: 3
}

function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.max(0, Math.min(255, ((n >> 16) & 255) + amount))
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amount))
  const b = Math.max(0, Math.min(255, (n & 255) + amount))
  return `rgb(${r} ${g} ${b})`
}

type Ctx = CanvasRenderingContext2D
const px = (ctx: Ctx, color: string, x: number, y: number, w = 1, h = 1) => {
  ctx.fillStyle = color
  ctx.fillRect(x, y, w, h)
}

const BRASS = '#d9a84a'
const CHAIR_COLOR = '#4b5f78'
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
function drawOfficeChair(ctx: Ctx, X: number, Y: number, c: string, face: Direction, part: 'all' | 'base' | 'front') {
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

function drawFurniture(ctx: Ctx, f: Furniture, lit: boolean, frame = 0, face: Direction = 'up') {
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
      px(ctx, '#d9d4c2', X + W / 2 - 6, Y + 2, 12, 3)
      px(ctx, '#9a9586', X + W / 2 - 6, Y + 4, 12, 1)
      px(ctx, '#efe7d6', X + 4, Y, 4, 4)
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
      const c = f.color ?? '#35589c'
      px(ctx, shadow, X + 1, Y + H - 2, W - 2, 2)
      px(ctx, INK, X, Y, W, H - 1)
      px(ctx, '#7d532c', X + 1, Y + 1, W - 2, 5)
      px(ctx, '#efe7d6', X + 2, Y + 6, W - 4, H - 8)
      px(ctx, '#ffffff', X + 4, Y + 7, W / 2 - 6, 6)
      px(ctx, '#ffffff', X + W / 2 + 2, Y + 7, W / 2 - 6, 6)
      px(ctx, c, X + 2, Y + 15, W - 4, H - 17)
      px(ctx, shade(c, 25), X + 2, Y + 15, W - 4, 2)
      px(ctx, shade(c, -25), X + 2, Y + H - 4, W - 4, 2)
      break
    }
    case 'sofa': {
      const c = f.color ?? '#2f7f8a'
      px(ctx, shadow, X + 1, Y + 14, W - 2, 2)
      px(ctx, INK, X, Y - 6, W, 20)
      // Back rest with a lit top edge.
      px(ctx, shade(c, -26), X + 1, Y - 5, W - 2, 8)
      px(ctx, shade(c, -6), X + 1, Y - 5, W - 2, 1)
      // Two seat cushions.
      const half = Math.floor((W - 8) / 2)
      for (const cx of [X + 4, X + 4 + half]) {
        px(ctx, c, cx, Y + 2, half - 1, 9)
        px(ctx, shade(c, 26), cx, Y + 2, half - 1, 1)
        px(ctx, shade(c, -18), cx, Y + 9, half - 1, 2)
      }
      // Arms, a little higher than the seat.
      px(ctx, shade(c, -12), X + 1, Y - 3, 3, 15)
      px(ctx, shade(c, -12), X + W - 4, Y - 3, 3, 15)
      px(ctx, shade(c, 12), X + 1, Y - 3, 3, 1)
      px(ctx, shade(c, 12), X + W - 4, Y - 3, 3, 1)
      // Throw pillows.
      px(ctx, INK, X + 5, Y - 3, 6, 5)
      px(ctx, '#e4b84a', X + 6, Y - 2, 4, 3)
      px(ctx, INK, X + W - 11, Y - 3, 6, 5)
      px(ctx, '#f4efe0', X + W - 10, Y - 2, 4, 3)
      // Feet.
      px(ctx, INK, X + 2, Y + 13, 2, 2)
      px(ctx, INK, X + W - 4, Y + 13, 2, 2)
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
      // No wind indoors: the trees outside sway, a potted plant stands still.
      px(ctx, shadow, X + 3, Y + 14, 10, 2)
      px(ctx, INK, X + 4, Y + 8, 8, 7)
      px(ctx, f.color ?? '#b8633a', X + 5, Y + 8, 6, 6)
      // Round leafy crown: outline rows narrow at the top and bottom.
      const lx = X
      px(ctx, INK, lx + 4, Y - 7, 8, 1)
      px(ctx, INK, lx + 2, Y - 6, 12, 1)
      px(ctx, INK, lx + 1, Y - 5, 14, 10)
      px(ctx, INK, lx + 2, Y + 5, 12, 1)
      px(ctx, INK, lx + 4, Y + 6, 8, 1)
      px(ctx, '#2f7550', lx + 4, Y - 6, 8, 1)
      px(ctx, '#2f7550', lx + 2, Y - 5, 12, 10)
      px(ctx, '#2f7550', lx + 4, Y + 5, 8, 1)
      px(ctx, '#4f9a6a', lx + 4, Y - 5, 6, 5)
      px(ctx, '#4f9a6a', lx + 9, Y + 1, 4, 3)
      px(ctx, '#6fbf86', lx + 5, Y - 4, 2, 2)
      px(ctx, '#6fbf86', lx + 10, Y + 1, 1, 1)
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
      const c = f.color ?? '#b8433a'
      px(ctx, shadow, X + 3, Y + 14, 10, 2)
      px(ctx, INK, X + 6, Y + 2, 4, 13)
      px(ctx, '#4a566e', X + 7, Y + 2, 2, 12)
      px(ctx, INK, X + 1, Y - 7, 14, 11)
      px(ctx, c, X + 2, Y - 6, 12, 9)
      px(ctx, shade(c, 28), X + 2, Y - 6, 12, 1)
      px(ctx, INK, X + 4, Y - 3, 8, 2)
      px(ctx, '#e4b84a', X + 13, Y - 10, 1, 5)
      px(ctx, '#e4b84a', X + 14, Y - 10, 2, 2)
      break
    }
    case 'counter': {
      const c = f.color ?? '#4f6fb3'
      px(ctx, shadow, X + 1, Y + 14, W - 2, 2)
      px(ctx, INK, X, Y - 4, W, 19)
      px(ctx, '#b89058', X + 1, Y - 3, W - 2, 7)
      px(ctx, '#d6b27a', X + 1, Y - 3, W - 2, 1)
      px(ctx, c, X + 1, Y + 4, W - 2, 10)
      for (let k = X + 8; k < X + W - 4; k += 16) px(ctx, shade(c, -25), k, Y + 5, 1, 9)
      px(ctx, '#efe7d6', X + 6, Y - 2, 8, 4)
      px(ctx, '#e4b84a', X + W - 12, Y - 3, 5, 3)
      px(ctx, INK, X + W - 10, Y - 4, 1, 1)
      break
    }
    case 'chair': {
      const c = f.color ?? '#7d532c'
      if (f.face) {
        // Side on, facing the table: the seat, with the back rest standing up on the far side.
        const back = f.face === 'right' ? X + 3 : X + 10
        px(ctx, shadow, X + 3, Y + 14, 10, 2)
        px(ctx, INK, X + 3, Y + 5, 10, 9)
        px(ctx, c, X + 4, Y + 6, 8, 7)
        px(ctx, shade(c, 30), X + 4, Y + 6, 8, 1)
        px(ctx, INK, back, Y - 2, 3, 16)
        px(ctx, shade(c, 18), back + 1, Y - 1, 1, 14)
        px(ctx, INK, X + 4, Y + 14, 1, 2)
        px(ctx, INK, X + 11, Y + 14, 1, 2)
        break
      }
      // Seen from behind: the seat, with the back rest nearest to you.
      px(ctx, shadow, X + 3, Y + 14, 10, 2)
      px(ctx, INK, X + 3, Y + 1, 10, 13)
      px(ctx, shade(c, 18), X + 4, Y + 2, 8, 5)
      px(ctx, c, X + 4, Y + 7, 8, 6)
      px(ctx, shade(c, 30), X + 4, Y + 7, 8, 1)
      px(ctx, INK, X + 4, Y + 14, 1, 2)
      px(ctx, INK, X + 11, Y + 14, 1, 2)
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
      px(ctx, shadow, X + 2, Y + 14, 12, 2)
      px(ctx, INK, X + 2, Y + 3, 12, 12)
      px(ctx, '#9a6a3c', X + 3, Y + 4, 10, 5)
      px(ctx, '#7d532c', X + 3, Y + 9, 10, 5)
      px(ctx, '#e4b84a', X + 7, Y + 11, 2, 1)
      // Bedside lamp: a round glazed pot with a small shade.
      px(ctx, INK, X + 4, Y + 2, 8, 1)
      px(ctx, INK, X + 5, Y - 3, 6, 6)
      px(ctx, '#4f8f9f', X + 6, Y - 2, 4, 4)
      px(ctx, '#2f6f80', X + 8, Y - 2, 2, 4)
      px(ctx, '#9fd0dc', X + 6, Y - 2, 1, 2)
      px(ctx, INK, X + 7, Y - 4, 2, 1)
      drawLampShade(ctx, X + 8, Y - 9, 5, 2, 4, SHADE)
      break
    }
    case 'cooler': {
      px(ctx, shadow, X + 3, Y + 14, 10, 2)
      px(ctx, INK, X + 3, Y + 2, 10, 13)
      px(ctx, '#e6e2d6', X + 4, Y + 3, 8, 11)
      px(ctx, '#c8c2b2', X + 4, Y + 10, 8, 4)
      px(ctx, '#3d64ad', X + 6, Y + 5, 4, 2)
      px(ctx, INK, X + 4, Y - 12, 8, 14)
      px(ctx, '#8fd3ea', X + 5, Y - 11, 6, 12)
      px(ctx, '#d6f2fb', X + 6, Y - 10, 1, 9)
      break
    }
    case 'printer': {
      px(ctx, shadow, X + 1, Y + 14, 14, 2)
      px(ctx, INK, X + 1, Y + 2, 14, 13)
      px(ctx, '#b9c0c8', X + 2, Y + 3, 12, 7)
      px(ctx, '#8a929c', X + 2, Y + 10, 12, 4)
      px(ctx, '#f8f8f0', X + 4, Y - 3, 8, 6)
      px(ctx, INK, X + 4, Y - 4, 8, 1)
      px(ctx, '#6fbf86', X + 12, Y + 11, 1, 1)
      break
    }
    case 'trophies': {
      // Glass cabinet with plaques and gold cups: the brands Timo built for.
      const top = Y - 20
      px(ctx, shadow, X + 1, Y + 14, W - 2, 2)
      px(ctx, INK, X, top, W, Y + 15 - top)
      px(ctx, '#5f3c1f', X + 1, top + 1, W - 2, Y + 13 - top)
      px(ctx, '#2a4a58', X + 2, top + 2, W - 4, Y + 9 - top)
      for (let shelf = 0; shelf < 3; shelf++) {
        const sy = top + 10 + shelf * 10
        px(ctx, '#7d532c', X + 2, sy, W - 4, 1)
        if (shelf === 1) {
          px(ctx, '#e4b84a', X + 4, sy - 6, 3, 3)
          px(ctx, '#b8862e', X + 5, sy - 3, 1, 3)
          px(ctx, '#e4b84a', X + 9, sy - 7, 4, 4)
          px(ctx, '#b8862e', X + 10, sy - 3, 2, 3)
        } else {
          px(ctx, '#f8f8f0', X + 3, sy - 6, 4, 6)
          px(ctx, '#3d64ad', X + 4, sy - 4, 2, 2)
          px(ctx, '#f8f8f0', X + 8, sy - 6, 5, 6)
          px(ctx, '#c0473b', X + 9, sy - 4, 3, 2)
        }
      }
      px(ctx, 'rgb(255 255 255 / 0.25)', X + 3, top + 3, 1, Y + 5 - top)
      break
    }
    case 'globe': {
      px(ctx, shadow, X + 3, Y + 14, 10, 2)
      px(ctx, INK, X + 5, Y + 11, 6, 4)
      px(ctx, '#7d532c', X + 6, Y + 12, 4, 2)
      px(ctx, INK, X + 7, Y + 6, 2, 6)
      px(ctx, INK, X + 2, Y - 9, 12, 14)
      px(ctx, INK, X + 3, Y - 10, 10, 16)
      px(ctx, '#3d86b5', X + 3, Y - 9, 10, 14)
      px(ctx, '#4f9a6a', X + 5, Y - 7, 4, 3)
      px(ctx, '#4f9a6a', X + 8, Y - 2, 3, 4)
      px(ctx, '#c8e8f8', X + 4, Y - 8, 1, 2)
      break
    }
    case 'parcels': {
      px(ctx, shadow, X + 1, Y + 14, 14, 2)
      px(ctx, INK, X + 1, Y + 4, 14, 11)
      px(ctx, '#c49a62', X + 2, Y + 5, 12, 9)
      px(ctx, '#e8d7a8', X + 7, Y + 5, 2, 9)
      px(ctx, INK, X + 3, Y - 5, 9, 10)
      px(ctx, '#d6ae74', X + 4, Y - 4, 7, 8)
      px(ctx, '#e8d7a8', X + 4, Y, 7, 1)
      px(ctx, '#c0473b', X + 9, Y - 3, 2, 2)
      break
    }
    case 'bench': {
      px(ctx, shadow, X + 1, Y + 14, W - 2, 2)
      px(ctx, INK, X + 1, Y + 1, W - 2, 6)
      px(ctx, '#9a6a3c', X + 2, Y + 2, W - 4, 4)
      px(ctx, INK, X + 1, Y + 8, W - 2, 5)
      px(ctx, '#b7804a', X + 2, Y + 9, W - 4, 3)
      px(ctx, INK, X + 2, Y + 13, 2, 3)
      px(ctx, INK, X + W - 4, Y + 13, 2, 3)
      break
    }
    case 'crate': {
      const c = '#a07a48'
      px(ctx, shadow, X + 1, Y + 14, 14, 2)
      px(ctx, INK, X + 1, Y + 1, 14, 14)
      px(ctx, c, X + 2, Y + 2, 12, 12)
      px(ctx, shade(c, -30), X + 2, Y + 7, 12, 2)
      for (let k = 0; k < 10; k++) px(ctx, shade(c, -30), X + 3 + k, Y + 3 + k, 1, 1)
      px(ctx, shade(c, 25), X + 2, Y + 2, 12, 1)
      break
    }
  }
}

function drawDecor(ctx: Ctx, d: WallDecor, anim: number, paused: boolean, moon: boolean) {
  const X = d.x * TILE
  switch (d.kind) {
    case 'window': {
      px(ctx, INK, X + 2, 4, 28, 20)
      px(ctx, '#efe7d6', X + 3, 5, 26, 18)
      px(ctx, '#12304a', X + 5, 7, 22, 14)
      // There is one moon in the sky: only the first window of a room shows it.
      if (moon) {
        px(ctx, '#f4efe0', X + 20, 9, 3, 3)
        px(ctx, '#12304a', X + 21, 9, 2, 2)
      }
      // A different patch of stars in every window; each twinkles on its own beat.
      const seed = d.x * 7
      for (const [sx, sy, twinkle] of [
        [8, 9, false],
        [12, 15, true],
        [24, 17, false],
        [17, 12, false]
      ] as const) {
        const starX = 6 + ((sx - 6 + seed) % 20)
        const on = twinkle && !paused && (anim + d.x) % 2 === 1
        px(ctx, on ? '#f6cf6a' : '#c8d4e8', X + starX, sy, 1, 1)
      }
      px(ctx, '#efe7d6', X + 15, 7, 2, 14)
      px(ctx, '#efe7d6', X + 5, 13, 22, 1)
      px(ctx, '#d9cfbb', X + 1, 23, 30, 2)
      px(ctx, d.color ?? '#a84552', X, 3, 3, 21)
      px(ctx, d.color ?? '#a84552', X + 29, 3, 3, 21)
      break
    }
    case 'frame':
      px(ctx, INK, X + 3, 6, 10, 12)
      px(ctx, '#b98c55', X + 4, 7, 8, 10)
      px(ctx, d.color ?? '#5f9fb0', X + 5, 8, 6, 8)
      px(ctx, '#efe7d6', X + 6, 12, 4, 2)
      break
    case 'clock':
      px(ctx, INK, X + 4, 6, 8, 10)
      px(ctx, INK, X + 3, 7, 10, 8)
      px(ctx, '#efe7d6', X + 4, 7, 8, 8)
      {
        // The real time (it only changes once a minute, so it is not motion).
        const now = new Date()
        const hand = (turns: number, length: number) => {
          const a = turns * Math.PI * 2
          for (let k = 0; k <= length; k++) px(ctx, INK, X + 8 + Math.round(Math.sin(a) * k), 11 - Math.round(Math.cos(a) * k), 1, 1)
        }
        hand((now.getHours() % 12) / 12 + now.getMinutes() / 720, 2)
        hand(now.getMinutes() / 60, 3)
      }
      break
    case 'board':
      px(ctx, INK, X + 2, 5, 28, 17)
      px(ctx, '#b98c55', X + 3, 6, 26, 15)
      px(ctx, '#f4efe0', X + 5, 8, 6, 5)
      px(ctx, '#f6cf6a', X + 13, 10, 6, 6)
      px(ctx, '#9fd0c4', X + 21, 8, 6, 5)
      px(ctx, '#f2a7a0', X + 8, 14, 7, 5)
      px(ctx, '#c0473b', X + 7, 8, 1, 1)
      px(ctx, '#c0473b', X + 15, 10, 1, 1)
      break
    case 'whiteboard':
      px(ctx, INK, X + 1, 5, 30, 17)
      px(ctx, '#f4f6f8', X + 2, 6, 28, 15)
      px(ctx, '#3d64ad', X + 5, 9, 9, 1)
      px(ctx, '#3d64ad', X + 5, 12, 14, 1)
      px(ctx, '#c0473b', X + 5, 15, 6, 1)
      px(ctx, '#3f8a5e', X + 20, 9, 6, 6)
      px(ctx, '#f4f6f8', X + 21, 10, 4, 4)
      px(ctx, '#8a929c', X + 4, 21, 24, 2)
      break
    case 'mailslots': {
      // Pigeonholes full of letters, three tiles wide.
      px(ctx, INK, X + 1, 3, 46, 21)
      px(ctx, '#7d532c', X + 2, 4, 44, 19)
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 7; col++) {
          const cx = X + 3 + col * 6
          const cy = 5 + row * 6
          px(ctx, '#3e2a16', cx, cy, 5, 5)
          if ((row * 7 + col) % 3 !== 1) px(ctx, (row + col) % 2 ? '#f8f8f0' : '#f6cf6a', cx + 1, cy + 2, 3, 3)
        }
      }
      break
    }
    case 'shelf': {
      px(ctx, INK, X + 2, 16, 28, 3)
      px(ctx, '#7d532c', X + 3, 16, 26, 2)
      const colors = ['#c0473b', '#e4b84a', '#3f8a5e', '#35589c', '#efe7d6']
      colors.forEach((c, k) => px(ctx, c, X + 5 + k * 3, 9 + (k % 2), 2, 7 - (k % 2)))
      px(ctx, '#b8633a', X + 22, 12, 5, 4)
      px(ctx, '#4f9a6a', X + 21, 8, 7, 4)
      break
    }
  }
}

export default function Room({
  cols,
  rows,
  wall,
  floor,
  furniture,
  decor = [],
  spawnX,
  label,
  describedBy,
  exitLabel,
  companion,
  onSelect,
  onExit,
  className
}: {
  cols: number
  rows: number
  wall: string
  floor: string
  furniture: Furniture[]
  decor?: WallDecor[]
  /** Column of the door in the front wall; the player starts on the mat there. */
  spawnX: number
  label: string
  /** Id of the visible text that explains the controls. */
  describedBy?: string
  exitLabel: string
  /** Pip comes along (once you have made friends); the label shows on hover. */
  companion?: { label: string } | null
  onSelect?: (id: string) => void
  onExit?: () => void
  className?: string
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { paused } = useMotionPreference()
  const pausedRef = useRef(paused)
  const furnitureRef = useRef(furniture)
  const callbacks = useRef({ onSelect, onExit })
  const hoverRef = useRef<string | null>(null)
  const geometry = useRef({ scale: 2, ox: 0, oy: 0 })
  // The hover label sits just above the thing it names (anchor in room art pixels), never on top of it. The
  // frame loop keeps it in place while the camera moves.
  const [hover, setHover] = useState<{ label: string; ax: number; ay: number } | null>(null)
  const hoverAnchor = useRef<{ ax: number; ay: number } | null>(null)
  const hoverEl = useRef<HTMLSpanElement>(null)
  const [prompt, setPrompt] = useState<string | null>(null)
  const promptRef = useRef<string | null>(null)
  const exit = { x: spawnX, y: rows - 1 }
  const player = useRef({
    tile: { x: spawnX, y: rows - 1 },
    from: null as Point | null,
    to: null as Point | null,
    t: 0,
    steps: 0,
    dir: 'up' as Direction,
    path: [] as Point[],
    pending: null as { id: string; face: Direction } | null,
    held: null as Direction | null,
    holdUntil: 0,
    leaving: false,
    /** The office chair you are on: sitting down ('in'), sitting, or getting up to step `out` that way. */
    seat: null as { id: string; phase: 'in' | 'seated' | 'out'; out: Direction; face: Direction } | null,
    /** 0 standing, 1 sitting. */
    sit: 0
  })
  /** Where every office chair is turned; a chair stays the way you left it. */
  const swivels = useRef(new Map<string, Swivel>())
  const swivelOf = (id: string) => {
    let s = swivels.current.get(id)
    if (!s) {
      s = { angle: 0, target: 0 }
      swivels.current.set(id, s)
    }
    return s
  }

  const pip = useRef<ReturnType<typeof createCompanion> | null>(null)
  const companionRef = useRef(companion)
  companionRef.current = companion

  pausedRef.current = paused
  furnitureRef.current = furniture
  callbacks.current = { onSelect, onExit }

  // Rugs and office chairs are not in the way: you walk over a rug and sit down on a chair.
  const itemAt = (x: number, y: number) =>
    furnitureRef.current.find(
      (f) => f.kind !== 'rug' && f.kind !== 'officeChair' && x >= f.x && x < f.x + (f.w ?? 1) && y >= f.y && y < f.y + (f.h ?? 1)
    )

  /** An office chair can stand over two tiles (centred under a desk); stepping onto either one sits you down. */
  const seatAt = (x: number, y: number) =>
    furnitureRef.current.find((f) => f.kind === 'officeChair' && f.y === y && x >= f.x && x < f.x + (f.w ?? 1))

  const walkable = (x: number, y: number) => {
    if (x === exit.x && y === exit.y) return true
    if (x < 1 || x > cols - 2 || y < 2 || y > rows - 2) return false
    return !itemAt(x, y)
  }

  /** Pip goes everywhere you go, except onto your chair. */
  const pipWalkable = (x: number, y: number) => walkable(x, y) && !seatAt(x, y)

  const findPath = (from: Point, goals: Point[], canWalk = walkable) => {
    const key = (p: Point) => `${p.x},${p.y}`
    const goalKeys = new Set(goals.map(key))
    const prev = new Map<string, string | null>([[key(from), null]])
    const queue = [from]
    let found: Point | null = goalKeys.has(key(from)) ? from : null
    while (queue.length && !found) {
      const node = queue.shift()!
      for (const d of Object.values(DIRS)) {
        const next = { x: node.x + d.x, y: node.y + d.y }
        const k = key(next)
        if (prev.has(k) || !canWalk(next.x, next.y)) continue
        prev.set(k, key(node))
        if (goalKeys.has(k)) {
          found = next
          break
        }
        // A route ends on a chair (you sit down), it does not run over one.
        if (!seatAt(next.x, next.y)) queue.push(next)
      }
    }
    if (!found) return null
    const steps: Point[] = []
    let k: string | null = key(found)
    while (k && k !== key(from)) {
      const [x, y] = k.split(',').map(Number)
      steps.unshift({ x: x!, y: y! })
      k = prev.get(k) ?? null
    }
    return steps
  }

  /**
   * At home Pip goes to bed: the floor tiles beside the bed he can hop up from, and where he curls up (in the
   * middle of the blanket, over the foot end).
   */
  const bedFor = (): Bed | null => {
    const bed = furnitureRef.current.find((f) => f.kind === 'bed')
    if (!bed) return null
    const w = bed.w ?? 1
    const h = bed.h ?? 1
    const ways: Bed['ways'] = []
    for (let k = 0; k < w; k++) ways.push({ side: { x: bed.x + k, y: bed.y + h }, onto: { x: bed.x + k, y: bed.y + h - 1 } })
    for (let k = 0; k < h; k++) {
      ways.push({ side: { x: bed.x - 1, y: bed.y + k }, onto: { x: bed.x, y: bed.y + k } })
      ways.push({ side: { x: bed.x + w, y: bed.y + k }, onto: { x: bed.x + w - 1, y: bed.y + k } })
    }
    return {
      ways: ways.filter((way) => pipWalkable(way.side.x, way.side.y)),
      perch: { x: bed.x * TILE + (w * TILE - 16) / 2, y: (bed.y + h) * TILE - 22 }
    }
  }

  /** Pip's next step towards the bed, round you (and wherever you are stepping to). */
  const routeToBed = (from: Point) => {
    const c = pip.current
    if (!c?.bed) return null
    const p = player.current
    const free = (x: number, y: number) =>
      pipWalkable(x, y) && !(x === p.tile.x && y === p.tile.y) && !(p.to && x === p.to.x && y === p.to.y)
    return (
      findPath(
        from,
        c.bed.ways.map((way) => way.side),
        free
      )?.[0] ?? null
    )
  }

  const activate = (id: string) => callbacks.current.onSelect?.(id)

  /** Walk on to `next`; a chair you walk up to turns its seat towards you. */
  const startStep = (next: Point) => {
    const p = player.current
    const seat = seatAt(next.x, next.y)
    if (seat && seat !== seatAt(p.tile.x, p.tile.y)) turnTo(swivelOf(seat.id), OPPOSITE[dirTo(p.tile, next)])
    p.from = { ...p.tile }
    p.to = next
    p.t = 0
  }

  const tryStep = (dir: Direction) => {
    const p = player.current
    if (p.from || p.leaving) return
    p.dir = dir
    const next = { x: p.tile.x + DIRS[dir].x, y: p.tile.y + DIRS[dir].y }
    if (walkable(next.x, next.y)) {
      startStep(next)
    } else if (dir === 'down' && p.tile.x === exit.x && p.tile.y === exit.y && !doorBusy()) {
      // Still coming in through the door: you can only go back out once it has opened fully.
      p.leaving = true
      callbacks.current.onExit?.()
    }
  }

  const facingItem = () => {
    const p = player.current
    const at = { x: p.tile.x + DIRS[p.dir].x, y: p.tile.y + DIRS[p.dir].y }
    const item = itemAt(at.x, at.y)
    return item && item.interactive !== false ? item : null
  }

  /** On the mat facing out: Enter (or Down) goes back to town, the same as a door outside. */
  const facingExit = () => {
    const p = player.current
    return !p.leaving && p.dir === 'down' && p.tile.x === exit.x && p.tile.y === exit.y
  }

  const facingPip = () => {
    const p = player.current
    const c = pip.current
    return Boolean(c && isAt(c, p.tile.x + DIRS[p.dir].x, p.tile.y + DIRS[p.dir].y))
  }

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return

    const artW = cols * TILE
    const artH = rows * TILE + 24
    const layer = document.createElement('canvas')
    let ctx = setupPixelCanvas(canvas, wrap.clientWidth, wrap.clientHeight)

    const box = { width: wrap.clientWidth, height: wrap.clientHeight }
    /**
     * Camera: a room that fits its box is centred in it; a bigger one follows `focus` (the player), clamped to
     * the room's edges, in steps of one device pixel so the art stays crisp. The room spans x 0..artW and
     * y -24..rows*TILE (the strip above the back wall leaves room for tall furniture and the "!" bubble).
     */
    const place = (focus: Point) => {
      const { scale } = geometry.current
      const dpr = Math.max(1, Math.round(window.devicePixelRatio || 1))
      const snap = (v: number) => Math.round(v * scale * dpr) / (scale * dpr)
      const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
      const vw = box.width / scale
      const vh = box.height / scale
      const ox = vw >= artW ? Math.round((vw - artW) / 2) : -snap(clamp(focus.x + 8 - vw / 2, 0, artW - vw))
      const oy = vh >= artH ? Math.round((vh - artH) / 2) + 24 : -snap(clamp(focus.y + 8 - vh / 2, -24, artH - 24 - vh))
      geometry.current = { scale, ox, oy }
    }

    const resize = () => {
      box.width = wrap.clientWidth
      box.height = wrap.clientHeight
      // The same scale as the town (from the screen, not this box), so you are the same size inside and out.
      const scale = gameScale(document.documentElement.clientWidth, window.innerHeight)
      ctx = setupPixelCanvas(canvas, box.width, box.height)
      geometry.current = { ...geometry.current, scale }
      const p = player.current
      place({ x: p.tile.x * TILE, y: p.tile.y * TILE })
      layer.width = Math.ceil(box.width / scale) + 2
      layer.height = Math.ceil(box.height / scale) + 2
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(wrap)
    window.addEventListener('resize', resize)

    /**
     * Side and front walls, seen from above, around the door gap. `night` repaints them over the lighting in a
     * flat night shade, so lamp and window light stays on the floor instead of shining through the walls.
     */
    const drawWallTops = (night: boolean) => {
      const W = cols * TILE
      const Hh = rows * TILE
      const dx = exit.x * TILE
      const rects: [string, number, number, number, number][] = [
        [shade(wall, -78), 0, 0, TILE, Hh],
        [shade(wall, -78), W - TILE, 0, TILE, Hh],
        [shade(wall, -78), 0, Hh - TILE, dx, TILE],
        [shade(wall, -78), dx + TILE, Hh - TILE, W - dx - TILE, TILE],
        [shade(wall, -50), TILE - 2, 2 * TILE, 2, Hh - 3 * TILE],
        [shade(wall, -50), W - TILE, 2 * TILE, 2, Hh - 3 * TILE],
        [shade(wall, -50), TILE, Hh - TILE, dx - TILE, 2],
        [shade(wall, -50), dx + TILE, Hh - TILE, W - dx - 2 * TILE, 2]
      ]
      for (const [color, x, y, w, h] of rects) {
        px(ctx, color, x, y, w, h)
        if (night) px(ctx, NIGHT, x, y, w, h)
      }
    }

    const drawRoom = (anim: number) => {
      const W = cols * TILE
      const Hh = rows * TILE
      // Floor: wooden planks.
      for (let y = 2 * TILE; y < Hh - TILE; y++) {
        const row = Math.floor((y - 2 * TILE) / 4)
        const seam = (y - 2 * TILE) % 4 === 3
        px(ctx, seam ? shade(floor, -26) : row % 2 ? floor : shade(floor, -8), TILE, y, W - 2 * TILE, 1)
        if (!seam) {
          for (let x = TILE + ((row * 11) % 24); x < W - TILE; x += 24) px(ctx, shade(floor, -26), x, y, 1, 1)
        }
      }
      // Back wall: trim, wallpaper with stripes, wainscot, baseboard.
      px(ctx, shade(wall, -70), 0, 0, W, 3)
      px(ctx, wall, 0, 3, W, 19)
      for (let x = 2; x < W; x += 6) px(ctx, shade(wall, 10), x, 3, 1, 19)
      px(ctx, '#efe7d6', 0, 22, W, 1)
      px(ctx, shade(wall, -28), 0, 23, W, 6)
      for (let x = 8; x < W; x += 16) px(ctx, shade(wall, -40), x, 23, 1, 6)
      px(ctx, shade(wall, -56), 0, 29, W, 3)
      const moonWindow = decor.find((d) => d.kind === 'window')
      for (const d of decor) drawDecor(ctx, d, anim, pausedRef.current, d === moonWindow)
      // Shadow the back wall casts on the floor.
      px(ctx, 'rgb(6 14 20 / 0.25)', TILE, 2 * TILE, W - 2 * TILE, 3)
      drawWallTops(false)
      // Door gap with a mat and an arrow out.
      const dx = exit.x * TILE
      const dy = exit.y * TILE
      px(ctx, shade(floor, -18), dx, dy, TILE, TILE)
      px(ctx, '#9c3b33', dx + 1, dy + 1, 14, 12)
      px(ctx, '#b8433a', dx + 2, dy + 2, 12, 10)
      px(ctx, '#f4efe0', dx + 7, dy + 3, 2, 5)
      px(ctx, '#f4efe0', dx + 5, dy + 7, 6, 1)
      px(ctx, '#f4efe0', dx + 6, dy + 8, 4, 1)
      px(ctx, '#f4efe0', dx + 7, dy + 9, 2, 1)
    }

    let raf = 0
    let last = performance.now()
    let clock = 0
    let visible = true

    const frame = (now: number) => {
      const dt = Math.max(0, Math.min(now - last, 50))
      last = now
      const still = pausedRef.current
      if (!still) clock += dt
      const anim = Math.floor(clock / 520) % 2
      const p = player.current

      // Chairs swivel a quarter turn at a time towards where they are aimed.
      for (const s of swivels.current.values()) {
        if (still) s.angle = s.target
        else if (s.angle < s.target) s.angle = Math.min(s.target, s.angle + dt / SWIVEL_MS)
        else if (s.angle > s.target) s.angle = Math.max(s.target, s.angle - dt / SWIVEL_MS)
      }
      const rate = (ms: number) => (still ? 1 : dt / ms)
      if (p.seat && !p.from) {
        const seat = p.seat
        const s = swivelOf(seat.id)
        // A route from a click gets you up first, out the side it leaves by.
        if (seat.phase !== 'out' && p.path[0]) {
          seat.phase = 'out'
          seat.out = dirTo(p.tile, p.path[0])
        }
        if (seat.phase === 'in') {
          // Turn the seat to the side you came from, sit down, then swivel round to the desk.
          if (p.sit < 1) {
            turnTo(s, seat.face)
            if (s.angle === s.target) {
              p.dir = seat.face
              p.sit = Math.min(1, p.sit + rate(SIT_MS))
            }
          } else {
            turnTo(s, 'up')
            p.dir = poseOf(s)
            if (s.angle === s.target) seat.phase = 'seated'
          }
        } else if (seat.phase === 'seated') {
          p.dir = poseOf(s)
          if (p.pending) {
            // Sitting at the desk you clicked: now use it.
            const { id, face } = p.pending
            p.pending = null
            turnTo(s, face)
            p.dir = face
            activate(id)
          }
        } else {
          // Getting up: swivel towards where you are going, stand, and step off.
          turnTo(s, seat.out)
          p.dir = poseOf(s)
          if (s.angle === s.target) {
            p.sit = Math.max(0, p.sit - rate(RISE_MS))
            if (p.sit === 0) {
              p.seat = null
              p.dir = seat.out
              if (!p.path.length) tryStep(seat.out)
            }
          }
        }
      }

      if (!p.from && !p.leaving && !p.seat) {
        const next = p.path.shift()
        const chair = seatAt(p.tile.x, p.tile.y)
        const walkingOn = p.held && now >= p.holdUntil && walkable(p.tile.x + DIRS[p.held].x, p.tile.y + DIRS[p.held].y)
        if (next) {
          p.dir = dirTo(p.tile, next)
          startStep(next)
        } else if (chair && !walkingOn) {
          // Stopped on a chair: sit down on it (whatever you clicked waits until you sit).
          p.seat = { id: chair.id, phase: 'in', out: 'down', face: OPPOSITE[p.dir] }
          p.sit = 0
        } else if (p.pending && !(p.pending.id === '__exit' && doorBusy())) {
          // Clicked the exit while still coming in: you step out as soon as the door has opened fully.
          const { id, face } = p.pending
          p.pending = null
          p.dir = face
          if (id === '__exit') {
            p.leaving = true
            callbacks.current.onExit?.()
          } else activate(id)
        } else if (p.held && now >= p.holdUntil) tryStep(p.held)
      }
      // A step that starts this frame (from a route or a key press) leaves a tile for Pip.
      if (p.from && p.t === 0 && pip.current) remember(pip.current, p.from)
      if (p.from && p.to) {
        p.t += dt / STEP_MS
        if (p.t >= 1) {
          p.tile = p.to
          p.from = null
          p.to = null
          p.steps++
        }
      }
      // Pip walks in with you (once you are friends) and follows you around the room.
      if (companionRef.current && !pip.current) {
        pip.current = createCompanion(p.tile, false)
        placeNear(pip.current, { x: exit.x, y: exit.y - 1 }, pipWalkable)
        // Home: Pip trots off to the bed, jumps on it and goes to sleep.
        const bed = bedFor()
        if (bed?.ways.length) sendToBed(pip.current, bed)
      }
      // Heading for the bed, Pip waits until the door circle has opened up, so you see him trot off and hop up.
      const pipWaits = Boolean(pip.current?.bed && !pip.current.hop && !pip.current.asleep && !sceneRevealed())
      if (pip.current && !pipWaits) updateCompanion(pip.current, p.to ?? p.tile, dt, pipWalkable, STEP_MS, routeToBed)
      const pos =
        p.from && p.to
          ? { x: (p.from.x + (p.to.x - p.from.x) * p.t) * TILE, y: (p.from.y + (p.to.y - p.from.y) * p.t) * TILE }
          : { x: p.tile.x * TILE, y: p.tile.y * TILE }
      // Sitting down you slide over to the middle of the chair (and back to your tile as you get up).
      const chairOn = p.seat ? furnitureRef.current.find((f) => f.id === p.seat?.id) : null
      if (chairOn) pos.x += (chairOn.x * TILE + ((chairOn.w ?? 1) - 1) * 8 - pos.x) * Math.min(1, p.sit * 2)

      // Prompt: what Enter does right now.
      // Not while you are still sitting down on (or getting up from) a chair.
      const settling = Boolean(p.seat ? p.seat.phase !== 'seated' : seatAt(p.tile.x, p.tile.y))
      const idle = !p.from && !settling
      const facing = idle ? facingItem() : null
      const pipAhead = idle && !facing && facingPip()
      const exitAhead = idle && !facing && !pipAhead && facingExit()
      const nextPrompt = facing?.label ?? (pipAhead ? (companionRef.current?.label ?? null) : exitAhead ? exitLabel : null)
      if (nextPrompt !== promptRef.current) {
        promptRef.current = nextPrompt
        setPrompt(nextPrompt)
      }

      place(pos)
      const { scale, ox, oy } = geometry.current
      if (hoverAnchor.current && hoverEl.current) {
        hoverEl.current.style.left = `${(hoverAnchor.current.ax + ox) * scale}px`
        hoverEl.current.style.top = `${(hoverAnchor.current.ay + oy) * scale}px`
      }
      const base = ctx.getTransform().a
      ctx.setTransform(base, 0, 0, base, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()
      ctx.scale(scale, scale)
      ctx.translate(ox, oy)
      drawRoom(anim)

      const items = furnitureRef.current
      items.filter((f) => f.kind === 'rug').forEach((f) => drawFurniture(ctx, f, false))
      // A soft warm glow on the floor under whatever the pointer is over.
      const hovered = items.find((f) => f.id === hoverRef.current)
      if (hovered) {
        const gx = hovered.x * TILE + ((hovered.w ?? 1) * TILE) / 2
        const gy = (hovered.y + (hovered.h ?? 1)) * TILE - 2
        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        for (const k of [1, 0.6]) {
          ctx.fillStyle = 'rgb(255 214 140 / 0.09)'
          ctx.beginPath()
          ctx.ellipse(gx, gy, Math.round(((hovered.w ?? 1) * TILE) / 2 + 8) * k, 7 * k, 0, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }
      type Drawable = { y: number; draw: () => void }
      const seated = Boolean(p.seat && p.sit >= 0.5)
      const drawables: Drawable[] = []
      for (const f of items) {
        if (f.kind === 'rug') continue
        const y = (f.y + (f.h ?? 1)) * TILE - 1
        if (f.kind === 'officeChair') {
          const face = poseOf(swivelOf(f.id))
          const color = f.color ?? CHAIR_COLOR
          if (seated && p.seat?.id === f.id) {
            // You sit in it: the seat and base behind you, the back rest (or near armrest) in front.
            const cx = f.x * TILE + ((f.w ?? 1) - 1) * 8
            drawables.push({ y, draw: () => drawOfficeChair(ctx, cx, f.y * TILE, color, face, 'base') })
            drawables.push({ y: pos.y + TILE + 0.25, draw: () => drawOfficeChair(ctx, cx, f.y * TILE, color, face, 'front') })
          } else drawables.push({ y, draw: () => drawFurniture(ctx, f, false, 0, face) })
          continue
        }
        if (f.kind === 'clerk') {
          // Blinks now and then, a beat apart from you.
          const blink = !still && (clock + 1700) % 3900 < 140
          drawables.push({
            y,
            draw: () => ctx.drawImage(spriteCanvas(blink ? CLERK_BLINK : CLERK, CLERK_PALETTE), f.x * TILE + 2, f.y * TILE - 3)
          })
          continue
        }
        drawables.push({ y, draw: () => drawFurniture(ctx, f, hoverRef.current === f.id, still ? 0 : anim) })
      }
      drawables.push({
        y: pos.y + TILE,
        draw: () => {
          const x = Math.round(pos.x) + 2
          const y = Math.round(pos.y)
          if (seated) {
            if (p.dir === 'up') {
              // Seen from behind only your head and shoulders show above the back rest.
              ctx.drawImage(spriteCanvas(HERO_SIT.up, HERO_PALETTE), 0, 0, 12, SIT_BACK_ROWS, x, y - 3, 12, SIT_BACK_ROWS)
            } else {
              const rows = HERO_SIT[p.dir === 'right' ? 'left' : p.dir]
              ctx.drawImage(spriteCanvas(rows, HERO_PALETTE, p.dir === 'right'), x, y + 15 - rows.length)
            }
            return
          }
          const frames = p.dir === 'right' ? HERO_FRAMES.left : HERO_FRAMES[p.dir]
          const stepFrame = p.from && p.t < 0.5 ? (p.steps % 2 ? 1 : 3) : 0
          const blink = !p.from && !p.seat && p.dir === 'down' && !still && clock % 4200 < 130
          const rows = blink ? HERO_BLINK : frames[stepFrame]!
          const sprite = spriteCanvas(rows, HERO_PALETTE, p.dir === 'right')
          // Halfway down onto (or up from) a chair you bend your knees a pixel.
          const bend = p.seat && p.sit > 0 ? 1 : 0
          px(ctx, 'rgb(6 14 20 / 0.35)', x + 1, y + 14, 10, 2)
          ctx.drawImage(sprite, x, y + 15 - rows.length - (stepFrame ? 1 : 0) + bend)
        }
      })
      if (pip.current) {
        const c = pip.current
        // On the bed Pip is drawn just after it, over the blanket.
        const bed = onBed(c) ? items.find((f) => f.kind === 'bed') : null
        const y = bed ? (bed.y + (bed.h ?? 1)) * TILE - 0.5 : companionPosition(c).y + TILE - 0.5
        drawables.push({ y, draw: () => drawCompanion(ctx, c, clock, still) })
      }
      drawables.sort((a, b) => a.y - b.y).forEach((d) => d.draw())

      // Night lighting: lamps, moonlight through the windows, glowing screens, and a little light around you.
      const lights: Light[] = [{ x: exit.x * TILE + 8, y: exit.y * TILE, r: 20, strength: 0.7, color: '255 210 130' }]
      for (const f of items) {
        const cx = f.x * TILE + ((f.w ?? 1) * TILE) / 2
        if (f.kind === 'lamp') lights.push({ x: cx, y: f.y * TILE - 9, r: 52, strength: 1, color: LAMP_COLOR, flame: true })
        if (f.kind === 'desk') lights.push({ x: cx, y: f.y * TILE - 6, r: 16, strength: 0.7, color: '120 220 230' })
        if (f.kind === 'nightstand') lights.push({ x: cx, y: f.y * TILE - 6, r: 30, strength: 0.9, color: LAMP_COLOR, flame: true })
        if (f.kind === 'fireplace') lights.push({ x: cx, y: f.y * TILE + 2, r: 56, strength: 1, color: '255 160 90', flame: true })
        if (f.kind === 'clerk') lights.push({ x: cx, y: f.y * TILE + 4, r: 34, strength: 0.85, color: LAMP_COLOR })
        if (f.kind === 'cooler') lights.push({ x: cx, y: f.y * TILE - 4, r: 10, strength: 0.5, color: '140 220 255' })
      }
      for (const d of decor)
        if (d.kind === 'window') lights.push({ x: d.x * TILE + 16, y: 2 * TILE + 6, r: 34, strength: 0.75, color: '150 190 255' })
      // Light and darkness only inside the room, not over the empty space around it.
      ctx.beginPath()
      ctx.rect(0, 0, cols * TILE, rows * TILE)
      ctx.clip()
      applyLighting(ctx, layer, lights, -ox, -oy, NIGHT, scale, (light) => lampPulse(light, clock, still))
      ctx.restore()
      // Light falls on the floor, not through the walls: repaint the wall tops in the plain night shade.
      ctx.save()
      ctx.scale(scale, scale)
      ctx.translate(ox, oy)
      drawWallTops(true)
      // "..." over anyone you can talk to, until you face them (then your own "!" takes over).
      const talking = Boolean(facing && items.some((f) => f.kind === 'clerk' && f.y === facing.y - 1))
      if (!talking)
        for (const f of items)
          if (f.kind === 'clerk') {
            const bob = anim && !still ? 1 : 0
            ctx.drawImage(spriteCanvas(TALK, BUBBLE_PALETTE), f.x * TILE + 9, f.y * TILE - 12 - bob)
          }
      // "!" over your head when Enter would do something; after the night layer so it stays a clear cue.
      if ((facing || pipAhead || exitAhead) && idle) {
        const bob = anim && !still ? 1 : 0
        const drop = seated ? 3 : 0
        ctx.drawImage(spriteCanvas(BUBBLE, BUBBLE_PALETTE), Math.round(pos.x) + 4, Math.round(pos.y) + 4 - HERO_HEIGHT - bob + drop)
      }
      ctx.restore()

      if (visible) raf = requestAnimationFrame(frame)
    }

    const io = new IntersectionObserver(([entry]) => {
      const was = visible
      visible = Boolean(entry?.isIntersecting)
      if (visible && !was) {
        last = performance.now()
        raf = requestAnimationFrame(frame)
      }
    })
    io.observe(wrap)
    raf = requestAnimationFrame(frame)

    const toTile = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const { scale, ox, oy } = geometry.current
      const ax = (event.clientX - rect.left) / scale - ox
      const ay = (event.clientY - rect.top) / scale - oy
      return { ax, ay, x: Math.floor(ax / TILE), y: Math.floor(ay / TILE) }
    }

    const hit = (ax: number, ay: number) => {
      const usable = furnitureRef.current.filter((f) => f.kind !== 'rug' && f.interactive !== false)
      const found = [...usable]
        .sort((a, b) => b.y - a.y)
        .find((f) => {
          const X = f.x * TILE
          const Y = f.y * TILE
          return ax >= X && ax < X + (f.w ?? 1) * TILE && ay >= Y - RISE[f.kind] && ay < Y + (f.h ?? 1) * TILE
        })
      // Someone behind a counter is reached over it: clicking them walks you up to the counter.
      if (found?.kind === 'clerk') {
        const below = usable.find((f) => f.y === found.y + 1 && found.x >= f.x && found.x < f.x + (f.w ?? 1))
        if (below) return below
      }
      return found ?? null
    }

    const onMove = (event: PointerEvent) => {
      const { ax, ay, x, y } = toTile(event)
      const item = hit(ax, ay)
      const onExitMat = x === exit.x && y === exit.y
      const onPip = Boolean(pip.current && isAt(pip.current, x, y))
      hoverRef.current = item?.id ?? null
      canvas.style.cursor = item || onExitMat || onPip ? 'pointer' : 'default'
      const name = item?.label ?? (onPip ? (companionRef.current?.label ?? null) : onExitMat ? exitLabel : null)
      const anchor = item
        ? { ax: (item.x + (item.w ?? 1) / 2) * TILE, ay: item.y * TILE - RISE[item.kind] - 3 }
        : onPip
          ? { ax: x * TILE + 8, ay: y * TILE - 4 }
          : { ax: exit.x * TILE + 8, ay: exit.y * TILE - 2 }
      hoverAnchor.current = name ? anchor : null
      setHover((current) =>
        name
          ? current?.label === name && current.ax === anchor.ax && current.ay === anchor.ay
            ? current
            : { label: name, ...anchor }
          : null
      )
    }

    const onLeave = () => {
      hoverRef.current = null
      hoverAnchor.current = null
      setHover(null)
    }

    const onDown = (event: PointerEvent) => {
      const { ax, ay, x, y } = toTile(event)
      const p = player.current
      if (p.leaving) return
      const from = p.to ?? p.tile
      if (pip.current && isAt(pip.current, x, y)) {
        pet(pip.current)
        return
      }
      const item = hit(ax, ay)
      if (item) {
        const w = item.w ?? 1
        const h = item.h ?? 1
        const sides: (Point & { face: Direction })[] = []
        for (let k = 0; k < w; k++) {
          sides.push({ x: item.x + k, y: item.y + h, face: 'up' })
          sides.push({ x: item.x + k, y: item.y - 1, face: 'down' })
        }
        for (let k = 0; k < h; k++) {
          sides.push({ x: item.x - 1, y: item.y + k, face: 'right' })
          sides.push({ x: item.x + w, y: item.y + k, face: 'left' })
        }
        const reachable = sides.filter((s) => (s.x === from.x && s.y === from.y) || walkable(s.x, s.y))
        // A desk with a chair: you sit down on it to use the desk.
        const seats = reachable.filter((s) => seatAt(s.x, s.y))
        const goals = seats.length && findPath(from, seats) ? seats : reachable
        const path = findPath(from, goals)
        if (!path) return
        const end = path[path.length - 1] ?? from
        p.path = path
        p.pending = { id: item.id, face: goals.find((s) => s.x === end.x && s.y === end.y)?.face ?? 'up' }
        return
      }
      if (x === exit.x && y === exit.y) {
        p.path = findPath(from, [exit]) ?? []
        p.pending = { id: '__exit', face: 'down' }
        return
      }
      if (!walkable(x, y)) return
      p.path = findPath(from, [{ x, y }]) ?? []
      p.pending = null
    }

    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerleave', onLeave)
    canvas.addEventListener('pointerdown', onDown)
    // Where the player is on screen, so the iris opens on you and closes on you when you leave.
    const unquiet = quietOnPointer(wrap)
    const untrack = trackFocus(() => {
      const rect = canvas.getBoundingClientRect()
      if (!rect.width) return null
      const { scale, ox, oy } = geometry.current
      const p = player.current
      const at = p.from && p.to ? { x: p.from.x + (p.to.x - p.from.x) * p.t, y: p.from.y + (p.to.y - p.from.y) * p.t } : p.tile
      return { x: rect.left + (ox + at.x * TILE + 8) * scale, y: rect.top + (oy + at.y * TILE + 6) * scale }
    })
    return () => {
      unquiet()
      untrack()
      cancelAnimationFrame(raf)
      observer.disconnect()
      window.removeEventListener('resize', resize)
      io.disconnect()
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('pointerdown', onDown)
    }
    // The room layout is fixed per place.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    const dir = KEY_TO_DIR[event.key]
    if (dir) {
      event.preventDefault()
      const p = player.current
      if (event.repeat && p.held === dir) return
      if (p.seat) {
        // On a chair: a way out gets you up and walking; towards a desk or wall the chair swivels round.
        p.path = []
        p.pending = null
        p.held = dir
        p.holdUntil = 0
        // You sit in the middle of a wide chair: getting up sideways you step off on that side of it.
        const chair = furnitureRef.current.find((f) => f.id === p.seat?.id)
        const from =
          chair && dir === 'left'
            ? { x: chair.x, y: chair.y }
            : chair && dir === 'right'
              ? { x: chair.x + (chair.w ?? 1) - 1, y: chair.y }
              : p.tile
        const next = { x: from.x + DIRS[dir].x, y: from.y + DIRS[dir].y }
        if (walkable(next.x, next.y) && seatAt(next.x, next.y) !== chair) {
          p.seat.phase = 'out'
          p.seat.out = dir
          p.tile = from
        } else if (p.seat.phase === 'seated') turnTo(swivelOf(p.seat.id), dir)
        return
      }
      const standing = !p.from && !p.path.length
      p.path = []
      p.pending = null
      p.held = dir
      // A tap while standing still only turns you; keep holding (or tap again) to walk.
      if (standing && p.dir !== dir && !p.leaving) {
        p.dir = dir
        p.holdUntil = performance.now() + TURN_HOLD_MS
        return
      }
      p.holdUntil = 0
      tryStep(dir)
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      const item = facingItem()
      if (item) activate(item.id)
      else if (facingPip() && pip.current) pet(pip.current)
      else if (facingExit()) tryStep('down')
    }
  }

  const onKeyUp = (event: KeyboardEvent<HTMLDivElement>) => {
    const dir = KEY_TO_DIR[event.key]
    if (dir && player.current.held === dir) player.current.held = null
  }

  // role=application: arrow keys walk while the room has focus; Tab moves on as usual (WCAG 2.1.2). jsx-a11y
  // does not count `application` as interactive, but it is the right role for a focusable game area.
  /* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */
  return (
    <div
      ref={wrapRef}
      role="application"
      aria-label={label}
      aria-describedby={describedBy}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onBlur={() => (player.current.held = null)}
      className={cn('absolute inset-0 focus-visible:outline-offset-[-6px]', className)}
    >
      <canvas ref={canvasRef} aria-hidden className="pixelated absolute inset-0 touch-none" />
      {hover ? (
        <span
          ref={hoverEl}
          aria-hidden
          className="pixel-drop pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full"
          style={{
            left: (hover.ax + geometry.current.ox) * geometry.current.scale,
            top: (hover.ay + geometry.current.oy) * geometry.current.scale
          }}
        >
          <span className="panel block px-3 py-1.5 font-site-pixel text-sm font-semibold whitespace-nowrap">{hover.label}</span>
        </span>
      ) : null}
      {/* What Enter does right now, for screen reader players (sighted players see the "!" bubble). */}
      <p aria-live="polite" className="sr-only">
        {prompt ? `Enter: ${prompt}` : ''}
      </p>
    </div>
  )
  /* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */
}

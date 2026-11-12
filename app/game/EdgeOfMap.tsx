import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { useMotionPreference } from '~/components/motion/MotionPreference'
import { setupPixelCanvas, spriteCanvas } from '~/game/canvas'
import DialogBox, { type DialogHandle } from '~/game/DialogBox'
import { applyLighting, LAMP_COLOR, lampPulse, type Light } from '~/game/lighting'
import { quietFocus, quietOnPointer } from '~/game/quietFocus'
import {
  BUBBLE,
  BUBBLE_PALETTE,
  HERO_BLINK,
  HERO_FRAMES,
  HERO_PALETTE,
  heroFrame,
  PIP_BLINK,
  PIP_HEART,
  PIP_HEART_PALETTE,
  PIP_PALETTE,
  PIP_SIT,
  type Direction
} from '~/game/sprites'
import { drawLamp, TILE, TURN_HOLD_MS, type Point } from '~/game/world'

/* ---------------------------------------------------------------------------
 * The 404 scene: the last strip of town at night, where the path simply stops and the map was never drawn.
 * A tiny walkable scene with the same hero, cat, lamp and lighting as the town, so getting lost still feels
 * like part of the game. Everything it says is also in the page's text, so the canvas itself is decorative.
 * ------------------------------------------------------------------------- */

const COLS = 15
const ROWS = 9
const W = COLS * TILE
const H = ROWS * TILE
const STEP_MS = 190

/**
 * T tree, b bush, f flowers, g/G grass, = path, F fence, x broken fence, L lamp, S sign, P Pip, ~ the void.
 * The ground frays out unevenly to the right, and the path runs off its edge.
 */
const MAP = [
  'TTTTTTTTTT~~~~~',
  'TgGfgbgGgg~~~~~',
  'FFFFFFFxgg~~~~~',
  'ggGgggLgSg~~~~~',
  '=========~~~~~~',
  'gGgggfgggg~~~~~',
  'gfPGbgggg~~~~~~',
  'bggfGggg~~~~~~~',
  'TTbTTTT~~~~~~~~'
]

const SIGN: Point = { x: 8, y: 3 }
const PIP: Point = { x: 2, y: 6 }
const LAMP: Point = { x: 6, y: 3 }
const EXIT: Point = { x: 0, y: 4 }
const START: Point = { x: 7, y: 4 }

const at = (x: number, y: number) => MAP[y]?.[x] ?? '~'
const isVoid = (x: number, y: number) => at(x, y) === '~'
const isGround = (x: number, y: number) => x >= 0 && y >= 0 && x < COLS && y < ROWS && !isVoid(x, y)
const walkable = (x: number, y: number) => 'gGf='.includes(at(x, y)) && isGround(x, y)

const DIRS: Record<Direction, Point> = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } }
const KEY_DIR: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right'
}

/* ----------------------------- drawing ----------------------------- */

type Ctx = CanvasRenderingContext2D
const INK = '#14202a'
const VOID = '#050f15'

function px(ctx: Ctx, color: string, x: number, y: number, w = 1, h = 1) {
  ctx.fillStyle = color
  ctx.fillRect(x, y, w, h)
}

/** Small deterministic noise, so the frayed edges and stars land in the same place on every visit. */
function hash(x: number, y: number, salt = 0) {
  let h = (x * 374761393 + y * 668265263 + salt * 2147483647) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

function grass(ctx: Ctx, x: number, y: number, alt: boolean) {
  px(ctx, alt ? '#47925f' : '#4c9a6a', x, y, TILE, TILE)
  const marks = alt
    ? [
        [3, 4],
        [10, 2],
        [7, 11],
        [13, 13]
      ]
    : [
        [5, 6],
        [12, 10]
      ]
  for (const [mx, my] of marks) {
    px(ctx, '#3a7c55', x + mx!, y + my!, 1, 2)
    px(ctx, '#3a7c55', x + mx! + 2, y + my!, 1, 2)
    px(ctx, '#68b582', x + mx! + 1, y + my! - 1)
  }
}

function flowers(ctx: Ctx, x: number, y: number, seed: number) {
  grass(ctx, x, y, false)
  const colors = ['#f07c8a', '#f4efe0', '#f2c94c', '#9fb7f0']
  ;[
    [3, 3],
    [10, 5],
    [5, 11],
    [12, 12]
  ].forEach(([fx, fy], i) => {
    const c = colors[(seed + i) % colors.length]!
    const cx = x + fx!
    const cy = y + fy!
    px(ctx, '#2f7550', cx, cy + 2, 1, 2)
    px(ctx, c, cx, cy - 1)
    px(ctx, c, cx - 1, cy)
    px(ctx, c, cx + 1, cy)
    px(ctx, c, cx, cy + 1)
    px(ctx, '#ffe9a0', cx, cy)
  })
}

function bush(ctx: Ctx, x: number, y: number) {
  grass(ctx, x, y, false)
  px(ctx, 'rgb(6 20 24 / 0.3)', x + 2, y + 12, 12, 3)
  px(ctx, INK, x + 2, y + 4, 12, 9)
  px(ctx, INK, x + 4, y + 2, 8, 2)
  px(ctx, '#2f7550', x + 3, y + 4, 10, 8)
  px(ctx, '#2f7550', x + 5, y + 3, 6, 1)
  px(ctx, '#3f9064', x + 4, y + 4, 6, 4)
  px(ctx, '#5aa877', x + 5, y + 4, 2, 2)
  px(ctx, '#5aa877', x + 9, y + 6, 1, 1)
}

function tree(ctx: Ctx, x: number, y: number) {
  grass(ctx, x, y, false)
  px(ctx, 'rgb(6 20 24 / 0.35)', x + 2, y + 13, 12, 2)
  px(ctx, '#6b4a2e', x + 6, y + 10, 4, 5)
  px(ctx, INK, x + 6, y + 14, 4, 1)
  px(ctx, INK, x + 4, y + 10, 2, 1)
  px(ctx, INK, x + 10, y + 10, 2, 1)
  px(ctx, INK, x + 3, y, 10, 1)
  px(ctx, INK, x + 1, y + 2, 1, 7)
  px(ctx, INK, x + 14, y + 2, 1, 7)
  px(ctx, INK, x + 2, y + 1, 1, 1)
  px(ctx, INK, x + 13, y + 1, 1, 1)
  px(ctx, INK, x + 2, y + 9, 12, 1)
  px(ctx, '#245c40', x + 2, y + 2, 12, 7)
  px(ctx, '#245c40', x + 3, y + 1, 10, 1)
  px(ctx, '#33805a', x + 3, y + 2, 9, 5)
  px(ctx, '#53a476', x + 4, y + 2, 4, 2)
  px(ctx, '#53a476', x + 9, y + 4, 2, 1)
  px(ctx, '#245c40', x + 6, y + 6, 2, 1)
}

function path(ctx: Ctx, tx: number, ty: number, rows = TILE) {
  const x = tx * TILE
  const y = ty * TILE
  px(ctx, '#c8ad80', x, y, TILE, rows)
  for (const [sx, sy] of [
    [3, 3],
    [11, 5],
    [6, 10],
    [13, 12],
    [2, 13]
  ] as const)
    if (sy < rows) px(ctx, '#ad9367', x + sx, y + sy, 2, 1)
  px(ctx, '#8f7a55', x, y, TILE, 1)
  px(ctx, '#8f7a55', x, y + TILE - 1, TILE, 1)
  if (tx === 0) px(ctx, '#8f7a55', x, y, 1, TILE)
}

/** A fence tile; the broken one has its rails snapped off halfway with a splintered end, and a leaning post. */
function fence(ctx: Ctx, x: number, y: number, broken: boolean) {
  grass(ctx, x, y, false)
  const railEnd = broken ? 7 : TILE
  px(ctx, '#d9cfbb', x, y + 6, railEnd, 2)
  px(ctx, '#d9cfbb', x, y + 10, railEnd - 2, 2)
  px(ctx, INK, x, y + 8, railEnd, 1)
  px(ctx, INK, x, y + 12, railEnd - 2, 1)
  if (broken) {
    // Splinters, a rail lying in the grass and the last post leaning out.
    px(ctx, '#d9cfbb', x + 7, y + 5, 1, 1)
    px(ctx, '#d9cfbb', x + 5, y + 9, 1, 1)
    px(ctx, INK, x + 7, y + 6, 1, 2)
    px(ctx, INK, x + 8, y + 13, 7, 1)
    px(ctx, '#b9af9b', x + 8, y + 12, 7, 1)
    px(ctx, INK, x + 1, y + 3, 5, 12)
    px(ctx, '#efe7d6', x + 2, y + 4, 3, 10)
    px(ctx, '#b9af9b', x + 4, y + 4, 1, 10)
    return
  }
  for (const postX of [2, 10]) {
    px(ctx, INK, x + postX - 1, y + 3, 5, 12)
    px(ctx, '#efe7d6', x + postX, y + 4, 3, 10)
    px(ctx, '#b9af9b', x + postX + 2, y + 4, 1, 10)
  }
}

/** The earth wall under a piece of ground that hangs over the void: soil, a stone band, roots dangling below. */
function cliff(ctx: Ctx, tx: number, ty: number) {
  const x = tx * TILE
  const y = ty * TILE
  for (let i = 0; i < TILE; i++) {
    const depth = 9 + Math.floor(hash(tx * TILE + i, ty, 1) * 4)
    px(ctx, '#5b3f27', x + i, y, 1, depth)
    px(ctx, '#7a5636', x + i, y, 1, 2)
    px(ctx, '#3d2a1b', x + i, y + 5, 1, 2)
    px(ctx, '#2b1d13', x + i, y + depth - 2, 1, 2)
    px(ctx, INK, x + i, y + depth, 1, 1)
  }
  // Stones in the wall and a few roots hanging out of it.
  px(ctx, '#8b8070', x + 3, y + 3, 3, 2)
  px(ctx, '#6f6558', x + 3, y + 4, 3, 1)
  px(ctx, '#8b8070', x + 11, y + 6, 2, 2)
  for (const rx of [6, 13]) {
    const len = 3 + Math.floor(hash(tx, ty, rx) * 4)
    px(ctx, '#7a5636', x + rx, y + 10, 1, len)
    px(ctx, '#7a5636', x + rx + 1, y + 10 + len, 1, 1)
  }
}

/** The right edge of a piece of ground where it frays into the void: crumbled, with a dark lip of soil. */
function fray(ctx: Ctx, tx: number, ty: number) {
  const x = tx * TILE + TILE
  const y = ty * TILE
  for (let j = 0; j < TILE; j++) {
    const bite = Math.floor(hash(tx, ty * TILE + j, 2) * 3)
    ctx.clearRect(x - bite, y + j, bite, 1)
    px(ctx, '#3d2a1b', x - bite - 1, y + j, 1, 1)
  }
  // Crumbs that have come loose, just past the edge.
  px(ctx, '#4c9a6a', x + 2, y + 5, 2, 2)
  px(ctx, '#3d2a1b', x + 2, y + 7, 2, 1)
  px(ctx, '#4c9a6a', x + 5, y + 11, 1, 1)
}

/** Where the path runs off the edge: a tile drawn only partway, its last rows broken into scanlines. */
function unfinishedPath(ctx: Ctx, tx: number, ty: number) {
  path(ctx, tx, ty, 6)
  const x = tx * TILE
  const y = ty * TILE
  for (let row = 6; row < 12; row += 2) {
    for (let i = 0; i < TILE; i++) if (hash(i, row, ty) > (row - 4) / 10) px(ctx, '#c8ad80', x + i, y + row, 1, 1)
  }
  px(ctx, '#5b3f27', x, y + 6, TILE, 1)
}

/** Everything that does not move: ground, fence, trees, the frayed edge and its earth walls. */
function renderStatic(): HTMLCanvasElement {
  const layer = document.createElement('canvas')
  layer.width = W
  layer.height = H
  const ctx = layer.getContext('2d')!
  for (let ty = 0; ty < ROWS; ty++) {
    for (let tx = 0; tx < COLS; tx++) {
      const x = tx * TILE
      const y = ty * TILE
      const tile = at(tx, ty)
      if (tile === '~') continue
      if (tile === '=') path(ctx, tx, ty)
      else if (tile === 'T') tree(ctx, x, y)
      else if (tile === 'b') bush(ctx, x, y)
      else if (tile === 'f') flowers(ctx, x, y, tx + ty)
      else if (tile === 'F' || tile === 'x') fence(ctx, x, y, tile === 'x')
      else grass(ctx, x, y, tile === 'G')
    }
  }
  for (let ty = 0; ty < ROWS; ty++) {
    for (let tx = 0; tx < COLS; tx++) {
      if (isGround(tx, ty) && isVoid(tx + 1, ty)) fray(ctx, tx, ty)
    }
  }
  unfinishedPath(ctx, 9, 4)
  for (let ty = 0; ty < ROWS; ty++) {
    for (let tx = 0; tx < COLS; tx++) {
      if (isVoid(tx, ty) && (isGround(tx, ty - 1) || (tx === 9 && ty === 5))) cliff(ctx, tx, ty)
    }
  }
  return layer
}

/** Tiles that were never drawn: faint dotted outlines past the edge, fading out the further they are from it. */
function drawUnbuilt(ctx: Ctx) {
  for (let ty = 0; ty < ROWS; ty++) {
    for (let tx = 0; tx < COLS; tx++) {
      if (!isVoid(tx, ty)) continue
      let edge = COLS
      for (let gx = tx; gx >= 0; gx--) if (isGround(gx, ty)) edge = Math.min(edge, tx - gx)
      if (edge > 4) continue
      ctx.fillStyle = `rgb(228 184 74 / ${0.2 - edge * 0.04})`
      const x = tx * TILE
      const y = ty * TILE
      for (let i = 0; i < TILE; i += 2) {
        ctx.fillRect(x + i, y, 1, 1)
        ctx.fillRect(x, y + i, 1, 1)
      }
    }
  }
}

type Star = { x: number; y: number; gold: boolean; twinkle: number }

function makeStars(): Star[] {
  const stars: Star[] = []
  for (let i = 0; stars.length < 70 && i < 2000; i++) {
    const x = Math.floor(hash(i, 1, 7) * W)
    const y = Math.floor(hash(i, 2, 7) * H)
    const tx = Math.floor(x / TILE)
    const ty = Math.floor(y / TILE)
    // Only out in the void, and not on the earth wall hanging under the ground.
    if (!isVoid(tx, ty) || isGround(tx, ty - 1) || (tx === 9 && ty <= 5)) continue
    stars.push({ x, y, gold: hash(i, 3, 7) > 0.8, twinkle: hash(i, 4, 7) })
  }
  return stars
}

function drawStars(ctx: Ctx, stars: Star[], clock: number, still: boolean) {
  for (const s of stars) {
    const phase = still ? 0.5 : (clock / 1600 + s.twinkle) % 1
    const color = s.gold ? '#e4b84a' : '#f4efe0'
    if (s.twinkle > 0.85 && phase < 0.5) {
      // A few bigger stars twinkle into a little cross.
      px(ctx, color, s.x - 1, s.y)
      px(ctx, color, s.x + 1, s.y)
      px(ctx, color, s.x, s.y - 1)
      px(ctx, color, s.x, s.y + 1)
      px(ctx, '#ffffff', s.x, s.y)
    } else {
      ctx.globalAlpha = s.twinkle < 0.4 ? 0.45 : 0.85
      px(ctx, color, s.x, s.y)
      ctx.globalAlpha = 1
    }
  }
}

/** Chunks of ground drifting in the void, as if the map came apart there. */
const FRAGMENTS = [
  { x: 168, y: 62, w: 10, kind: 'path', phase: 0 },
  { x: 192, y: 38, w: 7, kind: 'grass', phase: 2.1 },
  { x: 205, y: 96, w: 12, kind: 'grass', phase: 4.2 },
  { x: 182, y: 118, w: 5, kind: 'path', phase: 1.3 },
  { x: 222, y: 20, w: 4, kind: 'grass', phase: 3.4 }
] as const

function drawFragments(ctx: Ctx, clock: number, still: boolean) {
  for (const f of FRAGMENTS) {
    const y = f.y + (still ? 0 : Math.round(Math.sin(clock / 1400 + f.phase) * 2))
    const top = f.kind === 'path' ? '#c8ad80' : '#4c9a6a'
    const light = f.kind === 'path' ? '#ddc59a' : '#68b582'
    const h = Math.max(3, Math.round(f.w * 0.5))
    px(ctx, INK, f.x - 1, y - 1, f.w + 2, h + 5)
    px(ctx, top, f.x, y, f.w, h)
    px(ctx, light, f.x, y, f.w, 1)
    px(ctx, '#5b3f27', f.x, y + h, f.w, 3)
    px(ctx, '#3d2a1b', f.x + 1, y + h + 2, f.w - 2, 1)
    px(ctx, INK, f.x + Math.floor(f.w / 2), y + h + 4, 1, 2)
  }
}

const DIGITS: Record<string, string[]> = {
  '4': ['1.1', '1.1', '111', '..1', '..1'],
  '0': ['111', '1.1', '1.1', '1.1', '111']
}

/** The signpost at the edge, its board painted with 404. */
function drawSign(ctx: Ctx) {
  const x = SIGN.x * TILE
  const y = SIGN.y * TILE
  px(ctx, 'rgb(6 20 24 / 0.35)', x + 4, y + 13, 9, 2)
  px(ctx, INK, x + 6, y + 2, 4, 13)
  px(ctx, '#a06830', x + 7, y + 2, 2, 12)
  px(ctx, INK, x, y - 8, 16, 11)
  px(ctx, '#c88848', x + 1, y - 7, 14, 9)
  px(ctx, '#f0d8a8', x + 2, y - 6, 12, 7)
  px(ctx, '#a06830', x + 1, y + 2, 14, 1)
  ;['4', '0', '4'].forEach((digit, i) => {
    DIGITS[digit]!.forEach((row, ry) => {
      for (let rx = 0; rx < 3; rx++) if (row[rx] === '1') px(ctx, '#b0302a', x + 2 + i * 4 + rx, y - 5 + ry, 1, 1)
    })
  })
  // Two nail heads.
  px(ctx, '#6b4a2e', x + 2, y - 7, 1, 1)
  px(ctx, '#6b4a2e', x + 13, y - 7, 1, 1)
}

/** A bobbing gold arrow on the path at the left edge: the way back to town. */
function drawExitArrow(ctx: Ctx, clock: number, still: boolean) {
  const x = 2 + (still ? 0 : Math.round((Math.sin(clock / 260) + 1) / 2) * -1)
  const y = EXIT.y * TILE + 5
  const rows = ['...K', '..KG', '.KGG', 'KGGG', '.KGG', '..KG', '...K']
  rows.forEach((row, ry) => {
    for (let rx = 0; rx < row.length; rx++) {
      const c = row[rx]
      if (c === 'K') px(ctx, INK, x + rx, y + ry)
      if (c === 'G') px(ctx, '#e4b84a', x + rx, y + ry)
    }
  })
  px(ctx, INK, x + 4, y + 2, 4, 3)
  px(ctx, '#e4b84a', x + 4, y + 3, 3, 1)
}

/* ----------------------------- the scene ----------------------------- */

type Action = 'sign' | 'pip' | 'bump' | 'exit'
type Dialog = { speaker?: string; pages: readonly string[] }

type Hero = {
  x: number
  y: number
  fromX: number
  fromY: number
  t: number
  moving: boolean
  dir: Direction
  steps: number
  held: Direction | null
  heldAt: number
  bumped: boolean
  route: Point[]
  then: { action: Action; face: Direction } | null
  exiting: boolean
}

function findRoute(from: Point, goals: Point[]): Point[] | null {
  const key = (p: Point) => `${p.x},${p.y}`
  const goalKeys = new Set(goals.map(key))
  const prev = new Map<string, Point | null>([[key(from), null]])
  const queue = [from]
  while (queue.length) {
    const p = queue.shift()!
    if (goalKeys.has(key(p))) {
      const route: Point[] = []
      for (let c: Point | null = p; c && key(c) !== key(from); c = prev.get(key(c)) ?? null) route.unshift(c)
      return route
    }
    for (const d of Object.values(DIRS)) {
      const n = { x: p.x + d.x, y: p.y + d.y }
      if (!walkable(n.x, n.y) || prev.has(key(n))) continue
      prev.set(key(n), p)
      queue.push(n)
    }
  }
  return null
}

const dirBetween = (a: Point, b: Point): Direction => (b.x < a.x ? 'left' : b.x > a.x ? 'right' : b.y < a.y ? 'up' : 'down')

export type EdgeOfMapText = {
  label: string
  controlsId: string
  sign: readonly string[]
  bump: readonly string[]
  pip: readonly string[]
  pipName: string
  signName: string
  next: string
  close: string
}

export default function EdgeOfMap({ text, onExit }: { text: EdgeOfMapText; onExit: () => void }) {
  const { paused } = useMotionPreference()
  const sceneRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dialogRef = useRef<DialogHandle>(null)
  const [dialog, setDialog] = useState<Dialog | null>(null)
  const dialogOpen = useRef(false)
  const stillRef = useRef(paused)
  const textRef = useRef(text)
  const exitRef = useRef(onExit)
  const lines = useRef({ bump: -1, pip: -1 })
  const heartAt = useRef(-Infinity)
  const hero = useRef<Hero>({
    ...START,
    fromX: START.x,
    fromY: START.y,
    t: 1,
    moving: false,
    dir: 'right',
    steps: 0,
    held: null,
    heldAt: 0,
    bumped: false,
    route: [],
    then: null,
    exiting: false
  })

  stillRef.current = paused
  textRef.current = text
  exitRef.current = onExit
  dialogOpen.current = dialog !== null

  /** A line from a list, never the same one twice in a row. */
  const pick = (kind: 'bump' | 'pip') => {
    const list = textRef.current[kind]
    let i = Math.floor(Math.random() * list.length)
    if (list.length > 1 && i === lines.current[kind]) i = (i + 1) % list.length
    lines.current[kind] = i
    return list[i]!
  }

  const act = (action: Action) => {
    const t = textRef.current
    if (action === 'sign') setDialog({ speaker: t.signName, pages: t.sign })
    else if (action === 'pip') {
      heartAt.current = performance.now()
      setDialog({ speaker: t.pipName, pages: [pick('pip')] })
    } else if (action === 'bump') setDialog({ pages: [pick('bump')] })
  }
  const actRef = useRef(act)
  actRef.current = act

  const closeDialog = () => {
    setDialog(null)
    hero.current.held = null
    quietFocus(sceneRef.current)
  }

  // The game loop: walking, the ambient motion, and drawing.
  useEffect(() => {
    const canvas = canvasRef.current
    const scene = sceneRef.current
    if (!canvas || !scene) return
    const stopQuiet = quietOnPointer(scene)
    const staticLayer = renderStatic()
    const darkLayer = document.createElement('canvas')
    darkLayer.width = W
    darkLayer.height = H
    const stars = makeStars()
    let ctx: Ctx | null = null
    let scale = 1
    const born = performance.now()

    const resize = () => {
      const width = scene.clientWidth
      const dpr = Math.max(1, Math.round(window.devicePixelRatio || 1))
      scale = Math.max(1, Math.floor((width * dpr) / W)) / dpr
      ctx = setupPixelCanvas(canvas, W * scale, H * scale)
      const dprNow = canvas.width / (W * scale)
      ctx.setTransform(dprNow * scale, 0, 0, dprNow * scale, 0, 0)
      ctx.imageSmoothingEnabled = false
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(scene)

    const startMove = (h: Hero, to: Point, exiting = false) => {
      h.fromX = h.x
      h.fromY = h.y
      h.x = to.x
      h.y = to.y
      h.t = 0
      h.moving = true
      h.steps++
      h.exiting = exiting
    }

    /** One step in a direction: walk, leave town by the path, or bump into the edge of the map. */
    const tryStep = (h: Hero, dir: Direction) => {
      h.dir = dir
      const n = { x: h.x + DIRS[dir].x, y: h.y + DIRS[dir].y }
      if (h.x === EXIT.x && h.y === EXIT.y && dir === 'left') return startMove(h, n, true)
      if (walkable(n.x, n.y)) return startMove(h, n)
      if (isVoid(n.x, n.y) && !h.bumped) {
        h.bumped = true
        actRef.current('bump')
      }
    }

    const update = (now: number, dt: number) => {
      const h = hero.current
      if (h.moving) {
        h.t = Math.min(1, h.t + dt / STEP_MS)
        if (h.t < 1) return
        h.moving = false
        if (h.exiting) {
          h.exiting = false
          exitRef.current()
          return
        }
      }
      if (dialogOpen.current) return
      const next = h.route.shift()
      if (next) {
        h.dir = dirBetween(h, next)
        startMove(h, next)
        return
      }
      if (h.then) {
        const { action, face } = h.then
        h.then = null
        h.dir = face
        if (action === 'exit') tryStep(h, 'left')
        else actRef.current(action)
        return
      }
      if (h.held && (h.dir === h.held || now - h.heldAt >= TURN_HOLD_MS)) tryStep(h, h.held)
    }

    const draw = (now: number) => {
      if (!ctx) return
      const clock = now - born
      const still = stillRef.current
      const h = hero.current

      // The void, deepening toward the far edge, with the outlines of tiles that were never drawn.
      const gradient = ctx.createLinearGradient(130, 0, W, 0)
      gradient.addColorStop(0, '#0a2129')
      gradient.addColorStop(1, VOID)
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, W, H)
      drawUnbuilt(ctx)
      drawFragments(ctx, clock, still)
      ctx.drawImage(staticLayer, 0, 0)

      // Entities, back to front.
      const k = h.moving ? h.t : 1
      const hx = Math.round((h.fromX + (h.x - h.fromX) * k) * TILE)
      const hy = Math.round((h.fromY + (h.y - h.fromY) * k) * TILE)
      const walkFrame = heroFrame(h.moving, h.steps, k)
      const blink = !still && !h.moving && h.dir === 'down' && clock % 3300 < 140
      const frames = HERO_FRAMES[h.dir === 'right' ? 'left' : h.dir]
      const heroRows = blink ? HERO_BLINK : frames[walkFrame]!
      const pipBlink = !still && clock % 4100 < 160

      const entities: { y: number; draw: () => void }[] = [
        { y: LAMP.y * TILE + 15, draw: () => drawLamp(ctx!, LAMP) },
        { y: SIGN.y * TILE + 14, draw: () => drawSign(ctx!) },
        {
          y: PIP.y * TILE + 15,
          draw: () => ctx!.drawImage(spriteCanvas(pipBlink ? PIP_BLINK : PIP_SIT, PIP_PALETTE), PIP.x * TILE + 1, PIP.y * TILE + 2)
        },
        {
          y: hy + 15.5,
          draw: () => {
            px(ctx!, 'rgb(6 20 24 / 0.35)', hx + 3, hy + 14, 10, 2)
            ctx!.drawImage(spriteCanvas(heroRows, HERO_PALETTE, h.dir === 'right'), hx + 2, hy - 4)
          }
        }
      ]
      entities.sort((a, b) => a.y - b.y).forEach((e) => e.draw())

      const lights: Light[] = [
        { x: LAMP.x * TILE + 8, y: LAMP.y * TILE - 8, r: 60, color: LAMP_COLOR, flame: true },
        { x: hx + 8, y: hy + 6, r: 26, strength: 0.55 }
      ]
      applyLighting(ctx, darkLayer, lights, 0, 0, 'rgb(4 14 22 / 0.58)', scale, (light) => lampPulse(light, clock, still))

      // Above the darkness: the stars, the way home, the "!" on arrival and Pip's heart.
      drawStars(ctx, stars, clock, still)
      drawExitArrow(ctx, clock, still)
      if (clock < 1800 && !h.moving && h.steps === 0) ctx.drawImage(spriteCanvas(BUBBLE, BUBBLE_PALETTE), hx + 4, hy - 16)
      const sinceHeart = now - heartAt.current
      if (sinceHeart < 1400) {
        const rise = still ? 0 : Math.floor(sinceHeart / 140)
        ctx.drawImage(spriteCanvas(PIP_HEART, PIP_HEART_PALETTE), PIP.x * TILE + 4, PIP.y * TILE - 6 - rise)
      }
    }

    let last = performance.now()
    let frame = 0
    const loop = (now: number) => {
      const dt = Math.min(64, now - last)
      last = now
      update(now, dt)
      draw(now)
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      stopQuiet()
    }
  }, [])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const h = hero.current
    if (event.key === 'Escape' && dialog) {
      event.preventDefault()
      closeDialog()
      return
    }
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'e' || event.key === 'E') {
      if (event.target !== event.currentTarget) return
      event.preventDefault()
      if (event.repeat) return
      if (dialog) return dialogRef.current?.advance()
      if (h.moving) return
      const n = { x: h.x + DIRS[h.dir].x, y: h.y + DIRS[h.dir].y }
      if (n.x === SIGN.x && n.y === SIGN.y) act('sign')
      else if (n.x === PIP.x && n.y === PIP.y) act('pip')
      else if (isVoid(n.x, n.y)) act('bump')
      return
    }
    const dir = KEY_DIR[event.key.length === 1 ? event.key.toLowerCase() : event.key]
    if (!dir) return
    event.preventDefault()
    if (dialog || h.held === dir) return
    h.route = []
    h.then = null
    h.held = dir
    h.bumped = false
    // A tap turns on the spot; holding walks. Already facing that way, the first step comes at once.
    h.heldAt = h.dir === dir ? -Infinity : performance.now()
    if (!h.moving) h.dir = dir
  }

  const onKeyUp = (event: KeyboardEvent<HTMLDivElement>) => {
    const dir = KEY_DIR[event.key.length === 1 ? event.key.toLowerCase() : event.key]
    if (dir && hero.current.held === dir) hero.current.held = null
  }

  const onPointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    if (dialog) return
    const rect = event.currentTarget.getBoundingClientRect()
    const tx = Math.floor(((event.clientX - rect.left) / rect.width) * COLS)
    const ty = Math.floor(((event.clientY - rect.top) / rect.height) * ROWS)
    const h = hero.current
    const target = { x: tx, y: ty }
    let goals: Point[] = [target]
    let action: Action | null = null
    if (tx === SIGN.x && ty === SIGN.y) action = 'sign'
    else if (tx === PIP.x && ty === PIP.y) action = 'pip'
    else if (isVoid(tx, ty)) action = 'bump'
    else if (tx === EXIT.x && ty === EXIT.y) action = 'exit'
    else if (!walkable(tx, ty)) return

    if (action && action !== 'exit') {
      goals = Object.values(DIRS)
        .map((d) => ({ x: tx - d.x, y: ty - d.y }))
        .filter((p) => walkable(p.x, p.y))
      if (action === 'bump') {
        // The void reaches far: walk to the nearest bit of ground at its edge, on the same row.
        let gx = tx
        while (gx >= 0 && !walkable(gx, ty)) gx--
        if (gx >= 0) goals = [{ x: gx, y: ty }]
      }
    }
    const start = h.moving ? { x: h.x, y: h.y } : h
    const route = findRoute({ x: start.x, y: start.y }, goals)
    if (!route) return
    h.held = null
    h.bumped = false
    h.route = route
    const end = route.at(-1) ?? { x: h.x, y: h.y }
    h.then = action ? { action, face: action === 'exit' ? 'left' : dirBetween(end, target) } : null
  }

  return (
    <div className="relative">
      {/*
        role=application: arrow keys walk while the scene has focus; Tab still moves on (WCAG 2.1.2).
        jsx-a11y does not count `application` as interactive, but it is the right role for a focusable game.
      */}
      {/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
      <div
        ref={sceneRef}
        id="edge-of-map"
        role="application"
        aria-label={text.label}
        aria-describedby={text.controlsId}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onBlur={() => (hero.current.held = null)}
        className="relative flex items-center justify-center bg-[#050f15] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-site-gold"
        style={{ aspectRatio: `${W} / ${H}` }}
      >
        {/* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
        <canvas ref={canvasRef} aria-hidden className="pixelated block touch-none" onPointerDown={onPointerDown} />
      </div>
      {dialog ? (
        <DialogBox
          ref={dialogRef}
          pages={dialog.pages}
          speaker={dialog.speaker}
          onClose={closeDialog}
          nextLabel={text.next}
          closeLabel={text.close}
          className="mt-3 sm:absolute sm:inset-x-4 sm:bottom-4 sm:mt-0"
        />
      ) : null}
    </div>
  )
}

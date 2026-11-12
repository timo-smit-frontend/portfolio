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
  heroFrame,
  TALK,
  type Direction
} from '~/game/sprites'
import { quietOnPointer } from '~/game/quietFocus'
import { doorBusy, sceneRevealed, trackFocus } from '~/game/transition'
import { TURN_HOLD_MS } from '~/game/world'
import { cn } from '~/services/utils'
import { CHAIR_COLOR, drawFurniture, drawOfficeChair, INK, px, RISE, shade, TILE, type Ctx, type Furniture } from '~/game/furniture'

export type { Furniture, FurnitureKind } from '~/game/furniture'

/**
 * A room seen from above, in the same pixel style and night lighting as the town. Walk with the arrow keys
 * (while the room has focus) or by clicking; Enter or a click uses the furniture in front of you; the mat by
 * the door takes you back outside. Everything a piece of furniture does is also a normal control in the page
 * content, so the canvas itself stays hidden from assistive tech.
 */

/** Indoor darkness: lighter than the town's, the rooms are lit. */
const NIGHT = 'rgb(6 16 26 / 0.45)'
const STEP_MS = 165
/** Sitting down on an office chair: a quarter turn of the swivel, lowering onto the seat, getting up again. */
const SWIVEL_MS = 95
const SIT_MS = 190
const RISE_MS = 150
/** The seated hero, seen from behind, is cut off this many rows down: the back rest hides the rest. */
const SIT_BACK_ROWS = 14

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
          const stepFrame = heroFrame(Boolean(p.from), p.steps, p.t)
          const blink = !p.from && !p.seat && p.dir === 'down' && !still && clock % 4200 < 130
          const rows = blink ? HERO_BLINK : frames[stepFrame]!
          const sprite = spriteCanvas(rows, HERO_PALETTE, p.dir === 'right')
          // Halfway down onto (or up from) a chair you bend your knees a pixel.
          const bend = p.seat && p.sit > 0 ? 1 : 0
          px(ctx, 'rgb(6 14 20 / 0.35)', x + 1, y + 14, 10, 2)
          ctx.drawImage(sprite, x, y + 15 - rows.length + bend)
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

import { spriteCanvas } from '~/game/canvas'
import {
  PIP_BLINK,
  PIP_HEART,
  PIP_HEART_PALETTE,
  PIP_PALETTE,
  PIP_SIT,
  PIP_SLEEP,
  PIP_WALK,
  PIP_WALK_DOWN,
  PIP_WALK_UP
} from '~/game/sprites'

/**
 * Pip, Timo's Siberian cat, as a game companion. Before you have made friends Pip naps in one spot; after
 * that Pip trails one step behind you, like a party member in an RPG. Shared by the town and the rooms.
 */

type Point = { x: number; y: number }

export type Companion = {
  tile: Point
  from: Point | null
  to: Point | null
  t: number
  steps: number
  /** Which way the side-view sprite looks (kept while walking up or down). */
  facing: 'left' | 'right'
  /** Which way Pip is walking: picks the side, front or back walk cycle. */
  dir: 'left' | 'right' | 'up' | 'down'
  /** Milliseconds since Pip last arrived on a tile: Pip keeps the walk pose for a moment between steps. */
  idle: number
  /** Tiles the player has just left, oldest first: Pip walks this trail. */
  trail: Point[]
  asleep: boolean
  /** Walking back to you over land after waiting somewhere (the pond shore): no jump to your side. */
  returning: boolean
  hearts: { x: number; y: number; age: number }[]
  /** At home Pip heads for the bed instead of following you: see `sendToBed`. */
  bed: Bed | null
  /** The hop up onto the bed, from art-pixel `from` to the bed's `perch`; `t` runs 0 to 1. */
  hop: { from: Point; t: number } | null
}

/**
 * A bed Pip naps on. `ways` are the floor tiles next to it Pip can hop up from, each with the bed tile it lands
 * on (where you can pet him); `perch` is where the curled-up sprite sits, in art pixels.
 */
export type Bed = { ways: { side: Point; onto: Point }[]; perch: Point }

const TILE = 16
/** How long Pip holds the walk pose after a step before sitting down, so a chain of steps never flickers. */
const SETTLE_MS = 120
/** Walking back to you Pip trots a little quicker than your stride, so he catches up when you stop. */
const RETURN_PACE = 0.8
/** On arriving next to the bed Pip waits a beat, then hops up. */
const HOP_WAIT_MS = 260
const HOP_MS = 420
/** How high the hop onto the bed goes, in art pixels. */
const HOP_HEIGHT = 10
/** PIP_SLEEP is 16 x 9, drawn 6 px below Pip's position. */
const SLEEP_W = 16
const SLEEP_TOP = 6
const SLEEP_H = 9

export function createCompanion(at: Point, asleep: boolean): Companion {
  return {
    tile: { ...at },
    from: null,
    to: null,
    t: 0,
    steps: 0,
    facing: 'left',
    dir: 'down',
    idle: SETTLE_MS,
    trail: [],
    asleep,
    returning: false,
    hearts: [],
    bed: null,
    hop: null
  }
}

/** Put Pip on a free tile next to `at` (used when entering or leaving a building). */
export function placeNear(c: Companion, at: Point, walkable: (x: number, y: number) => boolean) {
  const spots = [
    { x: at.x - 1, y: at.y },
    { x: at.x + 1, y: at.y },
    { x: at.x, y: at.y - 1 },
    { x: at.x, y: at.y + 1 }
  ]
  const spot = spots.find((s) => walkable(s.x, s.y)) ?? at
  c.tile = { ...spot }
  c.from = null
  c.to = null
  c.idle = SETTLE_MS
  c.trail = []
  c.returning = false
}

/** Send Pip walking back to you from wherever he is (see `updateCompanion`'s `route`). */
export function walkBack(c: Companion) {
  if (c.asleep) return
  c.returning = true
  c.trail = []
}

/** At home: Pip stops following, walks to the bed (see `updateCompanion`'s `route`), jumps on it and sleeps. */
export function sendToBed(c: Companion, bed: Bed) {
  c.bed = bed
  c.trail = []
  c.returning = false
}

function stepTo(c: Companion, next: Point) {
  if (next.x !== c.tile.x) {
    c.facing = next.x < c.tile.x ? 'left' : 'right'
    c.dir = c.facing
  } else c.dir = next.y < c.tile.y ? 'up' : 'down'
  c.from = { ...c.tile }
  c.to = { ...next }
  c.t = 0
}

/** Call when the player starts a step away from `left`, so Pip steps in as you step out. */
export function remember(c: Companion, left: Point) {
  if (c.asleep) return
  const last = c.trail[c.trail.length - 1]
  if (last && last.x === left.x && last.y === left.y) return
  c.trail.push({ ...left })
  if (c.trail.length > 4) c.trail.shift()
}

/**
 * `player` is the tile the player is on or walking to; `stepMs` is the player's step time, so Pip keeps
 * pace exactly one tile behind instead of running ahead and waiting. `route` gives Pip's next step towards
 * you (a path over land) while he is walking back, or null when the way is blocked for now.
 */
export function updateCompanion(
  c: Companion,
  player: Point,
  dt: number,
  walkable: (x: number, y: number) => boolean,
  stepMs: number,
  route?: (from: Point) => Point | null
) {
  c.hearts = c.hearts.map((h) => ({ ...h, age: h.age + dt })).filter((h) => h.age < 1100)
  if (c.asleep) return
  if (c.from && c.to) {
    c.t += dt / (c.returning ? stepMs * RETURN_PACE : stepMs)
    if (c.t < 1) return
    c.tile = c.to
    c.from = null
    c.to = null
    c.steps++
    c.idle = 0
  } else c.idle += dt
  if (c.bed) {
    goToBed(c, c.bed, dt, route)
    return
  }
  const distance = Math.abs(c.tile.x - player.x) + Math.abs(c.tile.y - player.y)
  if (c.returning) {
    // Walking back: one step at a time along the route, until he is by your side again.
    if (distance <= 1) {
      c.returning = false
      c.trail = []
      return
    }
    const next = route?.(c.tile)
    if (next) stepTo(c, next)
    return
  }
  if (distance > 6) {
    // Left far behind (a jump or a long walk): catch up next to you.
    placeNear(c, player, walkable)
    return
  }
  // Follow when you pull ahead, and step aside into the tile you left when you walk into Pip.
  if (distance === 1) {
    c.trail = []
    return
  }
  // Skip trail tiles that are already behind Pip; walk to the next one that is a single step away.
  while (c.trail.length && Math.abs(c.trail[0]!.x - c.tile.x) + Math.abs(c.trail[0]!.y - c.tile.y) !== 1) c.trail.shift()
  const next = c.trail[0]
  if (!next || !walkable(next.x, next.y) || (next.x === player.x && next.y === player.y)) return
  c.trail.shift()
  stepTo(c, next)
}

/** Walk to a tile next to the bed (`route` gives the next step there), wait a beat, hop up and fall asleep. */
function goToBed(c: Companion, bed: Bed, dt: number, route?: (from: Point) => Point | null) {
  if (c.hop) {
    c.hop.t += dt / HOP_MS
    if (c.hop.t < 1) return
    c.hop = null
    c.asleep = true
    return
  }
  const way = bed.ways.find((w) => w.side.x === c.tile.x && w.side.y === c.tile.y)
  if (!way) {
    const next = route?.(c.tile)
    if (next) stepTo(c, next)
    return
  }
  if (c.idle < HOP_WAIT_MS) return
  const from = { x: c.tile.x * TILE, y: c.tile.y * TILE }
  if (bed.perch.x !== from.x) c.facing = bed.perch.x < from.x ? 'left' : 'right'
  c.tile = { ...way.onto }
  c.hop = { from, t: 0 }
}

/** On the bed, or on the way up: drawn over the bed instead of behind it. */
export function onBed(c: Companion) {
  return Boolean(c.bed && (c.hop || c.asleep))
}

export function pet(c: Companion) {
  const at = position(c)
  c.hearts.push({ x: at.x + 5, y: at.y - 2, age: 0 }, { x: at.x + 1, y: at.y + 1, age: -180 }, { x: at.x + 9, y: at.y, age: -360 })
}

export function position(c: Companion): Point {
  if (c.bed && c.hop) {
    const { from, t } = c.hop
    const { perch } = c.bed
    return { x: from.x + (perch.x - from.x) * t, y: from.y + (perch.y - from.y) * t - Math.sin(Math.PI * t) * HOP_HEIGHT }
  }
  if (c.bed && c.asleep) return { ...c.bed.perch }
  if (c.from && c.to) return { x: (c.from.x + (c.to.x - c.from.x) * c.t) * TILE, y: (c.from.y + (c.to.y - c.from.y) * c.t) * TILE }
  return { x: c.tile.x * TILE, y: c.tile.y * TILE }
}

/** Draws Pip (and any hearts) at art-pixel coordinates. `clock` drives blinking and the sleepy z's. */
export function drawCompanion(ctx: CanvasRenderingContext2D, c: Companion, clock: number, still: boolean) {
  const at = position(c)
  const x = Math.round(at.x)
  const y = Math.round(at.y)
  ctx.fillStyle = 'rgb(6 20 24 / 0.3)'
  if (c.asleep) {
    ctx.fillRect(x + 1, y + 14, 14, 2)
    ctx.drawImage(spriteCanvas(PIP_SLEEP, PIP_PALETTE), x, y + 6)
    if (!still) {
      // Sleepy z's drifting up.
      for (let k = 0; k < 2; k++) {
        const phase = (((clock / 1400 + k * 0.5) % 1) + 1) % 1
        const zx = x + 12 + Math.round(phase * 4)
        const zy = y + 2 - Math.round(phase * 10)
        ctx.globalAlpha = 1 - phase
        ctx.fillStyle = '#e8f0f8'
        ctx.fillRect(zx, zy, 3, 1)
        ctx.fillRect(zx + 1, zy + 1, 1, 1)
        ctx.fillRect(zx, zy + 2, 3, 1)
        ctx.globalAlpha = 1
      }
    }
  } else if (c.hop) {
    // Mid-air: the side view, legs stretched out.
    ctx.drawImage(spriteCanvas(PIP_WALK[1]!, PIP_PALETTE, c.facing === 'right'), x, y + 4)
  } else if (c.from || c.idle < SETTLE_MS) {
    ctx.fillRect(x + 2, y + 14, 12, 2)
    const frame = c.steps % 2
    if (c.dir === 'up') ctx.drawImage(spriteCanvas(PIP_WALK_UP[frame]!, PIP_PALETTE), x + 2, y + 2)
    else if (c.dir === 'down') ctx.drawImage(spriteCanvas(PIP_WALK_DOWN[frame]!, PIP_PALETTE), x + 2, y + 2)
    else ctx.drawImage(spriteCanvas(PIP_WALK[frame]!, PIP_PALETTE, c.facing === 'right'), x, y + 4)
  } else {
    ctx.fillRect(x + 2, y + 14, 12, 2)
    const blink = !still && clock % 3600 < 140
    ctx.drawImage(spriteCanvas(blink ? PIP_BLINK : PIP_SIT, PIP_PALETTE), x + 2, y + 2)
  }
  for (const h of c.hearts) {
    if (h.age < 0) continue
    const rise = Math.round((h.age / 1100) * 14)
    ctx.globalAlpha = 1 - h.age / 1100
    ctx.drawImage(spriteCanvas(PIP_HEART, PIP_HEART_PALETTE), Math.round(h.x), Math.round(h.y - rise))
    ctx.globalAlpha = 1
  }
}

/** Is Pip on this tile (for clicks and for "what is in front of me")? */
export function isAt(c: Companion, x: number, y: number) {
  if (c.bed && c.asleep) {
    // Curled up on the bed: any tile the sprite covers (so you can pet him from either side).
    const { perch } = c.bed
    const top = perch.y + SLEEP_TOP
    return (
      x >= Math.floor(perch.x / TILE) &&
      x <= Math.floor((perch.x + SLEEP_W - 1) / TILE) &&
      y >= Math.floor(top / TILE) &&
      y <= Math.floor((top + SLEEP_H - 1) / TILE)
    )
  }
  const tile = c.to ?? c.tile
  return tile.x === x && tile.y === y
}

import { LAMP_COLOR, type Light } from '~/game/lighting'

/**
 * The town: an original 30 x 20 tile map at night, drawn procedurally with canvas primitives (no tileset).
 * Everything is in art pixels: one tile is 16 x 16.
 */

export const TILE = 16
export const MAP_W = 30
export const MAP_H = 20

/** A tap on a direction key only turns you; hold it this long (or tap again) to walk. */
export const TURN_HOLD_MS = 140

export type PlaceId = 'town' | 'about' | 'experience' | 'education' | 'contact'
export type BuildingId = Exclude<PlaceId, 'town'>
export type Tile = 'grass' | 'grass2' | 'bush' | 'flower' | 'path' | 'plaza' | 'water' | 'tree' | 'fence'
export type Point = { x: number; y: number }

export type Building = {
  id: BuildingId
  x: number
  y: number
  w: number
  h: number
  roof: string
  roofDark: string
  door: Point
}

export const BUILDINGS: Building[] = [
  { id: 'experience', x: 3, y: 1, w: 5, h: 7, roof: '#34588f', roofDark: '#243f6b', door: { x: 5, y: 7 } },
  { id: 'education', x: 12, y: 2, w: 6, h: 5, roof: '#2f6e52', roofDark: '#22513c', door: { x: 14, y: 6 } },
  { id: 'contact', x: 22, y: 3, w: 5, h: 4, roof: '#a3473b', roofDark: '#7a342b', door: { x: 24, y: 6 } },
  { id: 'about', x: 4, y: 13, w: 5, h: 4, roof: '#b9773a', roofDark: '#8c5a2b', door: { x: 6, y: 16 } }
]

export const SIGNS: { x: number; y: number; target: BuildingId }[] = [
  { x: 6, y: 8, target: 'experience' },
  { x: 15, y: 7, target: 'education' },
  { x: 25, y: 7, target: 'contact' },
  { x: 5, y: 17, target: 'about' }
]

/** The post box on the Post office wall, left of the front door: using it opens the contact form. */
export const MAILBOX: Point = { x: 23, y: 6 }

export const isMailbox = (x: number, y: number) => x === MAILBOX.x && y === MAILBOX.y

export const LAMPS: Point[] = [
  { x: 4, y: 9 },
  { x: 11, y: 9 },
  { x: 18, y: 9 },
  { x: 25, y: 9 },
  { x: 11, y: 14 },
  { x: 18, y: 14 },
  { x: 9, y: 18 },
  { x: 27, y: 12 }
]

export const BENCHES: Point[] = [
  { x: 12, y: 14 },
  { x: 16, y: 14 }
]

/** A two-tier fountain filling the middle of the plaza, with a one-tile walk around it. */
export const FOUNTAIN = { x: 13, y: 9, w: 4, h: 3 }
export const ROBOT_HOME: Point = { x: 17, y: 12 }

/** Where Pip naps until you make friends: the garden next to Timo's house. */
export const PIP_HOME: Point = { x: 9, y: 15 }

export const SPAWN: Point = { x: 14, y: 12 }

/** Where the player appears when leaving a building: on the doorstep, facing the street. */
export function doorstep(id: BuildingId): Point {
  const door = BUILDINGS.find((b) => b.id === id)!.door
  return { x: door.x, y: door.y + 1 }
}

function buildTiles(): Tile[][] {
  const tiles: Tile[][] = Array.from({ length: MAP_H }, (_, y) =>
    Array.from({ length: MAP_W }, (_, x) => ((x * 7 + y * 13) % 5 === 0 ? 'grass2' : 'grass'))
  )
  const set = (x: number, y: number, tile: Tile) => {
    if (x >= 0 && y >= 0 && x < MAP_W && y < MAP_H) tiles[y]![x] = tile
  }
  const fill = (x0: number, y0: number, x1: number, y1: number, tile: Tile) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, tile)
  }

  // Forest border.
  fill(0, 0, MAP_W - 1, 0, 'tree')
  fill(0, MAP_H - 1, MAP_W - 1, MAP_H - 1, 'tree')
  fill(0, 0, 0, MAP_H - 1, 'tree')
  fill(MAP_W - 1, 0, MAP_W - 1, MAP_H - 1, 'tree')

  // Main street, plaza and lanes to every door.
  fill(1, 10, MAP_W - 2, 10, 'path')
  fill(12, 8, 17, 13, 'plaza')
  fill(5, 8, 5, 9, 'path')
  fill(14, 7, 14, 7, 'path')
  fill(24, 7, 24, 9, 'path')
  fill(14, 14, 14, 17, 'path')
  fill(6, 17, 14, 17, 'path')

  // Pond.
  fill(20, 13, 26, 17, 'water')
  set(20, 13, 'grass')
  set(26, 17, 'grass')
  fill(20, 12, 26, 12, 'fence')

  // Flower beds and bushes.
  for (const [x, y] of [
    [11, 12],
    [11, 13],
    [18, 12],
    [18, 13],
    [2, 8],
    [3, 8],
    [7, 8],
    [8, 12],
    [3, 12],
    [16, 7],
    [17, 7],
    [21, 8],
    [22, 8],
    [10, 16],
    [11, 16]
  ] as const)
    set(x, y, 'flower')
  for (const [x, y] of [
    [9, 8],
    [9, 9],
    [19, 7],
    [20, 7],
    [27, 7],
    [27, 8],
    [1, 11],
    [2, 11],
    [17, 16],
    [18, 16],
    [27, 15],
    [27, 16]
  ] as const)
    set(x, y, 'bush')

  // Trees inside town.
  for (const [x, y] of [
    [9, 2],
    [10, 4],
    [9, 6],
    [20, 2],
    [20, 5],
    [27, 2],
    [27, 4],
    [1, 13],
    [2, 15],
    [1, 17],
    [10, 14],
    [15, 18],
    [19, 18],
    [28, 18],
    [28, 8],
    [21, 11],
    [8, 4]
  ] as const)
    set(x, y, 'tree')

  return tiles
}

export const TILES = buildTiles()

export function buildingAt(x: number, y: number) {
  return BUILDINGS.find((b) => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h)
}

/** Solid part of a building: its back (roof) row is walkable, so you can step in behind the roof. */
const blocksAt = (x: number, y: number) => {
  const b = buildingAt(x, y)
  return Boolean(b && y > b.y)
}

export function signAt(x: number, y: number) {
  return SIGNS.find((s) => s.x === x && s.y === y)
}

const isLamp = (x: number, y: number) => LAMPS.some((l) => l.x === x && l.y === y)
const isBench = (x: number, y: number) => BENCHES.some((b) => b.x === x && b.y === y)
const isFountain = (x: number, y: number) =>
  x >= FOUNTAIN.x && x < FOUNTAIN.x + FOUNTAIN.w && y >= FOUNTAIN.y && y < FOUNTAIN.y + FOUNTAIN.h

export function isWalkable(x: number, y: number, blockers: Point[] = []) {
  if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return false
  const tile = TILES[y]![x]!
  if (tile === 'tree' || tile === 'bush' || tile === 'water' || tile === 'fence') return false
  if (blocksAt(x, y) || signAt(x, y) || isLamp(x, y) || isBench(x, y) || isFountain(x, y)) return false
  return !blockers.some((b) => b.x === x && b.y === y)
}

export function isWater(x: number, y: number) {
  return x >= 0 && y >= 0 && x < MAP_W && y < MAP_H && TILES[y]![x] === 'water'
}

/** Breadth-first path over walkable tiles to the nearest of `goals`; returns the steps after `from`, or null. */
export function findPath(from: Point, goals: Point[], blockers: Point[] = []) {
  return findRoute(from, goals, (x, y) => isWalkable(x, y, blockers))
}

/** Breadth-first path over tiles that `passable` allows (land, or the pond for the boat), to the nearest goal. */
export function findRoute(from: Point, goals: Point[], passable: (x: number, y: number) => boolean) {
  const key = (x: number, y: number) => y * MAP_W + x
  const goalKeys = new Set(goals.map((g) => key(g.x, g.y)))
  const previous = new Map<number, number>([[key(from.x, from.y), -1]])
  const queue = [key(from.x, from.y)]
  let found = goalKeys.has(queue[0]!) ? queue[0]! : -1

  while (queue.length && found < 0) {
    const current = queue.shift()!
    const cx = current % MAP_W
    const cy = Math.floor(current / MAP_W)
    for (const [dx, dy] of [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0]
    ] as const) {
      const nx = cx + dx
      const ny = cy + dy
      const next = key(nx, ny)
      if (previous.has(next) || !passable(nx, ny)) continue
      previous.set(next, current)
      if (goalKeys.has(next)) {
        found = next
        break
      }
      queue.push(next)
    }
  }

  if (found < 0) return null
  const steps: Point[] = []
  let node = found
  while (node !== key(from.x, from.y)) {
    steps.unshift({ x: node % MAP_W, y: Math.floor(node / MAP_W) })
    node = previous.get(node)!
  }
  return steps
}

/* ---------------------------------------------------------------------------
 * Drawing (art pixels). The palette is tuned for night: it sits under a blue-green darkness layer
 * that is cut open by warm lamp and window light.
 * ------------------------------------------------------------------------- */

const INK = '#14202a'
const GRASS = '#4c9a6a'
const GRASS_ALT = '#47925f'
const GRASS_DARK = '#3a7c55'
const GRASS_LIGHT = '#68b582'
export const WINDOW_LIGHT = '#f6cf6a'

type Ctx = CanvasRenderingContext2D

function px(ctx: Ctx, color: string, x: number, y: number, w = 1, h = 1) {
  ctx.fillStyle = color
  ctx.fillRect(x, y, w, h)
}

const tileAt = (x: number, y: number) => TILES[y]?.[x]

function drawGrass(ctx: Ctx, x: number, y: number, variant: boolean) {
  px(ctx, variant ? GRASS_ALT : GRASS, x, y, TILE, TILE)
  const marks = variant
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
    px(ctx, GRASS_DARK, x + mx!, y + my!, 1, 2)
    px(ctx, GRASS_DARK, x + mx! + 2, y + my!, 1, 2)
    px(ctx, GRASS_LIGHT, x + mx! + 1, y + my! - 1)
  }
}

function drawBush(ctx: Ctx, x: number, y: number) {
  drawGrass(ctx, x, y, false)
  px(ctx, 'rgb(6 20 24 / 0.3)', x + 2, y + 12, 12, 3)
  px(ctx, INK, x + 2, y + 4, 12, 9)
  px(ctx, INK, x + 4, y + 2, 8, 2)
  px(ctx, '#2f7550', x + 3, y + 4, 10, 8)
  px(ctx, '#2f7550', x + 5, y + 3, 6, 1)
  px(ctx, '#3f9064', x + 4, y + 4, 6, 4)
  px(ctx, '#5aa877', x + 5, y + 4, 2, 2)
  px(ctx, '#5aa877', x + 9, y + 6, 1, 1)
}

function drawFlower(ctx: Ctx, x: number, y: number, frame: number, seed: number) {
  drawGrass(ctx, x, y, false)
  const colors = ['#f07c8a', '#f4efe0', '#f2c94c', '#9fb7f0']
  const spots = [
    [3, 3],
    [10, 5],
    [5, 11],
    [12, 12]
  ]
  spots.forEach(([fx, fy], index) => {
    const color = colors[(seed + index) % colors.length]!
    const shift = (frame + index + seed) % 2
    const cx = x + fx! + shift
    const cy = y + fy!
    px(ctx, '#2f7550', x + fx!, cy + 2, 1, 2)
    px(ctx, color, cx, cy - 1)
    px(ctx, color, cx - 1, cy)
    px(ctx, color, cx + 1, cy)
    px(ctx, color, cx, cy + 1)
    px(ctx, '#ffe9a0', cx, cy)
  })
}

function drawPath(ctx: Ctx, tx: number, ty: number, kind: 'path' | 'plaza') {
  const x = tx * TILE
  const y = ty * TILE
  const isRoad = (t?: Tile) => t === 'path' || t === 'plaza'
  if (kind === 'plaza') {
    // Cobbled square: offset stone rows.
    px(ctx, '#b9ab8d', x, y, TILE, TILE)
    for (let row = 0; row < 4; row++) {
      const offset = row % 2 ? 4 : 0
      for (let col = -1; col < 3; col++) {
        const sx = x + col * 8 + offset
        const sy = y + row * 4
        px(ctx, '#9d9076', Math.max(x, sx), sy + 3, 8, 1)
        if (sx + 7 < x + TILE) px(ctx, '#9d9076', sx + 7, sy, 1, 4)
        if (sx + 1 >= x) px(ctx, '#cfc2a3', sx + 1, sy, 3, 1)
      }
    }
  } else {
    px(ctx, '#c8ad80', x, y, TILE, TILE)
    for (const [sx, sy] of [
      [3, 3],
      [11, 5],
      [6, 10],
      [13, 12],
      [2, 13]
    ] as const)
      px(ctx, '#ad9367', x + sx, y + sy, 2, 1)
  }
  const edge = '#8f7a55'
  if (!isRoad(tileAt(tx, ty - 1)) && !buildingAt(tx, ty - 1)) px(ctx, edge, x, y, TILE, 1)
  if (!isRoad(tileAt(tx, ty + 1)) && !buildingAt(tx, ty + 1)) px(ctx, edge, x, y + TILE - 1, TILE, 1)
  if (!isRoad(tileAt(tx - 1, ty))) px(ctx, edge, x, y, 1, TILE)
  if (!isRoad(tileAt(tx + 1, ty))) px(ctx, edge, x + TILE - 1, y, 1, TILE)
}

function drawWater(ctx: Ctx, tx: number, ty: number, frame: number) {
  const x = tx * TILE
  const y = ty * TILE
  px(ctx, '#2c6c97', x, y, TILE, TILE)
  const shift = frame % 2 ? 3 : 0
  for (const [wx, wy] of [
    [2, 3],
    [9, 7],
    [4, 12]
  ] as const) {
    px(ctx, '#6fb0d4', x + ((wx + shift) % 12), y + wy, 4, 1)
    px(ctx, '#225a80', x + ((wx + shift + 1) % 12), y + wy + 1, 3, 1)
  }
  const shore = '#d8c79c'
  if (tileAt(tx, ty - 1) !== 'water') px(ctx, shore, x, y, TILE, 2)
  if (tileAt(tx, ty + 1) !== 'water') px(ctx, shore, x, y + TILE - 2, TILE, 2)
  if (tileAt(tx - 1, ty) !== 'water') px(ctx, shore, x, y, 2, TILE)
  if (tileAt(tx + 1, ty) !== 'water') px(ctx, shore, x + TILE - 2, y, 2, TILE)
}

/** A tree; `sway` shifts the crown one pixel sideways (wind), the trunk stays put. */
function drawTree(ctx: Ctx, x: number, y: number, ground = true, sway = 0) {
  if (ground) drawGrass(ctx, x, y, false)
  px(ctx, 'rgb(6 20 24 / 0.35)', x + 2, y + 13, 12, 2)
  px(ctx, '#6b4a2e', x + 6, y + 10, 4, 5)
  px(ctx, INK, x + 6, y + 14, 4, 1)
  px(ctx, INK, x + 4, y + 10, 2, 1)
  px(ctx, INK, x + 10, y + 10, 2, 1)
  const c = x + sway
  px(ctx, INK, c + 3, y, 10, 1)
  px(ctx, INK, c + 1, y + 2, 1, 7)
  px(ctx, INK, c + 14, y + 2, 1, 7)
  px(ctx, INK, c + 2, y + 1, 1, 1)
  px(ctx, INK, c + 13, y + 1, 1, 1)
  px(ctx, INK, c + 2, y + 9, 12, 1)
  px(ctx, '#245c40', c + 2, y + 2, 12, 7)
  px(ctx, '#245c40', c + 3, y + 1, 10, 1)
  px(ctx, '#33805a', c + 3, y + 2, 9, 5)
  px(ctx, '#53a476', c + 4, y + 2, 4, 2)
  px(ctx, '#53a476', c + 9, y + 4, 2, 1)
  px(ctx, '#245c40', c + 6, y + 6, 2, 1)
}

function drawFence(ctx: Ctx, x: number, y: number) {
  drawGrass(ctx, x, y, false)
  px(ctx, '#d9cfbb', x, y + 6, TILE, 2)
  px(ctx, '#d9cfbb', x, y + 10, TILE, 2)
  px(ctx, INK, x, y + 8, TILE, 1)
  px(ctx, INK, x, y + 12, TILE, 1)
  for (const postX of [2, 10]) {
    px(ctx, INK, x + postX - 1, y + 3, 5, 12)
    px(ctx, '#efe7d6', x + postX, y + 4, 3, 10)
    px(ctx, '#b9af9b', x + postX + 2, y + 4, 1, 10)
  }
}

function drawBench(ctx: Ctx, tx: number, ty: number) {
  const x = tx * TILE
  const y = ty * TILE
  px(ctx, 'rgb(6 20 24 / 0.3)', x + 1, y + 12, 14, 2)
  px(ctx, INK, x + 1, y + 3, 14, 4)
  px(ctx, '#9a6a3c', x + 2, y + 4, 12, 2)
  px(ctx, INK, x + 1, y + 8, 14, 3)
  px(ctx, '#b7804a', x + 2, y + 8, 12, 2)
  px(ctx, INK, x + 2, y + 11, 2, 3)
  px(ctx, INK, x + 12, y + 11, 2, 3)
}

const STONE = '#cfc6b4'
const STONE_LIGHT = '#e3dccd'
const STONE_DARK = '#a39a88'
const STONE_DEEP = '#857c6c'
const POOL = '#2f78a8'
const POOL_LIGHT = '#3d86b5'
const RIPPLE = '#8fcbe6'
const SPRAY = '#d6f2fb'

/** A stepped (pixel) octagon: a rectangle with its corners cut `c` pixels deep. */
function octagon(ctx: Ctx, color: string, x: number, y: number, w: number, h: number, c: number) {
  px(ctx, color, x + c, y, w - 2 * c, h)
  for (let k = 0; k < c; k++) px(ctx, color, x + c - k - 1, y + k + 1, w - 2 * (c - k - 1), h - 2 * (k + 1))
}

/** The fountain's basin, in the static map layer: a wide octagonal stone pool with ripples round the pedestal. */
function drawFountain(ctx: Ctx, frame: number) {
  const x = FOUNTAIN.x * TILE
  const y = FOUNTAIN.y * TILE
  const w = FOUNTAIN.w * TILE
  const h = FOUNTAIN.h * TILE
  const cx = x + w / 2
  const cy = y + 29
  px(ctx, 'rgb(6 20 24 / 0.3)', x + 5, y + h - 3, w - 6, 4)
  // Outline, the basin's outer wall (seen at the front), then the broad rim on top with coping stones.
  octagon(ctx, INK, x + 1, y + 2, w - 2, h - 3, 6)
  octagon(ctx, STONE_DARK, x + 2, y + 3, w - 4, h - 5, 5)
  octagon(ctx, STONE, x + 2, y + 3, w - 4, h - 9, 5)
  px(ctx, STONE_LIGHT, x + 8, y + 3, w - 16, 1)
  for (let sx = x + 10; sx < x + w - 8; sx += 9) {
    px(ctx, STONE_DEEP, sx, y + h - 6, 1, 4)
    px(ctx, STONE_DARK, sx, y + 3, 1, 3)
  }
  // The pool.
  octagon(ctx, INK, x + 6, y + 7, w - 12, h - 17, 4)
  octagon(ctx, POOL, x + 7, y + 8, w - 14, h - 19, 3)
  px(ctx, POOL_LIGHT, x + 10, y + 9, w - 20, 1)
  px(ctx, 'rgb(6 20 24 / 0.25)', x + 8, y + h - 13, w - 16, 2)
  // Ripples spreading from where the water falls, on two frames.
  for (const rr of frame % 2 ? [9, 17] : [6, 14]) {
    const dy = Math.round(rr * 0.4)
    px(ctx, RIPPLE, cx - rr - 1, cy, 3, 1)
    px(ctx, RIPPLE, cx + rr - 2, cy, 3, 1)
    px(ctx, RIPPLE, cx - 3, cy + dy, 6, 1)
    px(ctx, RIPPLE, cx - rr + 2, cy + dy - 2, 2, 1)
    px(ctx, RIPPLE, cx + rr - 4, cy + dy - 2, 2, 1)
  }
  px(ctx, SPRAY, x + 12 + (frame % 2) * 3, y + 12, 1, 1)
  px(ctx, SPRAY, x + w - 14 - (frame % 2) * 3, y + 15, 1, 1)
  // Pedestal standing in the water.
  octagon(ctx, INK, cx - 7, y + 23, 14, 9, 3)
  octagon(ctx, STONE_DARK, cx - 6, y + 24, 12, 7, 2)
  octagon(ctx, STONE, cx - 6, y + 24, 12, 4, 2)
}

/**
 * The fountain's centrepiece: a column carrying a wide upper bowl and a small top bowl, with a jet, spray and
 * water spilling over both rims. It rises above the basin's footprint, so it is drawn as an entity (sorted at the
 * fountain's top edge) and a player walking behind the fountain passes behind it.
 */
export function drawFountainTop(ctx: Ctx, frame: number) {
  const x = FOUNTAIN.x * TILE
  const y = FOUNTAIN.y * TILE
  const cx = x + (FOUNTAIN.w * TILE) / 2
  const f = frame % 2
  // Column with a collar.
  px(ctx, INK, cx - 3, y + 12, 6, 13)
  px(ctx, STONE, cx - 2, y + 12, 4, 12)
  px(ctx, STONE_LIGHT, cx - 2, y + 12, 1, 12)
  px(ctx, STONE_DARK, cx + 1, y + 12, 1, 12)
  px(ctx, INK, cx - 4, y + 18, 8, 2)
  px(ctx, STONE_LIGHT, cx - 3, y + 18, 6, 1)
  // Water spilling from the upper bowl into the pool, with drops running down and a splash.
  for (const side of [-14, 13]) {
    px(ctx, '#6fb0d4', cx + side, y + 10, 1, 17)
    px(ctx, SPRAY, cx + side, y + 11 + f * 6, 1, 2)
    px(ctx, SPRAY, cx + side, y + 20 - f * 4, 1, 1)
    px(ctx, SPRAY, cx + side + (side < 0 ? -1 : 1) * (1 + f), y + 26 - f, 2, 1)
  }
  // Upper bowl: a broad dish of water on a stone rim.
  octagon(ctx, INK, cx - 13, y + 5, 26, 9, 2)
  octagon(ctx, STONE_DARK, cx - 12, y + 6, 24, 7, 1)
  octagon(ctx, STONE, cx - 12, y + 6, 24, 4, 1)
  px(ctx, POOL_LIGHT, cx - 10, y + 7, 20, 2)
  px(ctx, RIPPLE, cx - 8 + f * 3, y + 7, 3, 1)
  px(ctx, RIPPLE, cx + 4 - f * 3, y + 8, 3, 1)
  px(ctx, STONE_LIGHT, cx - 11, y + 6, 22, 1)
  // Stem and the small top bowl, overflowing on both sides.
  px(ctx, INK, cx - 2, y + 3, 4, 4)
  px(ctx, STONE, cx - 1, y + 3, 2, 4)
  octagon(ctx, INK, cx - 6, y - 2, 12, 6, 1)
  px(ctx, STONE, cx - 5, y - 1, 10, 2)
  px(ctx, POOL_LIGHT, cx - 4, y - 1, 8, 1)
  px(ctx, STONE_DARK, cx - 5, y + 1, 10, 2)
  for (const side of [-7, 6]) {
    px(ctx, RIPPLE, cx + side, y, 1, 6)
    px(ctx, SPRAY, cx + side, y + 1 + f * 3, 1, 1)
  }
  // The jet, rising and falling back as spray.
  px(ctx, '#bfe6f5', cx - 1, y - 9 + f, 2, 8 - f)
  px(ctx, '#ffffff', cx - 1, y - 9 + f, 1, 2)
  px(ctx, SPRAY, cx - 3 - f, y - 7 + f * 2, 1, 1)
  px(ctx, SPRAY, cx + 2 + f, y - 6 + f * 2, 1, 1)
  px(ctx, SPRAY, cx - 4, y - 3 - f, 1, 1)
  px(ctx, SPRAY, cx + 3, y - 2 - f, 1, 1)
}

/** Window rectangles per building, shared by the drawing and the lighting. */
export function windowsOf(b: Building) {
  const x = b.x * TILE
  const y = b.y * TILE
  const w = b.w * TILE
  const h = b.h * TILE
  const roofH = roofHeight(b)
  const wallY = y + roofH
  const doorX = b.door.x * TILE
  const rows = b.id === 'experience' ? 4 : 1
  const startY = b.id === 'experience' ? wallY + 5 : wallY + 6
  const result: { x: number; y: number; w: number; h: number }[] = []
  for (let row = 0; row < rows; row++) {
    const wy = startY + row * 13
    if (wy + 9 > y + h - 4) continue
    for (let wx = x + 5; wx < x + w - 12; wx += 14) {
      // Leave room for the door: skip a window that would sit over it.
      const overDoor = wx + 10 > doorX + 1 && wx < doorX + TILE - 1 && wy + 9 > y + h - 17
      if (!overDoor) result.push({ x: wx, y: wy, w: 10, h: 9 })
    }
  }
  return result
}

export function roofHeight(b: Building) {
  return Math.round(b.h * TILE * (b.id === 'experience' ? 0.26 : 0.46))
}

function drawBuilding(ctx: Ctx, b: Building) {
  const x = b.x * TILE
  const y = b.y * TILE
  const w = b.w * TILE
  const h = b.h * TILE
  const roofH = roofHeight(b)
  const wallY = y + roofH
  const wallH = h - roofH

  px(ctx, 'rgb(6 20 24 / 0.35)', x + 3, y + h - 2, w, 4)

  // Walls with siding lines and a darker plinth.
  px(ctx, INK, x + 1, wallY, w - 2, wallH)
  px(ctx, '#e6dcc2', x + 2, wallY, w - 4, wallH - 1)
  for (let row = wallY + 4; row < y + h - 4; row += 5) px(ctx, '#d6caab', x + 2, row, w - 4, 1)
  px(ctx, '#b9ac8c', x + 2, y + h - 4, w - 4, 3)

  // Roof with shingle rows.
  px(ctx, INK, x, y, w, roofH + 1)
  px(ctx, b.roof, x + 1, y + 1, w - 2, roofH - 1)
  for (let row = y + 4; row < y + roofH; row += 4) {
    px(ctx, b.roofDark, x + 1, row, w - 2, 1)
    for (let col = x + ((row / 4) % 2 ? 3 : 7); col < x + w - 2; col += 8) px(ctx, b.roofDark, col, row - 3, 1, 3)
  }
  px(ctx, 'rgb(255 255 255 / 0.22)', x + 1, y + 1, w - 2, 1)
  px(ctx, b.roofDark, x + 1, y + roofH - 1, w - 2, 1)

  // Lit windows.
  for (const win of windowsOf(b)) {
    px(ctx, INK, win.x, win.y, win.w, win.h)
    px(ctx, WINDOW_LIGHT, win.x + 1, win.y + 1, win.w - 2, win.h - 2)
    px(ctx, '#fff3c4', win.x + 2, win.y + 2, 2, 2)
    px(ctx, '#d8a94a', win.x + 1, win.y + win.h - 3, win.w - 2, 2)
    px(ctx, INK, win.x + 5, win.y + 1, 1, win.h - 2)
    px(ctx, '#f4efe0', win.x - 1, win.y + win.h, win.w + 2, 1)
  }

  // Depth: darker wall corners and the shadow under the roof's overhang.
  px(ctx, 'rgb(20 32 42 / 0.18)', x + 2, wallY, 3, wallH - 1)
  px(ctx, 'rgb(20 32 42 / 0.28)', x + w - 5, wallY, 3, wallH - 1)
  px(ctx, 'rgb(20 32 42 / 0.3)', x + 2, wallY, w - 4, 2)

  // Door with a warm transom.
  const doorX = b.door.x * TILE
  px(ctx, INK, doorX + 3, y + h - 16, 10, 16)
  px(ctx, '#f6cf6a', doorX + 4, y + h - 15, 8, 2)
  px(ctx, '#7a4f2a', doorX + 4, y + h - 12, 8, 11)
  px(ctx, '#5f3c1f', doorX + 8, y + h - 12, 1, 11)
  px(ctx, '#e4b84a', doorX + 10, y + h - 7, 1, 1)

  const awning = (colorA: string, colorB: string) => {
    // A striped canopy over the door with a scalloped edge.
    px(ctx, INK, doorX - 1, y + h - 22, 18, 6)
    for (let k = 0; k < 16; k += 2) px(ctx, k % 4 ? colorB : colorA, doorX + k, y + h - 21, 2, 4)
    for (let k = 0; k < 16; k += 4) px(ctx, INK, doorX + k + 3, y + h - 17, 1, 1)
    px(ctx, 'rgb(20 32 42 / 0.3)', doorX, y + h - 16, 16, 2)
  }

  if (b.id === 'experience') {
    awning('#27427a', '#d9e2f2')
    // Floor bands between the window rows.
    for (let row = wallY + 17; row < y + h - 22; row += 13) px(ctx, '#c9bc98', x + 2, row, w - 4, 1)
  }

  if (b.id === 'education') {
    // Columns either side of the door and stone steps.
    // A small portico: two columns framing the door under a stone lintel.
    const top = y + h - 22
    for (const cx of [doorX - 3, doorX + 16]) {
      px(ctx, INK, cx - 1, top, 5, y + h - top)
      px(ctx, '#f4efe0', cx, top + 1, 3, y + h - top - 2)
      px(ctx, '#cfc6b4', cx + 2, top + 1, 1, y + h - top - 2)
    }
    px(ctx, INK, doorX - 5, top - 3, 26, 4)
    px(ctx, '#f4efe0', doorX - 4, top - 2, 24, 2)
    px(ctx, '#cfc6b4', doorX - 4, top - 1, 24, 1)
    px(ctx, INK, doorX - 1, y + h, 18, 3)
    px(ctx, '#cfc6b4', doorX, y + h, 16, 1)
    px(ctx, '#b9ae98', doorX, y + h + 1, 16, 1)
  } else {
    px(ctx, '#9c3b33', doorX + 2, y + h, 12, 2)
  }

  if (b.id === 'contact') {
    awning('#a3473b', '#f4efe0')
    // A red post box on the wall left of the door.
    const mx = MAILBOX.x * TILE + 5
    px(ctx, INK, mx, y + h - 13, 8, 11)
    px(ctx, '#c0473b', mx + 1, y + h - 12, 6, 9)
    px(ctx, '#e06a5c', mx + 1, y + h - 12, 6, 1)
    px(ctx, INK, mx + 2, y + h - 9, 4, 1)
    px(ctx, INK, mx + 3, y + h - 2, 2, 2)
  }

  if (b.id === 'about') {
    // Flower boxes under the windows.
    const blooms = ['#f07c8a', '#f8f8f0', '#f2c94c', '#9fb7f0']
    windowsOf(b).forEach((win, index) => {
      px(ctx, INK, win.x - 1, win.y + win.h, win.w + 2, 4)
      px(ctx, '#8a5a2c', win.x, win.y + win.h + 1, win.w, 2)
      for (let k = 0; k < win.w; k += 3) {
        px(ctx, '#3f8a5e', win.x + k, win.y + win.h - 1, 2, 1)
        px(ctx, blooms[(index + k) % blooms.length]!, win.x + k + 1, win.y + win.h - 2, 1, 1)
      }
    })
  }
}

/** Top of the house chimney, for the smoke. */
export function chimneyTop(): Point {
  const house = BUILDINGS.find((b) => b.id === 'about')!
  return { x: house.x * TILE + house.w * TILE - 10, y: house.y * TILE - 7 }
}

/**
 * Forest around the town, in tiles on every side. The camera stays on the player, so near the edge of town
 * you look into the woods; this is wide enough for half of the largest view.
 */
export const FOREST = 16

/** A tree as a cached sprite (17 px wide to leave room for the lean), tinted darker deeper into the woods. */
const treeSprites = new Map<string, HTMLCanvasElement>()
function treeSprite(sway: number, tint: number) {
  const key = `${sway}|${tint}`
  let sprite = treeSprites.get(key)
  if (!sprite) {
    sprite = document.createElement('canvas')
    sprite.width = TILE + 1
    sprite.height = TILE
    const sctx = sprite.getContext('2d')!
    drawTree(sctx, 0, 0, false, sway)
    if (tint > 0) {
      sctx.globalCompositeOperation = 'source-atop'
      px(sctx, `rgb(4 18 22 / ${tint})`, 0, 0, TILE + 1, TILE)
    }
    treeSprites.set(key, sprite)
  }
  return sprite
}

/** How dark the woods are at a tile: 0 in town, darker the deeper into the forest. */
function forestTint(tx: number, ty: number) {
  if (tx >= 0 && ty >= 0 && tx < MAP_W && ty < MAP_H) return 0
  const depth = Math.max(-1 - tx, tx - MAP_W, -1 - ty, ty - MAP_H, 0)
  return Math.min(0.62, 0.1 + depth * 0.07)
}

/** Every tree, in drawing order: the forest (with a half-offset second row) and then the trees in town. */
const TREES = (() => {
  const inMap = (tx: number, ty: number) => tx >= 0 && ty >= 0 && tx < MAP_W && ty < MAP_H
  const trees: { x: number; y: number; tint: number; seed: number }[] = []
  const add = (x: number, y: number, tx: number, ty: number) =>
    trees.push({ x, y, tint: forestTint(tx, ty), seed: ((tx * 73856093) ^ (ty * 19349663) ^ (x * 83492791)) >>> 0 })
  for (let ty = -FOREST; ty < MAP_H + FOREST; ty++) {
    for (let tx = -FOREST; tx < MAP_W + FOREST; tx++) {
      if (inMap(tx, ty)) continue
      add(tx * TILE, ty * TILE, tx, ty)
      // A second, half-offset row between the first, so the woods read as a forest, not a grid.
      if (inMap(tx + 1, ty + 1) || inMap(tx, ty + 1) || inMap(tx + 1, ty)) continue
      add(tx * TILE + 8, ty * TILE + 8, tx, ty)
    }
  }
  for (let ty = 0; ty < MAP_H; ty++) for (let tx = 0; tx < MAP_W; tx++) if (TILES[ty]![tx] === 'tree') add(tx * TILE, ty * TILE, tx, ty)
  return trees
})()

/**
 * Wind. Gusts roll across the woods as broad diagonal waves, and each tree has its own small offset, so trees
 * lean (one pixel, downwind) and spring back one after another instead of all at once. Upright while paused.
 */
function treeLean(x: number, y: number, seed: number, clock: number) {
  const t = clock / 1000
  const wave = Math.sin(t * 1.3 - x * 0.019 - y * 0.008)
  const own = 0.35 * Math.sin(t * 0.9 + (seed % 628) / 100)
  // Stronger and weaker spells, but never a dead calm.
  const gusts = 0.85 + 0.15 * Math.sin(t * 0.23)
  return wave * gusts + own > 0.68 ? 1 : 0
}

/** Draws the trees in view (art pixels, camera applied). Called every frame, right after the map layer. */
export function drawTrees(ctx: Ctx, clock: number, still: boolean, view: { x: number; y: number; w: number; h: number }) {
  for (const tree of TREES) {
    if (tree.x > view.x + view.w || tree.y > view.y + view.h || tree.x + TILE + 1 < view.x || tree.y + TILE < view.y) continue
    const lean = still ? 0 : treeLean(tree.x, tree.y, tree.seed, clock)
    ctx.drawImage(treeSprite(lean, tree.tint), tree.x, tree.y)
  }
}

/** The forest floor outside the map, darker the deeper in (the trees themselves come from `drawTrees`). */
function drawForest(ctx: Ctx) {
  for (let ty = -FOREST; ty < MAP_H + FOREST; ty++) {
    for (let tx = -FOREST; tx < MAP_W + FOREST; tx++) {
      const tint = forestTint(tx, ty)
      if (!tint) continue
      drawGrass(ctx, tx * TILE, ty * TILE, (tx * 7 + ty * 13) % 5 === 0)
      px(ctx, `rgb(4 18 22 / ${tint})`, tx * TILE, ty * TILE, TILE, TILE)
    }
  }
}

/**
 * The ground of the town and the forest around it for one animation frame (flowers, water and the fountain have
 * two frames). Trees are drawn on top every frame by `drawTrees`, so the wind can move through them. Drawn with
 * its origin at (-FOREST, -FOREST) tiles.
 */
export function renderMapLayer(frame: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = (MAP_W + FOREST * 2) * TILE
  canvas.height = (MAP_H + FOREST * 2) * TILE
  const ctx = canvas.getContext('2d')!
  ctx.translate(FOREST * TILE, FOREST * TILE)
  drawForest(ctx)

  for (let ty = 0; ty < MAP_H; ty++) {
    for (let tx = 0; tx < MAP_W; tx++) {
      const tile = TILES[ty]![tx]!
      const x = tx * TILE
      const y = ty * TILE
      if (tile === 'grass' || tile === 'grass2' || tile === 'tree') drawGrass(ctx, x, y, tile === 'grass2')
      else if (tile === 'bush') drawBush(ctx, x, y)
      else if (tile === 'flower') drawFlower(ctx, x, y, frame, tx + ty)
      else if (tile === 'path' || tile === 'plaza') drawPath(ctx, tx, ty, tile)
      else if (tile === 'water') drawWater(ctx, tx, ty, frame)
      else if (tile === 'fence') drawFence(ctx, x, y)
    }
  }
  for (const bench of BENCHES) drawBench(ctx, bench.x, bench.y)
  drawFountain(ctx, frame)
  for (const building of BUILDINGS) drawBuilding(ctx, building)
  return canvas
}

/**
 * Street lamp, drawn as an entity so it overlaps the player correctly. A cast-iron post on a stepped plinth with a
 * collar, and a four-pane lantern under a peaked cap with a brass finial. Its head pokes into the tiles above.
 */
export function drawLamp(ctx: Ctx, lamp: Point) {
  const x = lamp.x * TILE + 6
  const y = lamp.y * TILE
  const iron = '#3c4a57'
  const ironLight = '#5a6b7a'
  px(ctx, 'rgb(6 20 24 / 0.35)', x - 3, y + 13, 10, 2)
  // Plinth.
  px(ctx, INK, x - 2, y + 10, 8, 5)
  px(ctx, ironLight, x - 1, y + 10, 6, 1)
  px(ctx, iron, x - 1, y + 11, 6, 3)
  px(ctx, INK, x - 1, y + 9, 6, 1)
  // Post with a highlight down one side and a collar halfway.
  px(ctx, INK, x, y - 6, 4, 16)
  px(ctx, iron, x + 1, y - 5, 2, 14)
  px(ctx, ironLight, x + 1, y - 5, 1, 14)
  px(ctx, INK, x - 1, y + 1, 6, 2)
  px(ctx, ironLight, x, y + 1, 4, 1)
  // Lantern: drip tray, glowing panes between dark bars, cap and finial.
  px(ctx, INK, x - 2, y - 7, 8, 2)
  px(ctx, iron, x - 1, y - 7, 6, 1)
  px(ctx, INK, x - 3, y - 13, 10, 6)
  px(ctx, '#f6cf6a', x - 2, y - 12, 8, 4)
  px(ctx, '#ffe39a', x + 1, y - 12, 2, 4)
  px(ctx, '#fff6d6', x + 1, y - 11, 2, 2)
  px(ctx, '#d8a94a', x - 2, y - 9, 8, 1)
  px(ctx, INK, x, y - 12, 1, 4)
  px(ctx, INK, x + 3, y - 12, 1, 4)
  px(ctx, INK, x - 4, y - 14, 12, 1)
  px(ctx, INK, x - 3, y - 15, 10, 1)
  px(ctx, ironLight, x - 2, y - 15, 8, 1)
  px(ctx, INK, x - 2, y - 16, 8, 1)
  px(ctx, iron, x - 1, y - 16, 6, 1)
  px(ctx, INK, x, y - 17, 4, 1)
  px(ctx, INK, x + 1, y - 19, 2, 2)
  px(ctx, '#e4b84a', x + 1, y - 19, 1, 1)
}

/**
 * What sticks up above a building's footprint (chimney, bell tower, antenna with its beacon). Drawn as an entity
 * sorted at the building's front edge, so a player walking behind the building passes behind it.
 */
export function drawBuildingTop(ctx: Ctx, b: Building, frame: number) {
  const x = b.x * TILE
  const y = b.y * TILE
  const w = b.w * TILE
  if (b.id === 'experience') {
    const ax = x + w / 2
    px(ctx, INK, ax, y - 8, 1, 8)
    // Frame 0 is the lit one, so a paused beacon matches its red light.
    px(ctx, INK, ax - 1, y - 11, 3, 3)
    px(ctx, frame % 2 ? '#9b3329' : '#ff6f61', ax, y - 10, 1, 1)
  }
  if (b.id === 'education') {
    const bx = x + w / 2 - 6
    px(ctx, INK, bx, y - 9, 12, 10)
    px(ctx, '#efe7d6', bx + 1, y - 8, 10, 8)
    px(ctx, '#3a2a1a', bx + 3, y - 6, 6, 5)
    px(ctx, '#e4b84a', bx + 4, y - 5, 4, 3)
    px(ctx, '#b8862e', bx + 5, y - 2, 2, 1)
    px(ctx, INK, bx - 1, y - 12, 14, 3)
    px(ctx, b.roof, bx, y - 11, 12, 1)
  }
  if (b.id === 'about') {
    px(ctx, INK, x + w - 14, y - 6, 8, 9)
    px(ctx, '#9d4f3a', x + w - 13, y - 5, 6, 8)
    px(ctx, '#c06a4e', x + w - 13, y - 5, 6, 1)
  }
}

export type { Light }

/** Every static light in town: lamps, windows, door transoms, the fountain. */
export function staticLights(): Light[] {
  const lights: Light[] = []
  for (const lamp of LAMPS) lights.push({ x: lamp.x * TILE + 8, y: lamp.y * TILE - 10, r: 46, strength: 1, color: LAMP_COLOR, flame: true })
  for (const b of BUILDINGS) {
    for (const win of windowsOf(b)) lights.push({ x: win.x + win.w / 2, y: win.y + win.h / 2, r: 9, strength: 0.6, color: '255 210 130' })
    lights.push({ x: b.door.x * TILE + 8, y: (b.y + b.h) * TILE - 6, r: 22, strength: 0.8, color: '255 210 120' })
  }
  lights.push({ x: (FOUNTAIN.x + FOUNTAIN.w / 2) * TILE, y: FOUNTAIN.y * TILE + 18, r: 44, strength: 0.6, color: '140 210 235' })
  const tower = BUILDINGS[0]!
  lights.push({ x: tower.x * TILE + (tower.w * TILE) / 2, y: tower.y * TILE - 10, r: 8, strength: 0.9, color: '255 120 100' })
  return lights
}

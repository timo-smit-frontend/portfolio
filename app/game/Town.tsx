import { lazy, Suspense, useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { useMotionPreference } from '~/components/motion/MotionPreference'
import { setupPixelCanvas, spriteCanvas, gameScale } from '~/game/canvas'
import {
  createCompanion,
  drawCompanion,
  isAt,
  pet,
  placeNear,
  position as companionPosition,
  remember,
  updateCompanion,
  walkBack
} from '~/game/companion'
import DialogBox, { type DialogChoice, type DialogHandle } from '~/game/DialogBox'
import { useProgress } from '~/game/progress'
import {
  BOAT,
  BOAT_DOWN,
  BOAT_DOWN_FRONT,
  BOAT_PALETTE,
  BOAT_UP,
  BOAT_UP_FRONT,
  BUBBLE,
  BUBBLE_PALETTE,
  HERO_BLINK,
  HERO_FRAMES,
  HERO_HEIGHT,
  HERO_PALETTE,
  ROBOT,
  ROBOT_BACK,
  ROBOT_PALETTE,
  ROBOT_SIDE,
  SIGN,
  SIGN_PALETTE,
  SPARKLE,
  SPARKLE_PALETTE,
  type Direction
} from '~/game/sprites'
import {
  BUILDINGS,
  buildingAt,
  chimneyTop,
  drawBuildingTop,
  drawFountainTop,
  drawLamp,
  drawTrees,
  FOUNTAIN,
  findPath,
  findRoute,
  isMailbox,
  isWalkable,
  isWater,
  LAMPS,
  MAP_H,
  MAP_W,
  PIP_HOME,
  renderMapLayer,
  roofHeight,
  ROBOT_HOME,
  SIGNS,
  signAt,
  staticLights,
  FOREST,
  TILE,
  TURN_HOLD_MS,
  type BuildingId,
  type Light,
  type Point
} from '~/game/world'
import { applyLighting, lampPulse } from '~/game/lighting'

// The contact form only loads once you use the post box.
const LetterDialog = lazy(() => import('~/game/interior/LetterDialog'))
import { useLocale } from '~/i18n/useLocale'
import { quietFocus, quietOnPointer } from '~/game/quietFocus'
import { CLOSE_ZOOM, closeZoomProgress, door, doorBusy, easeInOut, OPEN_ZOOM, openPullProgress, trackFocus } from '~/game/transition'

const STEP_MS = 165

// Byte's tips and Pip's lines go round in order; the place in the list is kept, so a return visit goes on
// with lines you have not seen yet.
const BYTE_TIP_KEY = 'ts-byte-tip'
const PIP_LINE_KEY = 'ts-pip-line'
const lineIndex: Record<string, number> = {}

function nextLine(key: string, lines: readonly string[]) {
  if (lineIndex[key] === undefined) {
    try {
      lineIndex[key] = Number(window.localStorage.getItem(key)) || 0
    } catch {
      lineIndex[key] = 0
    }
  }
  const index = lineIndex[key] % lines.length
  lineIndex[key] = index + 1
  try {
    window.localStorage.setItem(key, String(index + 1))
  } catch {
    // Storage blocked: the order still holds for this visit.
  }
  return lines[index]!
}

/** The first look at the town (after the welcome card, or on load): a beat close up, then the pull back. */
const INTRO_HOLD_MS = 250
const INTRO_PULL_MS = 1300
/** Coming out: wait in the doorway until the circle has nearly popped open, then step out. */
const STEP_OUT_AT = 140
const DIRS: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
}
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

export type Spawn = Point & { dir: Direction; key: string }
type Target =
  | { kind: 'door'; id: BuildingId }
  | { kind: 'sign'; id: BuildingId }
  | { kind: 'mailbox' }
  | { kind: 'robot' }
  | { kind: 'pip' }
  | { kind: 'water' }
export type Prompt = { kind: Target['kind']; id?: BuildingId } | null

type Mover = { tile: Point; from: Point | null; to: Point | null; t: number }

/*
 * Easter egg: talk to the pond and say yes, and Byte runs over, hops in and turns into a boat. You sail it
 * around the pond; sail into the shore and you hop off, he turns back into a robot and walks home.
 *   coming -> hopIn -> transform -> sailOver -> boarding -> sailing -> drifting -> untransform -> hopOut -> home
 */
type RidePhase =
  'idle' | 'coming' | 'hopIn' | 'transform' | 'sailOver' | 'boarding' | 'sailing' | 'drifting' | 'untransform' | 'hopOut' | 'home'
/** Phases where Byte is on his way to pick you up: you wait at the water's edge. */
const WAITING: ReadonlySet<RidePhase> = new Set(['coming', 'hopIn', 'transform', 'sailOver', 'boarding'])
/** A hop into or out of the water (the player and Byte), a robot-to-boat change, and the boat's pace. */
const HOP_MS = 320
const MORPH_MS = 900
const SAIL_MS = 240
const BYTE_RUN_MS = 210
const BYTE_WALK_MS = 300
const BYTE_WANDER_MS = 360
/** Rows of the hero that show above the boat's rim while he sits in it. */
const SEAT_ROWS = 13

const same = (a: Point, b: Point) => a.x === b.x && a.y === b.y
const distance = (a: Point, b: Point) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
const around = (tile: Point) => (Object.values(DIRS) as Point[]).map((d) => ({ x: tile.x + d.x, y: tile.y + d.y }))
const waterAround = (tile: Point) => around(tile).filter((t) => isWater(t.x, t.y))
/** Land at the water's edge: where Byte can hop in. */
const SHORE: Point[] = Array.from({ length: MAP_W * MAP_H }, (_, i) => ({ x: i % MAP_W, y: Math.floor(i / MAP_W) })).filter(
  (t) => isWalkable(t.x, t.y) && waterAround(t).length > 0
)

function directionTo(from: Point, to: Point): Direction {
  if (to.x > from.x) return 'right'
  if (to.x < from.x) return 'left'
  if (to.y < from.y) return 'up'
  return 'down'
}

function seeded(seed: number) {
  let value = seed
  return () => {
    value = (value * 16807) % 2147483647
    return (value - 1) / 2147483646
  }
}

const FIREFLIES = (() => {
  const random = seeded(11)
  return Array.from({ length: 22 }, () => ({
    x: 16 + random() * (MAP_W * TILE - 32),
    y: 16 + random() * (MAP_H * TILE - 32),
    phase: random() * Math.PI * 2,
    speed: 0.4 + random() * 0.6
  }))
})()

export default function Town({
  active,
  intro = false,
  spawn,
  onEnter
}: {
  active: boolean
  /** The welcome card is over the town: hold the "you are here" marker until it closes. */
  intro?: boolean
  spawn: Spawn
  /** Player walked into a door. `origin` is the door's position in viewport pixels (for the iris). */
  onEnter: (id: BuildingId, origin: Point) => void
}) {
  const { t, locale } = useLocale()
  const tRef = useRef(t)
  tRef.current = t
  const { paused } = useMotionPreference()
  const { discover, isFound } = useProgress()
  const progressRef = useRef({ discover, isFound })
  progressRef.current = { discover, isFound }
  const viewportRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<DialogHandle>(null)
  const pausedRef = useRef(paused)
  const activeRef = useRef(active)
  const [dialog, setDialog] = useState<{ pages: string[]; speaker?: string; choices?: DialogChoice[] } | null>(null)
  const dialogOpen = useRef(false)
  const [prompt, setPrompt] = useState<Prompt>(null)
  // null until the post box is first used, so the form is only loaded (and mounted) when wanted.
  const [letter, setLetter] = useState<boolean | null>(null)
  const promptKey = useRef('')
  const [scale, setScale] = useState(3)
  // base: the normal pixel scale; scale: base times the current zoom. camX/Y: where the camera eases to;
  // drawX/Y: the camera actually drawn this frame (art pixels).
  const view = useRef({ base: 3, scale: 3, camX: 0, camY: 0, drawX: 0, drawY: 0, focusX: 0, focusY: 0 })
  // Kept in a ref: the parent's callback changes on every navigation, and the render loop must not restart.
  const onEnterRef = useRef(onEnter)
  onEnterRef.current = onEnter
  /** Going in: the point pushed in on (art pixels) and where it is on screen, kept fixed while zooming. */
  const enterAnchor = useRef<{ wx: number; wy: number; sx: number; sy: number } | null>(null)

  const player = useRef({
    ...({ tile: { x: spawn.x, y: spawn.y }, from: null, to: null, t: 0 } as Mover),
    dir: spawn.dir,
    steps: 0,
    path: [] as Point[],
    pending: null as { target: Target; face: Direction } | null,
    held: null as Direction | null,
    /** A held key only starts walking after this time (a short tap just turns). */
    holdUntil: 0,
    entering: 0,
    /** In Byte's boat, on the pond. */
    riding: false,
    /** This step is a jump into or out of the boat. */
    hop: false
  })
  const robot = useRef<Mover & { dir: Direction; next: number; ms: number }>({
    tile: { ...ROBOT_HOME },
    from: null,
    to: null,
    t: 0,
    dir: 'down',
    // First stroll after a few seconds, so Byte is where you first see him.
    next: 4000,
    ms: BYTE_WANDER_MS
  })
  const ride = useRef({
    phase: 'idle' as RidePhase,
    /** When the current phase began (for the robot-boat change). */
    at: 0,
    form: 'robot' as 'robot' | 'boat',
    /** The water tile in front of you, where the boat picks you up. */
    dock: { x: 0, y: 0 },
    /** Which way the boat points: it turns with you, or with Byte when he sails on his own. */
    heading: 'left' as Direction,
    /** Byte explains the steering once per visit. */
    told: false
  })

  // The first look at the town starts zoomed in on you, then pulls back (doors have their own timeline).
  // -2: hold zoomed in (the welcome card is up); -1: start on the next frame; 0: done; else the start time.
  const arrival = useRef(intro ? -2 : -1)

  // Pip naps in the garden until you make friends, then follows you around.
  const pip = useRef(createCompanion(PIP_HOME, true))

  pausedRef.current = paused
  const spawnRef = useRef(spawn)
  spawnRef.current = spawn
  activeRef.current = active
  dialogOpen.current = Boolean(dialog)
  // While the welcome card is up the town is only a backdrop: no walking, talking or doors behind it.
  const introRef = useRef(intro)
  introRef.current = intro

  // A speech box belongs to the moment: leaving town (door, hotbar) or switching language closes it, so you
  // never come back to a stale line in the old language with the player stuck in the doorway.
  useEffect(() => {
    if (!active) setDialog(null)
  }, [active])
  useEffect(() => setDialog(null), [locale])

  // Place the player when the town (re)opens: at the spawn point, or on the doorstep of the building just left.
  useEffect(() => {
    const p = player.current
    // Coming out of a building: start in its doorway and step out onto the doorstep as the iris opens.
    const fromDoor = spawn.key !== 'start' && !pausedRef.current
    p.tile = fromDoor ? { x: spawn.x, y: spawn.y - 1 } : { x: spawn.x, y: spawn.y }
    p.from = null
    p.to = null
    p.dir = spawn.dir
    p.path = fromDoor ? [{ x: spawn.x, y: spawn.y }] : []
    p.pending = null
    p.entering = 0
    p.held = null
    // Travelled away mid-ride (quick travel bar or keys): Byte is back home on his feet when you return.
    p.riding = false
    p.hop = false
    if (ride.current.phase !== 'idle') {
      ride.current.phase = 'idle'
      ride.current.form = 'robot'
      Object.assign(robot.current, { tile: { ...ROBOT_HOME }, from: null, to: null, dir: 'down' })
    }
    if (progressRef.current.isFound('npc:pip')) {
      pip.current.asleep = false
      // Beside the doorstep, not on it: that is where you step out to.
      placeNear(pip.current, { x: spawn.x, y: spawn.y }, (x, y) => isWalkable(x, y))
    }
  }, [spawn.key, spawn.x, spawn.y, spawn.dir])

  useEffect(() => {
    if (intro) arrival.current = -2
    else if (arrival.current === -2) arrival.current = -1
  }, [intro])

  // Clicking the map focuses it by pointer: no focus ring for that (only for Tab).
  useEffect(() => {
    const viewport = viewportRef.current
    return viewport ? quietOnPointer(viewport) : undefined
  }, [])

  // While the town is on screen, it tells the door transition where you are.
  useEffect(() => {
    if (!active) return
    return trackFocus(() => {
      const rect = viewportRef.current?.getBoundingClientRect()
      return rect ? { x: rect.left + view.current.focusX, y: rect.top + view.current.focusY } : null
    })
  }, [active])

  const robotTile = useCallback(() => robot.current.to ?? robot.current.tile, [])
  /** Things you cannot walk through: Byte, and Pip while napping (a following Pip steps aside). */
  const blockers = useCallback(() => [robotTile(), ...(pip.current.asleep ? [pip.current.tile] : [])], [robotTile])

  const targetAt = useCallback((x: number, y: number): Target | null => {
    if (isMailbox(x, y)) return { kind: 'mailbox' }
    const building = buildingAt(x, y)
    if (building && building.door.x === x && building.door.y === y) return { kind: 'door', id: building.id }
    const sign = signAt(x, y)
    if (sign) return { kind: 'sign', id: sign.target }
    const idle = ride.current.phase === 'idle'
    const r = robot.current.to ?? robot.current.tile
    if (idle && r.x === x && r.y === y) return { kind: 'robot' }
    if (isAt(pip.current, x, y)) return { kind: 'pip' }
    if (idle && isWater(x, y)) return { kind: 'water' }
    return null
  }, [])

  const screenPointOf = useCallback((tile: Point): Point => {
    const rect = viewportRef.current?.getBoundingClientRect()
    const { scale: s, drawX, drawY } = view.current
    return {
      x: (rect?.left ?? 0) + (tile.x * TILE + 8 - drawX) * s,
      y: (rect?.top ?? 0) + (tile.y * TILE + 8 - drawY) * s
    }
  }, [])

  const enter = useCallback(
    (id: BuildingId) => {
      const p = player.current
      // Still arriving through a door: the next one opens once the transition has finished.
      if (p.entering || doorBusy()) return
      p.entering = performance.now()
      const door = BUILDINGS.find((b) => b.id === id)!.door
      const { scale: s, drawX, drawY } = view.current
      const wx = door.x * TILE + 8
      const wy = door.y * TILE + 8
      enterAnchor.current = { wx, wy, sx: (wx - drawX) * s, sy: (wy - drawY) * s }
      onEnterRef.current(id, screenPointOf(door))
    },
    [screenPointOf]
  )

  /** Byte turns round to look at you when you talk to him. */
  const faceThePlayer = () => {
    const r = robot.current
    if (r.from) return
    const p = player.current
    const dx = p.tile.x - r.tile.x
    const dy = p.tile.y - r.tile.y
    r.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy < 0 ? 'up' : 'down'
  }

  const closeDialog = useCallback(() => {
    setDialog(null)
    quietFocus(viewportRef.current)
  }, [])

  /** Yes to the pond: Byte comes over to the water in front of you. */
  const setSail = useCallback(() => {
    closeDialog()
    const p = player.current
    const dock = { x: p.tile.x + DIRS[p.dir].x, y: p.tile.y + DIRS[p.dir].y }
    if (ride.current.phase !== 'idle' || p.from || !isWater(dock.x, dock.y)) return
    p.path = []
    p.pending = null
    p.held = null
    Object.assign(ride.current, { phase: 'coming', at: performance.now(), dock, form: 'robot' })
  }, [closeDialog])

  /** Sailed into the shore: jump onto it, and Byte (still a boat) is left in the water behind you. */
  const hopOff = useCallback((land: Point) => {
    const p = player.current
    const r = robot.current
    p.riding = false
    p.hop = true
    p.dir = directionTo(p.tile, land)
    p.from = { ...p.tile }
    p.to = { ...land }
    p.t = 0
    Object.assign(r, { tile: { ...p.tile }, from: null, to: null })
    ride.current.phase = 'drifting'
    // Pip waited on the shore: he walks round to you.
    walkBack(pip.current)
  }, [])

  /** One boat step: onto open water, or off onto free land. False when the way is blocked. */
  const sailStep = useCallback(
    (next: Point) => {
      const p = player.current
      p.dir = directionTo(p.tile, next)
      if (isWater(next.x, next.y)) {
        p.from = { ...p.tile }
        p.to = next
        p.t = 0
        return true
      }
      if (isWalkable(next.x, next.y, [...blockers(), pip.current.to ?? pip.current.tile])) {
        hopOff(next)
        return true
      }
      return false
    },
    [blockers, hopOff]
  )

  const interactWith = useCallback(
    (target: Target) => {
      if (target.kind === 'door') enter(target.id)
      else if (target.kind === 'mailbox') {
        setLetter(true)
        progressRef.current.discover('contact:letter')
      } else if (target.kind === 'water') {
        setDialog({
          pages: [...t.game.pond.ask],
          choices: [
            { label: t.game.pond.yes, onSelect: setSail },
            { label: t.game.pond.no, onSelect: closeDialog }
          ]
        })
      } else if (target.kind === 'sign') {
        setDialog({ pages: [t.game.signs[target.id]] })
        progressRef.current.discover(`sign:${target.id}`)
      } else if (target.kind === 'pip') {
        const c = pip.current
        if (c.asleep) {
          c.asleep = false
          setDialog({ pages: [...t.game.pip.meet], speaker: 'PIP' })
          progressRef.current.discover('npc:pip')
        } else setDialog({ pages: [nextLine(PIP_LINE_KEY, t.game.pip.pets)], speaker: 'PIP' })
        pet(c)
      } else if (!progressRef.current.isFound('npc:byte')) {
        faceThePlayer()
        setDialog({ pages: [...t.game.robot], speaker: 'BYTE' })
        progressRef.current.discover('npc:byte')
      } else {
        faceThePlayer()
        setDialog({ pages: [nextLine(BYTE_TIP_KEY, t.game.robotTips)], speaker: 'BYTE' })
      }
    },
    [enter, t, setSail, closeDialog]
  )

  const tryStep = useCallback(
    (dir: Direction) => {
      const p = player.current
      if (p.from || dialogOpen.current || p.entering || !activeRef.current || introRef.current) return
      if (WAITING.has(ride.current.phase)) return
      p.dir = dir
      const next = { x: p.tile.x + DIRS[dir].x, y: p.tile.y + DIRS[dir].y }
      if (p.riding) {
        sailStep(next)
        return
      }
      if (isWalkable(next.x, next.y, blockers())) {
        p.from = { ...p.tile }
        p.to = next
        p.t = 0
        return
      }
      // Walking up into a door opens it.
      const target = targetAt(next.x, next.y)
      if (target?.kind === 'door' && dir === 'up') enter(target.id)
    },
    [enter, targetAt, blockers, sailStep]
  )

  const interact = useCallback(() => {
    if (introRef.current) return
    if (dialogOpen.current) {
      dialogRef.current?.advance()
      return
    }
    const p = player.current
    const facing = { x: p.tile.x + DIRS[p.dir].x, y: p.tile.y + DIRS[p.dir].y }
    // In the boat, Enter facing the shore hops off.
    if (p.riding) {
      if (!p.from && !isWater(facing.x, facing.y)) sailStep(facing)
      return
    }
    const target = targetAt(facing.x, facing.y)
    if (target) interactWith(target)
  }, [interactWith, targetAt, sailStep])

  useEffect(() => {
    const viewport = viewportRef.current
    const canvas = canvasRef.current
    if (!viewport || !canvas) return

    const layers = [renderMapLayer(0), renderMapLayer(1)]
    const lights = staticLights()
    const lightCanvas = document.createElement('canvas')
    let ctx = setupPixelCanvas(canvas, viewport.clientWidth, viewport.clientHeight)
    let viewW = viewport.clientWidth
    let viewH = viewport.clientHeight

    const resize = () => {
      viewW = viewport.clientWidth
      viewH = viewport.clientHeight
      // Close up, so the town is much bigger than the screen (see gameScale; the rooms use the same scale).
      const s = gameScale(viewW, viewH)
      view.current.base = s
      view.current.scale = s
      ctx = setupPixelCanvas(canvas, viewW, viewH)
      lightCanvas.width = Math.ceil(viewW / s) + 2
      lightCanvas.height = Math.ceil(viewH / s) + 2
      setScale(s)
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(viewport)

    let raf = 0
    let last = performance.now()
    let clock = 0
    let running = true

    const advance = (m: Mover, dt: number, ms: number) => {
      if (!m.from || !m.to) return false
      m.t += dt / ms
      if (m.t >= 1) {
        m.tile = m.to
        m.from = null
        m.to = null
        return true
      }
      return false
    }
    const posOf = (m: Mover) =>
      m.from && m.to
        ? { x: (m.from.x + (m.to.x - m.from.x) * m.t) * TILE, y: (m.from.y + (m.to.y - m.from.y) * m.t) * TILE }
        : { x: m.tile.x * TILE, y: m.tile.y * TILE }

    const frame = (now: number) => {
      const dt = Math.max(0, Math.min(now - last, 50))
      last = now
      const still = pausedRef.current
      if (!still) clock += dt
      // Paused: everything rests on frame 0, the same as indoors.
      const anim = still ? 0 : Math.floor(clock / 520) % 2
      const p = player.current
      const r = robot.current

      // Player. In the dark and while the circle pops open you wait in the doorway, then step out.
      const inDoorway = door.phase === 'black' || (door.phase === 'open' && now - door.start < STEP_OUT_AT)
      const rd = ride.current
      if (!p.from && !dialogOpen.current && !p.entering && !inDoorway && !WAITING.has(rd.phase)) {
        const nextStep = p.path.shift()
        if (nextStep && p.riding) {
          // Sailing a tapped route: over the water, and off at the end if it ends on the shore.
          if (!sailStep(nextStep)) p.path = []
        } else if (nextStep) {
          p.dir = directionTo(p.tile, nextStep)
          if (isWalkable(nextStep.x, nextStep.y, blockers())) {
            p.from = { ...p.tile }
            p.to = nextStep
            p.t = 0
          } else {
            // Byte stepped into the way: find a new route to the same spot instead of stopping.
            const goal = p.path.length ? p.path[p.path.length - 1]! : nextStep
            const retry = findPath(p.tile, [goal], blockers())
            p.path = retry ?? []
            if (!retry) p.pending = null
          }
        } else if (p.pending) {
          const { target, face } = p.pending
          p.pending = null
          p.dir = face
          interactWith(target)
        } else if (p.held && now >= p.holdUntil) tryStep(p.held)
      }
      // A step that starts this frame (from the route above or a key press) leaves a tile for Pip.
      if (p.from && p.t === 0 && !p.riding && !p.hop) remember(pip.current, p.from)
      if (advance(p, dt, p.hop ? HOP_MS : p.riding ? SAIL_MS : STEP_MS)) {
        p.steps++
        p.hop = false
      }
      if (p.riding) rd.heading = p.dir

      if (pip.current.asleep && progressRef.current.isFound('npc:pip')) {
        pip.current.asleep = false
        placeNear(pip.current, p.tile, (x, y) => isWalkable(x, y))
      }
      // Pip does not swim: while you are out on the pond he waits on the shore.
      if (p.riding) updateCompanion(pip.current, pip.current.to ?? pip.current.tile, dt, () => false, STEP_MS)
      else
        updateCompanion(
          pip.current,
          p.to ?? p.tile,
          dt,
          (x, y) => isWalkable(x, y, [robotTile()]),
          STEP_MS,
          (from) => {
            // Walking back after the boat ride: the way round the pond to a free tile beside you.
            const you = p.to ?? p.tile
            const beside = around(you).filter((tile) => isWalkable(tile.x, tile.y, [robotTile()]))
            return findPath(from, beside, [you, robotTile()])?.[0] ?? null
          }
        )

      // Byte wanders around the plaza now and then. He stays put while you talk to him, while motion is
      // paused, and when you come close (so you can walk up and talk), and never steps onto your route.
      const near = Math.abs(p.tile.x - r.tile.x) + Math.abs(p.tile.y - r.tile.y) <= 3
      if (rd.phase === 'idle' && !r.from && !still && !dialogOpen.current && !near && !p.pending && clock > r.next) {
        r.next = clock + 2600 + Math.random() * 2600
        const options = (Object.values(DIRS) as Point[])
          .map((d) => ({ x: r.tile.x + d.x, y: r.tile.y + d.y }))
          .filter(
            (c) =>
              Math.abs(c.x - ROBOT_HOME.x) + Math.abs(c.y - ROBOT_HOME.y) <= 2 &&
              isWalkable(c.x, c.y, [p.tile, ...(p.to ? [p.to] : []), ...p.path, pip.current.tile])
          )
        const pick = options[Math.floor(Math.random() * options.length)]
        if (pick) {
          r.dir = directionTo(r.tile, pick)
          r.from = { ...r.tile }
          r.to = pick
          r.t = 0
          r.ms = BYTE_WANDER_MS
        }
      }

      // The boat ride: Byte's part of it (see RidePhase). With motion paused he changes form at once.
      const morphMs = still ? 0 : MORPH_MS
      const byteBlockers = () => [p.tile, ...(p.to ? [p.to] : []), pip.current.to ?? pip.current.tile]
      const moveByte = (next: Point, ms: number) => {
        rd.heading = directionTo(r.tile, next)
        r.dir = directionTo(r.tile, next)
        r.from = { ...r.tile }
        r.to = next
        r.t = 0
        r.ms = ms
      }
      if (!r.from && rd.phase !== 'idle') {
        if (rd.phase === 'coming') {
          // Run to the nearest bit of shore, then hop into the pond.
          const water = waterAround(r.tile).sort((a, b) => distance(a, rd.dock) - distance(b, rd.dock))[0]
          if (water) {
            moveByte(water, HOP_MS)
            rd.phase = 'hopIn'
          } else {
            const route = findPath(
              r.tile,
              SHORE.filter((tile) => !same(tile, p.tile)),
              byteBlockers()
            )
            if (route?.[0]) moveByte(route[0], BYTE_RUN_MS)
            // No way through (Pip in a narrow spot, say) for a good while: Byte gives up, you can walk again.
            else if (now - rd.at > 4000) rd.phase = 'idle'
          }
        } else if (rd.phase === 'hopIn') {
          rd.phase = 'transform'
          rd.at = now
        } else if (rd.phase === 'transform') {
          if (now - rd.at >= morphMs) {
            rd.form = 'boat'
            rd.phase = 'sailOver'
          }
        } else if (rd.phase === 'sailOver') {
          if (same(r.tile, rd.dock)) {
            // Alongside: jump in.
            rd.phase = 'boarding'
            p.hop = true
            p.dir = directionTo(p.tile, rd.dock)
            p.from = { ...p.tile }
            p.to = { ...rd.dock }
            p.t = 0
          } else {
            const route = findRoute(r.tile, [rd.dock], isWater)
            if (route?.[0]) moveByte(route[0], SAIL_MS)
          }
        } else if (rd.phase === 'boarding') {
          if (!p.from) {
            p.riding = true
            rd.phase = 'sailing'
            if (!rd.told) {
              rd.told = true
              setDialog({ pages: [...tRef.current.game.pond.aboard], speaker: 'BYTE' })
            }
          }
        } else if (rd.phase === 'sailing') {
          // Byte is the boat under you.
          r.tile = { ...(p.to ?? p.tile) }
        } else if (rd.phase === 'drifting') {
          // Left behind at the shore: find a spot with room for Byte to climb out (you may be standing in his).
          const roomAt = (tile: Point) => around(tile).some((land) => isWalkable(land.x, land.y, byteBlockers()))
          if (roomAt(r.tile)) {
            rd.phase = 'untransform'
            rd.at = now
          } else {
            const spots = SHORE.filter((tile) => isWalkable(tile.x, tile.y, byteBlockers())).flatMap(waterAround)
            const route = findRoute(r.tile, spots, isWater)
            if (route?.[0]) moveByte(route[0], SAIL_MS)
          }
        } else if (rd.phase === 'untransform') {
          if (now - rd.at >= morphMs) {
            rd.form = 'robot'
            const land = around(r.tile)
              .filter((tile) => isWalkable(tile.x, tile.y, byteBlockers()))
              .sort((a, b) => distance(a, ROBOT_HOME) - distance(b, ROBOT_HOME))[0]
            if (land) {
              moveByte(land, HOP_MS)
              rd.phase = 'hopOut'
            }
          }
        } else if (rd.phase === 'hopOut') rd.phase = 'home'
        else if (rd.phase === 'home') {
          const route = same(r.tile, ROBOT_HOME) ? null : findPath(r.tile, [ROBOT_HOME], [...byteBlockers(), ...p.path])
          if (route?.[0]) moveByte(route[0], BYTE_WALK_MS)
          // Home (or near enough, when you are standing on his spot): back to his strolls round the plaza.
          else if (distance(r.tile, ROBOT_HOME) <= 2) {
            rd.phase = 'idle'
            r.dir = 'down'
            r.next = clock + 3000
          }
        }
      }
      advance(r, dt, r.ms)

      const pp = posOf(p)
      // In the boat, Byte is wherever you are.
      const rp = p.riding ? pp : posOf(r)
      const morphing = rd.phase === 'transform' || rd.phase === 'untransform'
      const morphK = morphing && morphMs ? Math.min(1, (now - rd.at) / morphMs) : 1
      /**
       * Byte as a boat on the tile at (x, y), pointing `heading`, with `hero` sitting in it or empty. Side on, the
       * hero sits behind the bow; heading up or down, the near rim of the hull is drawn over his lap.
       */
      const drawBoat = (x: number, y: number, heading: Direction, bob: number, moving: boolean, hero?: HTMLCanvasElement) => {
        const lap = anim ? 1 : 0
        const seat = (hx: number) => {
          if (hero) ctx.drawImage(hero, 0, 0, hero.width, SEAT_ROWS, hx, y - 3 + bob, hero.width, SEAT_ROWS)
        }
        ctx.fillStyle = '#6fb0d4'
        if (heading === 'left' || heading === 'right') {
          // Ripples lapping at both ends of the hull, and a little wake behind it when under way.
          ctx.fillRect(x - 1 - lap, y + 14, 2, 1)
          ctx.fillRect(x + 15 + lap, y + 14, 2, 1)
          if (moving) {
            const stern = heading === 'left' ? x + 17 : x - 4
            ctx.fillRect(stern, y + 12, 3, 1)
            ctx.fillRect(heading === 'left' ? stern + 2 : stern - 2, y + 15, 3, 1)
          }
          ctx.drawImage(spriteCanvas(BOAT, BOAT_PALETTE, heading === 'right'), x, y + 6 + bob)
          seat(heading === 'left' ? x + 5 : x - 1)
          return
        }
        // End on: ripples along both sides, and the wake spreading out behind the stern.
        const up = heading === 'up'
        ctx.fillRect(x - 1 - lap, y + 12, 2, 1)
        ctx.fillRect(x + 15 + lap, y + 12, 2, 1)
        if (moving) {
          const wake = up ? y + 14 : y - 1
          const spread = up ? 2 : -2
          ctx.fillRect(x + 4, wake, 3, 1)
          ctx.fillRect(x + 9, wake, 3, 1)
          ctx.fillRect(x + 2, wake + spread, 2, 1)
          ctx.fillRect(x + 12, wake + spread, 2, 1)
        }
        const boat = spriteCanvas(up ? BOAT_UP : BOAT_DOWN, BOAT_PALETTE)
        const front = up ? BOAT_UP_FRONT : BOAT_DOWN_FRONT
        const top = y + bob - (up ? 5 : 0)
        ctx.drawImage(boat, x, top)
        if (!hero) return
        seat(x + 2)
        ctx.drawImage(boat, 0, front, boat.width, boat.height - front, x, top + front, boat.width, boat.height - front)
      }

      // Camera: locked on the player, who stays in the middle of the screen while the world scrolls (past
      // the edge of town, the forest fills the view).
      const s0 = view.current.base
      const dpr = ctx.getTransform().a
      /** Top-left of a view at scale `sc` centred on (fx, fy). */
      const cameraFor = (fx: number, fy: number, sc: number) => ({ x: fx - viewW / sc / 2, y: fy - viewH / sc / 2 })
      const normal = cameraFor(pp.x + 8, pp.y + 8, s0)
      view.current.camX = normal.x
      view.current.camY = normal.y
      let zoom = 1
      let viewX = view.current.camX
      let viewY = view.current.camY

      // The door transition (transition.ts) and the first look at the town drive the zoom, on their clock.
      const doorT = now - door.start
      if (still || door.phase !== 'idle') {
        if (arrival.current === -1) arrival.current = 0
      }
      if (still) {
        enterAnchor.current = null
      } else if (door.phase === 'close') {
        // Going in: push in on the door you walked into (or on you, travelling by the bar). That point stays
        // put on screen, exactly where the iris tightens.
        if (!enterAnchor.current) {
          const wx = pp.x + 8
          const wy = pp.y + 6
          enterAnchor.current = { wx, wy, sx: (wx - view.current.drawX) * s0, sy: (wy - view.current.drawY) * s0 }
        }
        const anchor = enterAnchor.current
        zoom = 1 + (CLOSE_ZOOM - 1) * closeZoomProgress(doorT)
        viewX = anchor.wx - anchor.sx / (s0 * zoom)
        viewY = anchor.wy - anchor.sy / (s0 * zoom)
      } else {
        // (A door you just walked into keeps its anchor until the close begins.)
        if (!p.entering) enterAnchor.current = null
        // Coming out (or the first look at the town): start close on you at the doorstep, so the house
        // fills the screen, then pull back to the town while the iris opens up around you.
        let k = 1
        if (door.phase === 'black') k = 0
        else if (door.phase === 'open') k = openPullProgress(doorT)
        else if (arrival.current === -2 || arrival.current === -1) k = 0
        else if (arrival.current > 0) k = easeInOut(Math.min(1, Math.max(0, (now - arrival.current - INTRO_HOLD_MS) / INTRO_PULL_MS)))
        if (arrival.current === -1 && activeRef.current && viewW > 0) arrival.current = now
        if (arrival.current > 0 && k >= 1) arrival.current = 0
        if (k < 1) {
          const doorOpen = door.phase === 'black' || door.phase === 'open'
          const fx = doorOpen ? spawnRef.current.x * TILE + 8 : pp.x + 8
          const fy = doorOpen ? spawnRef.current.y * TILE + 2 : pp.y + 2
          const close = s0 * OPEN_ZOOM
          const near = cameraFor(fx, fy, close)
          zoom = OPEN_ZOOM + (1 - OPEN_ZOOM) * k
          const sc = s0 * zoom
          // Glide the view's centre from the close-up to the normal view while zooming out.
          const cx = near.x + viewW / close / 2 + (normal.x + viewW / s0 / 2 - near.x - viewW / close / 2) * k
          const cy = near.y + viewH / close / 2 + (normal.y + viewH / s0 / 2 - near.y - viewH / close / 2) * k
          viewX = cx - viewW / sc / 2
          viewY = cy - viewH / sc / 2
        }
      }
      const s = s0 * zoom
      // Snap to whole device pixels so the art stays crisp while the camera glides.
      const camX = Math.round(viewX * s * dpr) / (s * dpr)
      const camY = Math.round(viewY * s * dpr) / (s * dpr)
      view.current.scale = s
      view.current.drawX = camX
      view.current.drawY = camY
      // Where you are on screen, for the iris to follow.
      const holdDoorstep = door.phase === 'black' || door.phase === 'open'
      view.current.focusX = ((holdDoorstep ? spawnRef.current.x * TILE : pp.x) + 8 - camX) * s
      view.current.focusY = ((holdDoorstep ? spawnRef.current.y * TILE : pp.y) + 6 - camY) * s

      // Prompt for the HUD: what Enter would do right now.
      const facing = { x: p.tile.x + DIRS[p.dir].x, y: p.tile.y + DIRS[p.dir].y }
      const target = !p.from && !dialogOpen.current && rd.phase === 'idle' ? targetAt(facing.x, facing.y) : null
      const key = target ? `${target.kind}:${'id' in target ? target.id : ''}` : ''
      if (key !== promptKey.current) {
        promptKey.current = key
        setPrompt(target ? { kind: target.kind, id: 'id' in target ? target.id : undefined } : null)
      }

      // World.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = '#163a2c'
      ctx.fillRect(0, 0, viewW, viewH)
      ctx.save()
      ctx.scale(s, s)
      ctx.translate(-camX, -camY)
      ctx.drawImage(layers[anim]!, -FOREST * TILE, -FOREST * TILE)
      drawTrees(ctx, clock, still, { x: camX, y: camY, w: viewW / s, h: viewH / s })

      type Entity = { y: number; draw: () => void }
      const entities: Entity[] = []
      const sign = spriteCanvas(SIGN, SIGN_PALETTE)
      for (const sg of SIGNS) entities.push({ y: sg.y * TILE, draw: () => ctx.drawImage(sign, sg.x * TILE + 2, sg.y * TILE + 3) })
      for (const lamp of LAMPS) entities.push({ y: lamp.y * TILE, draw: () => drawLamp(ctx, lamp) })
      // The roof's back row (walkable) and the chimney, bell tower and antenna above it are redrawn over anyone
      // standing there, so you pass behind the roof instead of bumping into it.
      for (const b of BUILDINGS)
        entities.push({
          y: (b.y + 1) * TILE,
          draw: () => {
            const sx = (b.x + FOREST) * TILE
            const sy = (b.y + FOREST) * TILE
            ctx.drawImage(layers[anim]!, sx, sy, b.w * TILE, TILE, b.x * TILE, b.y * TILE, b.w * TILE, TILE)
            drawBuildingTop(ctx, b, anim)
          }
        })
      entities.push({ y: FOUNTAIN.y * TILE, draw: () => drawFountainTop(ctx, anim) })
      // In the boat Byte is drawn with you (below); otherwise on his own, on land or in the pond.
      if (!p.riding)
        entities.push({
          y: rp.y,
          draw: () => {
            const bob = anim && !still ? 1 : 0
            const x = Math.round(rp.x)
            const hopping = Boolean(r.from) && (rd.phase === 'hopIn' || rd.phase === 'hopOut') && !still
            const y = Math.round(rp.y) - (hopping ? Math.round(Math.sin(Math.PI * r.t) * 7) : 0)
            // Changing form: he flicks between robot and boat, ending on the new one.
            const flick = morphing && Math.floor(morphK * 6) % 2 === 1
            if ((rd.form === 'boat') !== flick) {
              drawBoat(x, y, rd.heading, bob, Boolean(r.from))
              return
            }
            const wading = !r.from && isWater(r.tile.x, r.tile.y)
            if (!wading && !hopping) {
              ctx.fillStyle = 'rgb(6 20 24 / 0.35)'
              ctx.fillRect(x + 3, y + 14, 10, 2)
            }
            // Byte faces the way he walks (and turns to you when you talk to him).
            const rows = r.dir === 'up' ? ROBOT_BACK : r.dir === 'left' || r.dir === 'right' ? ROBOT_SIDE : ROBOT
            ctx.drawImage(spriteCanvas(rows, ROBOT_PALETTE, r.dir === 'right'), x + 2, y + 1 + bob)
            if (wading) {
              // Knee-deep in the pond.
              ctx.fillStyle = '#2c6c97'
              ctx.fillRect(x + 2, y + 12, 12, 4)
              ctx.fillStyle = '#6fb0d4'
              ctx.fillRect(x + 1 + (anim ? 1 : 0), y + 12, 13, 1)
            }
          }
        })
      // Chimney smoke curling up from Timo's house.
      if (!still) {
        const top = chimneyTop()
        entities.push({
          // In front of anyone standing behind the house, like the chimney it rises from.
          y: top.y + 7,
          draw: () => {
            for (let k = 0; k < 4; k++) {
              const phase = (clock / 3200 + k / 4) % 1
              const sx = Math.round(top.x + Math.sin(phase * 6 + k) * 2 + phase * 6)
              const sy = Math.round(top.y - phase * 26)
              const size = 2 + Math.round(phase * 3)
              ctx.globalAlpha = 0.5 * (1 - phase)
              ctx.fillStyle = '#c8d4d8'
              ctx.fillRect(sx, sy, size, size)
              ctx.globalAlpha = 1
            }
          }
        })
      }
      const pipAt = companionPosition(pip.current)
      entities.push({
        y: pipAt.y + 0.3,
        draw: () => {
          // Pip goes in with you, so he fades through the door with you too.
          ctx.globalAlpha = p.entering ? 1 - Math.min(1, (now - p.entering) / 300) : 1
          drawCompanion(ctx, pip.current, clock, still)
          ctx.globalAlpha = 1
        }
      })
      entities.push({
        y: pp.y + 0.5,
        draw: () => {
          if (p.riding) {
            // Sitting in Byte: the boat, then the top of the hero above its rim.
            const x = Math.round(pp.x)
            const bob = anim && !still ? 1 : 0
            const frames = p.dir === 'right' ? HERO_FRAMES.left : HERO_FRAMES[p.dir]
            const hero = spriteCanvas(frames[0]!, HERO_PALETTE, p.dir === 'right')
            drawBoat(x, Math.round(pp.y), rd.heading, bob, Boolean(p.from), hero)
            return
          }
          const walking = Boolean(p.from)
          const stepFrame = walking && p.t < 0.5 ? (p.steps % 2 ? 1 : 3) : 0
          const frames = p.dir === 'right' ? HERO_FRAMES.left : HERO_FRAMES[p.dir]
          // Idle: an occasional blink. Walking: a one-pixel bob on each stride.
          const blink = !walking && p.dir === 'down' && !still && clock % 4200 < 130
          const rows = blink ? HERO_BLINK : (frames[stepFrame] ?? frames[0]!)
          const hero = spriteCanvas(rows, HERO_PALETTE, p.dir === 'right')
          // Jumping into or out of the boat: an arc over the gap.
          const bob = (stepFrame ? 1 : 0) + (p.hop && p.from && !still ? Math.round(Math.sin(Math.PI * p.t) * 8) : 0)
          const e = p.entering ? Math.min(1, (now - p.entering) / 300) : 0
          ctx.globalAlpha = 1 - e
          ctx.fillStyle = 'rgb(6 20 24 / 0.35)'
          ctx.fillRect(Math.round(pp.x) + 3, Math.round(pp.y) + 14, 10, 2)
          // Feet on the tile's bottom edge, however tall he is drawn.
          ctx.drawImage(hero, Math.round(pp.x) + 2, Math.round(pp.y) + 15 - rows.length - bob - Math.round(e * 6))
          ctx.globalAlpha = 1
        }
      })
      entities.sort((a, b) => a.y - b.y).forEach((entity) => entity.draw())

      // Night: a blue-green darkness layer with light cut out of it, then a warm glow on top (still in art space).
      const dynamic: Light[] = [{ x: rp.x + 8, y: rp.y + 6, r: 14, strength: 0.6, color: '120 200 255' }]
      if (morphing) dynamic.push({ x: rp.x + 8, y: rp.y + 8, r: 26, strength: 0.9 * Math.sin(Math.PI * morphK), color: '230 240 255' })
      applyLighting(ctx, lightCanvas, [...lights, ...dynamic], camX, camY, 'rgb(4 22 32 / 0.6)', s, (light) =>
        lampPulse(light, clock, still)
      )
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      // Fireflies.
      for (const fly of FIREFLIES) {
        const tt = clock / 1000
        const fx = Math.round(fly.x + Math.sin(tt * fly.speed + fly.phase) * 18)
        const fy = Math.round(fly.y + Math.cos(tt * fly.speed * 1.3 + fly.phase) * 10)
        const glow = 0.5 + 0.5 * Math.sin(tt * 3 + fly.phase)
        ctx.fillStyle = `rgb(220 255 140 / ${0.18 * glow})`
        ctx.fillRect(fx - 1, fy - 1, 3, 3)
        ctx.fillStyle = `rgb(240 255 190 / ${0.5 + 0.5 * glow})`
        ctx.fillRect(fx, fy, 1, 1)
      }
      ctx.restore()
      // Sparkles circling Byte while he changes form.
      if (morphing && morphK < 1) {
        const sparkle = spriteCanvas(SPARKLE, SPARKLE_PALETTE)
        ctx.globalAlpha = Math.sin(Math.PI * morphK)
        for (let i = 0; i < 4; i++) {
          const angle = morphK * Math.PI * 2 + (i * Math.PI) / 2
          ctx.drawImage(sparkle, Math.round(rp.x + 6 + Math.cos(angle) * 11), Math.round(rp.y + 6 + Math.sin(angle) * 7))
        }
        ctx.globalAlpha = 1
      }
      // A small "!" over your head when Enter would do something (door, sign, Byte). Drawn after the night layer
      // so it stays a clear, full-colour cue.
      if (target && !p.entering) {
        const bob = anim && !still ? 1 : 0
        ctx.drawImage(spriteCanvas(BUBBLE, BUBBLE_PALETTE), Math.round(pp.x) + 4, Math.round(pp.y) + 4 - HERO_HEIGHT - bob)
      }
      ctx.restore()

      const plates = overlayRef.current
      if (plates) {
        plates.style.transform = `translate(${-camX * s}px, ${-camY * s}px) scale(${zoom})`
        // The server renders the plates without a camera: show them only once they sit at this scale, so they
        // never jump into place (a layout shift) after hydrating.
        if (plates.style.visibility !== 'visible' && Number(plates.dataset.scale) === view.current.base) plates.style.visibility = 'visible'
      }

      if (running && activeRef.current) raf = requestAnimationFrame(frame)
    }

    const start = () => {
      cancelAnimationFrame(raf)
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }

    const io = new IntersectionObserver(([entry]) => {
      running = Boolean(entry?.isIntersecting)
      if (running && activeRef.current) start()
    })
    io.observe(viewport)
    start()

    const onVisibility = () => {
      if (document.visibilityState === 'visible' && running && activeRef.current) start()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [interactWith, tryStep, targetAt, active, blockers, robotTile, sailStep])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    const dir = KEY_TO_DIR[event.key]
    if (dir) {
      event.preventDefault()
      const p = player.current
      if (event.repeat && p.held === dir) return
      const standing = !p.from && !p.path.length
      p.path = []
      p.pending = null
      p.held = dir
      // A tap while standing still only turns you; keep holding (or tap again) to walk.
      if (standing && p.dir !== dir && !dialogOpen.current && !p.entering && !WAITING.has(ride.current.phase)) {
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
      interact()
      return
    }
    if (event.key === 'Escape' && dialog) {
      event.preventDefault()
      setDialog(null)
    }
  }

  const onKeyUp = (event: KeyboardEvent<HTMLDivElement>) => {
    const dir = KEY_TO_DIR[event.key]
    if (dir && player.current.held === dir) player.current.held = null
  }

  const onMapPointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (dialog || intro) return
    const rect = event.currentTarget.getBoundingClientRect()
    const { scale: s, drawX, drawY } = view.current
    const x = Math.floor(((event.clientX - rect.left) / s + drawX) / TILE)
    const y = Math.floor(((event.clientY - rect.top) / s + drawY) / TILE)
    const p = player.current
    const from = p.to ?? p.tile
    if (WAITING.has(ride.current.phase)) return

    // In the boat: tap the water to sail there, or a bit of shore to sail over and hop off onto it.
    if (p.riding) {
      if (isWater(x, y)) {
        p.path = findRoute(from, [{ x, y }], isWater) ?? []
      } else if (isWalkable(x, y, blockers()) && waterAround({ x, y }).length) {
        const route = findRoute(from, waterAround({ x, y }), isWater)
        if (route) p.path = [...route, { x, y }]
      }
      p.pending = null
      return
    }

    // Clicking any part of a building walks to its door and goes in (except the post box on its wall).
    const building = buildingAt(x, y)
    const target: Target | null = building && !isMailbox(x, y) ? { kind: 'door', id: building.id } : targetAt(x, y)
    if (target) {
      const goal = target.kind === 'door' ? BUILDINGS.find((b) => b.id === target.id)!.door : { x, y }
      const sides: (Point & { face: Direction })[] =
        target.kind === 'door'
          ? [{ x: goal.x, y: goal.y + 1, face: 'up' }]
          : [
              { x: goal.x, y: goal.y + 1, face: 'up' },
              { x: goal.x - 1, y: goal.y, face: 'right' },
              { x: goal.x + 1, y: goal.y, face: 'left' },
              { x: goal.x, y: goal.y - 1, face: 'down' }
            ]
      const reachable = sides.filter((side) => (side.x === from.x && side.y === from.y) || isWalkable(side.x, side.y, blockers()))
      const path = findPath(from, reachable, blockers())
      if (!path) return
      const end = path[path.length - 1] ?? from
      const face = reachable.find((side) => side.x === end.x && side.y === end.y)?.face ?? 'up'
      p.path = path
      p.pending = { target, face }
      return
    }
    if (!isWalkable(x, y, blockers())) return
    p.path = findPath(from, [{ x, y }], blockers()) ?? []
    p.pending = null
  }

  // Pointer over a building, sign or Byte: show that it can be clicked.
  const onMapPointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (event.pointerType !== 'mouse') return
    const rect = event.currentTarget.getBoundingClientRect()
    const { scale: s, drawX, drawY } = view.current
    const x = Math.floor(((event.clientX - rect.left) / s + drawX) / TILE)
    const y = Math.floor(((event.clientY - rect.top) / s + drawY) / TILE)
    const clickable = Boolean(buildingAt(x, y) || targetAt(x, y))
    event.currentTarget.style.cursor = clickable ? 'pointer' : 'default'
  }

  const promptLabel = (() => {
    if (!prompt) return null
    if (prompt.kind === 'door' && prompt.id) return `${t.game.prompt.enter}: ${t.nav[prompt.id]}`
    if (prompt.kind === 'sign') return t.game.prompt.read
    if (prompt.kind === 'mailbox') return t.game.write
    if (prompt.kind === 'pip') return t.game.prompt.pet
    if (prompt.kind === 'water') return t.game.prompt.water
    return t.game.prompt.talk
  })()

  return (
    <div className="relative size-full">
      {/*
        role=application: arrow keys drive the game while it has focus; Tab still moves on (WCAG 2.1.2).
        jsx-a11y does not count `application` as interactive, but it is the right role for a focusable game.
      */}
      {/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
      <div
        ref={viewportRef}
        id="town"
        role="application"
        aria-label={t.game.mapLabel}
        aria-describedby="town-controls"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onBlur={() => (player.current.held = null)}
        className="relative size-full overflow-hidden bg-[#163a2c] focus-visible:outline-offset-[-6px]"
      >
        {/* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
        <canvas
          ref={canvasRef}
          aria-hidden
          className="pixelated absolute inset-0 touch-none"
          onPointerDown={onMapPointerDown}
          onPointerMove={onMapPointerMove}
        />

        {/* Name plates over the doors, in world space, moved with the camera. */}
        <div
          ref={overlayRef}
          aria-hidden
          data-scale={scale}
          className="pointer-events-none invisible absolute top-0 left-0 origin-top-left"
        >
          {BUILDINGS.map((b) => (
            <span
              key={b.id}
              className="pixel-drop absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: (b.x * TILE + (b.w * TILE) / 2) * scale, top: (b.y * TILE + roofHeight(b) / 2) * scale }}
            >
              <span className="panel flex flex-col items-center px-3 py-1.5 whitespace-nowrap">
                <span className="font-site-pixel text-sm font-semibold leading-tight text-ui-text">{t.nav[b.id]}</span>
                <span className="arcade text-[0.45rem] text-site-gold">{t.game.places[b.id]}</span>
              </span>
            </span>
          ))}
        </div>

        {dialog ? (
          <DialogBox
            ref={dialogRef}
            pages={dialog.pages}
            speaker={dialog.speaker}
            choices={dialog.choices}
            onClose={() => {
              setDialog(null)
              quietFocus(viewportRef.current)
            }}
            nextLabel={t.game.next}
            closeLabel={t.game.close}
            className="absolute inset-x-3 bottom-28 mx-auto max-w-2xl stage:bottom-32"
          />
        ) : null}

        {/* What Enter does right now, for screen reader players (sighted players see the "!" bubble). */}
        <p aria-live="polite" className="sr-only">
          {promptLabel && !dialog ? `Enter: ${promptLabel}` : ''}
        </p>
      </div>
      <p id="town-controls" className="sr-only">
        {t.game.controlsHint}
      </p>
      {letter !== null ? (
        <Suspense fallback={null}>
          <LetterDialog open={letter} onClose={() => setLetter(false)} />
        </Suspense>
      ) : null}
    </div>
  )
}

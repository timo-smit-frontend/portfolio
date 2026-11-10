import type { Point } from '~/game/world'

/**
 * Going through a door is one choreographed move, on one clock, shared by the iris overlay (GameShell),
 * the town camera (Town) and the rooms (Room):
 *
 *   close  the circle tightens onto the door while the camera pushes in, rests a beat on the door, shuts;
 *   black  a short breath while the next scene mounts;
 *   open   the circle pops open on you, rests a beat, then opens up as the camera pulls back.
 *
 * Every curve below is a function of the time since its phase started, so everything stays in step.
 */

export type DoorPhase = 'idle' | 'close' | 'black' | 'open'

export const door = {
  phase: 'idle' as DoorPhase,
  /** performance.now() when the current phase started. */
  start: 0,
  /** Where the next close should land (viewport pixels), e.g. the door you walked into. */
  origin: null as Point | null,
  /** The scene on screen tells where the player is (viewport pixels), for the iris to follow. */
  focus: null as (() => Point | null) | null
}

/** The door the player walked into: the next close lands there. */
export function closeOn(point: Point) {
  door.origin = point
}

/** A scene registers where the player is on screen; returns the cleanup for an effect. */
export function trackFocus(focus: () => Point | null) {
  door.focus = focus
  return () => {
    if (door.focus === focus) door.focus = null
  }
}

// Timeline (ms).
const SHRINK = 620
const REST_CLOSED = 160
const SHUT = 170
export const CLOSE_MS = SHRINK + REST_CLOSED + SHUT
export const BLACK_MS = 140
const POP = 220
const REST_OPEN = 280
const WIDEN = 1150
export const OPEN_MS = POP + REST_OPEN + WIDEN

/** Closing zoom of the town camera, and how close the arrival starts. */
export const CLOSE_ZOOM = 1.75
export const OPEN_ZOOM = 2.1

export const easeInOut = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2)
const easeOut = (k: number) => 1 - (1 - k) ** 3
const easeIn = (k: number) => k * k * k
const clamp01 = (k: number) => Math.min(1, Math.max(0, k))

/** Radius that frames the player and the door: about a building's doorway at the zoomed-in scale. */
export function smallRadius(width: number, height: number) {
  return Math.round(Math.min(150, Math.max(64, Math.min(width, height) * 0.15)))
}

/** Radius that clears the whole viewport from `at`. */
export function fullRadius(at: Point, width: number, height: number) {
  return Math.ceil(Math.hypot(Math.max(at.x, width - at.x), Math.max(at.y, height - at.y))) + 2
}

/** Iris radius while closing. */
export function closeRadius(t: number, full: number, small: number) {
  if (t < SHRINK) return full + (small - full) * easeInOut(t / SHRINK)
  if (t < SHRINK + REST_CLOSED) return small
  return small * (1 - easeIn(clamp01((t - SHRINK - REST_CLOSED) / SHUT)))
}

/** Iris radius while opening. */
export function openRadius(t: number, full: number, small: number) {
  if (t < POP) return small * easeOut(t / POP)
  if (t < POP + REST_OPEN) return small
  return small + (full - small) * easeInOut(clamp01((t - POP - REST_OPEN) / WIDEN))
}

/** Camera push-in while closing: 0 to 1, in step with the circle tightening (and a touch more at the end). */
export function closeZoomProgress(t: number) {
  return easeInOut(clamp01(t / (SHRINK + REST_CLOSED + SHUT)))
}

/** Camera pull-back while opening: 0 (close-up) until the circle starts to widen, then 1 with it. */
export function openPullProgress(t: number) {
  return easeInOut(clamp01((t - POP - REST_OPEN) / WIDEN))
}

/**
 * Whether the scene is shown well enough to watch something happen in it: no door going on, or the circle has
 * opened about halfway. Things that should be seen (Pip trotting off to his bed) wait for this.
 */
export function sceneRevealed(now = performance.now()) {
  if (door.phase === 'idle') return true
  if (door.phase !== 'open') return false
  return openPullProgress(now - door.start) >= 0.5
}

/** A door transition is still running: going through another door waits until it has finished. */
export function doorBusy() {
  return door.phase !== 'idle'
}

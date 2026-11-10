/** Night lighting shared by the town and the rooms: a dark layer with banded (pixel-style) light holes. */

/** `flame`: a lamp whose pool breathes gently (see `lampPulse`). */
export type Light = { x: number; y: number; r: number; strength?: number; color?: string; flame?: boolean }

/** Warm lamp light, shared by street lamps and indoor lamps. */
export const LAMP_COLOR = '255 214 140'

/**
 * One gentle, slow flicker for every lamp in the game (town and rooms), each on its own phase. Returns a
 * radius factor; 1 when motion is paused or the light is not a lamp.
 */
export function lampPulse(light: Light, clock: number, still: boolean) {
  if (!light.flame || still) return 1
  const phase = light.x * 0.37 + light.y * 0.11
  return 1 + 0.025 * Math.sin(clock / 700 + phase) + 0.01 * Math.sin(clock / 230 + phase * 2)
}

/** How many rings make up a light pool: enough for a soft falloff, few enough to keep the stepped pixel look. */
const BANDS = 8

/**
 * Cuts a light pool into the darkness layer (call with globalCompositeOperation 'destination-out'): rings at whole
 * art pixels whose combined cut follows a smoothstep, so the pool is bright in the middle and fades out softly
 * at the edge instead of ending in a few hard steps.
 */
export function drawLightHole(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, strength: number) {
  const ease = (t: number) => t * t * (3 - 2 * t)
  let before = 0
  for (let j = 1; j <= BANDS; j++) {
    const cut = 0.88 * strength * ease(j / BANDS)
    // destination-out compounds: this ring removes what is left to reach `cut` in total.
    ctx.globalAlpha = Math.min(1, Math.max(0, 1 - (1 - cut) / (1 - before)))
    before = cut
    const radius = Math.round(r * (1 - (j - 1) / BANDS))
    if (radius < 1) continue
    ctx.beginPath()
    ctx.arc(Math.round(x), Math.round(y), radius, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

/** Warm tint over a light pool, in the same stepped rings, plus a small bloom right at a lamp's flame. */
function drawGlow(ctx: CanvasRenderingContext2D, light: Light) {
  const x = Math.round(light.x)
  const y = Math.round(light.y)
  const rings = 4
  for (let i = 0; i < rings; i++) {
    ctx.fillStyle = `rgb(${light.color} / ${0.022 + i * 0.006})`
    ctx.beginPath()
    ctx.arc(x, y, Math.round(light.r * 0.85 * (1 - i / rings)), 0, Math.PI * 2)
    ctx.fill()
  }
  if (light.flame) {
    for (const [radius, alpha] of [
      [7, 0.08],
      [4, 0.1]
    ] as const) {
      ctx.fillStyle = `rgb(${light.color} / ${alpha})`
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

/**
 * Paints darkness with light holes into `layer` (art resolution) and composites it onto `ctx`, then adds a
 * faint coloured glow for lights that have a colour. `ctx` must be in art-pixel space with the camera applied.
 * The darkness layer is snapped to whole art pixels of the camera and offset by the fraction, so the banded light
 * pools stay locked to the world while the camera scrolls smoothly.
 */
export function applyLighting(
  ctx: CanvasRenderingContext2D,
  layer: HTMLCanvasElement,
  lights: Light[],
  camX: number,
  camY: number,
  darkness: string,
  scale: number,
  pulse: (light: Light) => number = () => 1
) {
  const lctx = layer.getContext('2d')!
  lctx.globalCompositeOperation = 'source-over'
  lctx.clearRect(0, 0, layer.width, layer.height)
  lctx.fillStyle = darkness
  lctx.fillRect(0, 0, layer.width, layer.height)
  lctx.globalCompositeOperation = 'destination-out'
  lctx.fillStyle = '#000'
  const cx = Math.floor(camX)
  const cy = Math.floor(camY)
  for (const light of lights) {
    const lx = light.x - cx
    const ly = light.y - cy
    if (lx < -light.r || ly < -light.r || lx > layer.width + light.r || ly > layer.height + light.r) continue
    drawLightHole(lctx, lx, ly, light.r * pulse(light), light.strength ?? 1)
  }

  // Composite in device space, then glow in art space.
  ctx.save()
  const base = ctx.getTransform()
  ctx.setTransform(base.a / scale, 0, 0, base.d / scale, 0, 0)
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(layer, (cx - camX) * scale, (cy - camY) * scale, layer.width * scale, layer.height * scale)
  ctx.restore()

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  for (const light of lights) if (light.color) drawGlow(ctx, { ...light, r: light.r * pulse(light) })
  ctx.restore()
}

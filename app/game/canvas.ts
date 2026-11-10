import type { Palette, SpriteRows } from '~/game/sprites'

const cache = new Map<string, HTMLCanvasElement>()

/** Rasterises string pixel art once (1 canvas pixel per art pixel) and caches it. */
export function spriteCanvas(rows: SpriteRows, palette: Palette, flip = false): HTMLCanvasElement {
  const key = `${flip ? 'f' : 'n'}|${rows.join('/')}|${Object.entries(palette).join(',')}`
  const cached = cache.get(key)
  if (cached) return cached

  const width = Math.max(...rows.map((row) => row.length))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = rows.length
  const ctx = canvas.getContext('2d')!
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const color = palette[row[x]!]
      if (!color) continue
      ctx.fillStyle = color
      ctx.fillRect(flip ? width - 1 - x : x, y, 1, 1)
    }
  })
  cache.set(key, canvas)
  return canvas
}

/** Sets up a canvas for crisp pixel art at the device pixel ratio. Returns the 2D context. */
export function setupPixelCanvas(canvas: HTMLCanvasElement, cssWidth: number, cssHeight: number) {
  const dpr = Math.max(1, Math.round(window.devicePixelRatio || 1))
  canvas.width = Math.round(cssWidth * dpr)
  canvas.height = Math.round(cssHeight * dpr)
  canvas.style.width = `${cssWidth}px`
  canvas.style.height = `${cssHeight}px`
  const ctx = canvas.getContext('2d')!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.imageSmoothingEnabled = false
  return ctx
}

/**
 * The game's pixel scale for a screen, the same in town and in every room, so the player is the same size
 * everywhere. Close up: at most about 12 by 18 tiles are in view, so there is something to explore. Rounded up
 * (never less zoomed in than that) to whole device pixels, so the art stays crisp; half steps on high-density
 * screens.
 */
export function gameScale(width: number, height: number) {
  const dpr = Math.max(1, Math.round(window.devicePixelRatio || 1))
  return Math.max(2, Math.min(8, Math.ceil(Math.min(height / 195, width / 285) * dpr) / dpr))
}

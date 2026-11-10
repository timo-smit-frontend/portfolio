import { cn } from '~/services/utils'

export const ARROW_ROTATION = { up: 0, right: 90, down: 180, left: 270 } as const

/** A pixel arrow: the arcade font has no arrow glyphs. */
export function PixelArrow({ dir, className }: { dir: keyof typeof ARROW_ROTATION; className?: string }) {
  return (
    <svg
      viewBox="0 0 7 7"
      aria-hidden
      className={cn('size-3.5 shrink-0', className)}
      shapeRendering="crispEdges"
      style={{ transform: `rotate(${ARROW_ROTATION[dir]}deg)` }}
    >
      <path d="M3 0h1v1h1v1h1v1h1v1H5v3H2V4H0V3h1V2h1V1h1z" fill="currentColor" />
    </svg>
  )
}

const CURSOR = {
  right: { viewBox: '0 0 4 7', d: 'M0 0h1v1h1v1h1v1h1v1H3v1H2v1H1v1H0z' },
  down: { viewBox: '0 0 7 4', d: 'M0 0h7v1H6v1H5v1H4v1H3V3H2V2H1V1H0z' }
} as const

/**
 * The ▶ / ▼ cursor of RPG menus as a pixel triangle. Not a text glyph: the arcade font has none, and the
 * fallback font's glyph sits off-centre next to the text. Size it with `className` (it has no size of its own).
 */
export function PixelCursor({ dir, className }: { dir: keyof typeof CURSOR; className: string }) {
  return (
    <svg viewBox={CURSOR[dir].viewBox} aria-hidden className={cn('shrink-0', className)} shapeRendering="crispEdges">
      <path d={CURSOR[dir].d} fill="currentColor" />
    </svg>
  )
}

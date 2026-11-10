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

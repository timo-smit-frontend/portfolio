import { memo, type SVGProps } from 'react'
import type { Palette, SpriteRows } from '~/game/sprites'

type Run = { x: number; y: number; w: number; color: string }

function toRuns(rows: SpriteRows, palette: Palette): Run[] {
  const runs: Run[] = []
  rows.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      const key = row[x]!
      const color = palette[key]
      if (!color) {
        x++
        continue
      }
      let w = 1
      while (row[x + w] === key) w++
      runs.push({ x, y, w, color })
      x += w
    }
  })
  return runs
}

/**
 * Renders string pixel art as a crisp SVG (works in the prerendered HTML, scales without blur).
 * Decorative by default; pass `title` for a meaningful sprite.
 */
const PixelSprite = memo(function PixelSprite({
  rows,
  palette,
  scale = 4,
  flip = false,
  title,
  className,
  ...props
}: {
  rows: SpriteRows
  palette: Palette
  scale?: number
  flip?: boolean
  title?: string
} & Omit<SVGProps<SVGSVGElement>, 'scale'>) {
  const width = Math.max(...rows.map((row) => row.length))
  const height = rows.length
  const runs = toRuns(rows, palette)

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width * scale}
      height={height * scale}
      shapeRendering="crispEdges"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      {...props}
    >
      <g transform={flip ? `translate(${width} 0) scale(-1 1)` : undefined}>
        {runs.map((run) => (
          <rect key={`${run.x}-${run.y}`} x={run.x} y={run.y} width={run.w} height={1} fill={run.color} />
        ))}
      </g>
    </svg>
  )
})

export default PixelSprite

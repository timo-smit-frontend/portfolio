import { Tooltip } from '~/components/elements/Tooltip'
import { useMotionPreference } from '~/components/motion/MotionPreference'
import { useLocale } from '~/i18n/useLocale'
import { cn } from '~/services/utils'

/**
 * One pause/play control for every moving part of the site: water, flowers, Byte, the typing traits and
 * the blinking cursors (WCAG 2.2.2). A toggle button: fixed name, aria-pressed carries the state.
 */
export default function MotionToggle({ className }: { className?: string }) {
  const { paused, toggle } = useMotionPreference()
  const { t } = useLocale()

  return (
    <Tooltip label={paused ? t.motion.play : t.motion.pause} hint={paused ? t.motion.playHint : t.motion.pauseHint}>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={paused}
        className={cn('tile inline-flex min-h-10 min-w-10 items-center justify-center', className)}
      >
        {paused ? (
          <svg viewBox="0 0 8 8" className="size-3" fill="currentColor" shapeRendering="crispEdges" aria-hidden>
            <path d="M1 0h2v1h1v1h1v1h1v2H5v1H4v1H3v1H1z" />
          </svg>
        ) : (
          <svg viewBox="0 0 8 8" className="size-3" fill="currentColor" shapeRendering="crispEdges" aria-hidden>
            <path d="M1 0h2v8H1zM5 0h2v8H5z" />
          </svg>
        )}
        <span className="sr-only">{t.motion.pause}</span>
      </button>
    </Tooltip>
  )
}

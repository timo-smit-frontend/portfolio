import { cn } from '~/services/utils'

/**
 * Pause/play control for auto-updating or moving content (WCAG 2.2.2).
 * The accessible name switches between the pause and play label; the icon shows the action.
 */
export default function MotionToggle({
  paused,
  onToggle,
  pauseLabel,
  playLabel,
  className
}: {
  paused: boolean
  onToggle: () => void
  pauseLabel: string
  playLabel: string
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-site-cream-fg/70 smooth hover:bg-site-cream-fg/10 hover:text-site-cream-fg',
        className
      )}
    >
      <span className="sr-only">{paused ? playLabel : pauseLabel}</span>
      {paused ? (
        <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
          <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l11.1-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
      )}
    </button>
  )
}

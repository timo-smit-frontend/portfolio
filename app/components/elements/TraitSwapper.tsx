import { useEffect, useState } from 'react'
import { useMediaQuery } from '~/components/elements/useMediaQuery'
import { messages } from '~/i18n/messages'
import { cn } from '~/services/utils'

/** The typing animation only runs from this width; keep in sync with the `min-[800px]:` classes below in GameShell. */
export const TRAIT_ANIMATION_QUERY = '(min-width: 800px)'

const TYPE_MS = 300
const ERASE_MS = 75
const HOLD_MS = 3000

type Phase = 'typing' | 'holding' | 'erasing'

/**
 * Types and erases the traits one by one on wide screens. The first render (server and hydration)
 * always shows the complete first trait without a visible cursor, so the prerendered hero text is
 * complete and hydration is deterministic. `paused` (user toggle or prefers-reduced-motion) shows the
 * full current word without the cursor (WCAG 2.2.2).
 */
const TraitSwapper = ({
  traits = messages.en.traits,
  paused = false,
  before
}: {
  traits?: readonly string[]
  paused?: boolean
  /** Text in front of the trait that depends on the whole word (the article: "a" / "an"). */
  before?: (trait: string) => string
}) => {
  // Server/hydration snapshot is `false`: render the static word first, animate after hydration.
  const isWide = useMediaQuery(TRAIT_ANIMATION_QUERY, false)
  const [index, setIndex] = useState(0)
  const [chars, setChars] = useState(() => traits[0]?.length ?? 0)
  const [phase, setPhase] = useState<Phase>('holding')
  const [smallScreenTrait, setSmallScreenTrait] = useState<string | null>(null)

  const word = traits[index] ?? ''
  const animating = isWide && !paused && traits.length > 1

  useEffect(() => {
    if (!animating) {
      // Paused or not animating: rest on the complete current word, resume from there.
      setChars(word.length)
      setPhase('holding')
      return
    }

    let delay: number
    let next: () => void

    if (phase === 'typing') {
      if (chars < word.length) {
        delay = TYPE_MS
        next = () => setChars(chars + 1)
      } else {
        delay = 0
        next = () => setPhase('holding')
      }
    } else if (phase === 'holding') {
      delay = HOLD_MS
      next = () => setPhase('erasing')
    } else if (chars > 0) {
      delay = ERASE_MS
      next = () => setChars(chars - 1)
    } else {
      delay = 0
      next = () => {
        setIndex((index + 1) % traits.length)
        setPhase('typing')
      }
    }

    const timeoutId = window.setTimeout(next, delay)
    return () => window.clearTimeout(timeoutId)
  }, [animating, phase, chars, index, word, traits.length])

  useEffect(() => {
    if (isWide) return
    setSmallScreenTrait(traits[Math.floor(Math.random() * traits.length)] ?? null)
  }, [isWide, traits])

  const displayedTrait = isWide ? (animating ? word.slice(0, chars) : word) : (smallScreenTrait ?? word)

  // The article follows the word being typed (not the half-typed letters), so it never flips mid-word.
  const fullTrait = isWide ? word : (smallScreenTrait ?? word)

  return (
    <>
      {before ? <span aria-hidden="true">{before(fullTrait)}</span> : null}
      <span className="text-site-gold" aria-hidden="true">
        {displayedTrait}
        {/* The cursor slot always takes space on wide screens, so toggling it never shifts the layout. */}
        <span className={cn('hidden min-[800px]:inline', !animating && 'invisible')}>_</span>
      </span>
    </>
  )
}

export default TraitSwapper

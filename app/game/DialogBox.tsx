import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type KeyboardEvent } from 'react'
import { useMotionPreference } from '~/components/motion/MotionPreference'
import { cn } from '~/services/utils'

export type DialogHandle = {
  /** A button: finish typing, else go to the next page, else close (or, at a question, go to its answers). */
  advance: () => void
}

/** Answers on the last page (a yes or no question). Escape closes the box, the same as `onClose`. */
export type DialogChoice = { label: string; onSelect: () => void }

/**
 * RPG text box that types its pages out. The full page is in the DOM for assistive tech from the start
 * (visually typed with a clip, announced once via the live region), so screen readers never hear letters.
 */
const DialogBox = forwardRef<
  DialogHandle,
  {
    pages: readonly string[]
    speaker?: string
    onClose: () => void
    nextLabel: string
    closeLabel: string
    className?: string
    choices?: readonly DialogChoice[]
  }
>(function DialogBox({ pages, speaker, onClose, nextLabel, closeLabel, className, choices }, ref) {
  const { paused } = useMotionPreference()
  const [page, setPage] = useState(0)
  const [chars, setChars] = useState(0)
  const text = pages[page] ?? ''
  const typing = !paused && chars < text.length
  const last = page >= pages.length - 1
  const asking = Boolean(choices?.length) && last && !typing
  const choiceRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    setPage(0)
  }, [pages])

  useEffect(() => {
    setChars(paused ? text.length : 0)
  }, [text, paused])

  useEffect(() => {
    if (!typing) return
    const id = window.setTimeout(() => setChars((count) => Math.min(text.length, count + 2)), 22)
    return () => window.clearTimeout(id)
  }, [typing, chars, text.length])

  // A question: once it is fully written out, the first answer takes focus, so Enter, Tab and the arrow keys
  // pick an answer (WCAG 2.4.3: the focus goes where the next thing to do is).
  useEffect(() => {
    if (asking) choiceRefs.current[0]?.focus()
  }, [asking])

  const advance = () => {
    if (typing) setChars(text.length)
    else if (!last) setPage(page + 1)
    else if (asking) choiceRefs.current[0]?.focus()
    else onClose()
  }

  const onChoiceKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const buttons = choiceRefs.current.filter((button): button is HTMLButtonElement => Boolean(button))
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement)
    const step = ({ ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 } as Record<string, number>)[event.key]
    if (step) {
      event.preventDefault()
      buttons[(index + step + buttons.length) % buttons.length]?.focus()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
    }
  }

  useImperativeHandle(ref, () => ({ advance }))

  return (
    <div data-speech-box className={cn('pixel-drop', className)}>
      <div className="panel-paper enter-window px-6 pt-5 pb-4 sm:px-8 sm:pt-6">
        {speaker ? <p className="arcade mb-2 text-[0.7rem] text-px-red">{speaker}</p> : null}
        <p className="relative min-h-[3.2em] font-site-pixel text-lg leading-[1.5] sm:text-xl" aria-live="polite">
          {/* Visible typed text; the complete sentence is read out once. */}
          <span aria-hidden>{text.slice(0, chars)}</span>
          <span aria-hidden className="invisible">
            {text.slice(chars)}
          </span>
          <span className="sr-only">{text}</span>
        </p>
        <div className="mt-2 flex items-center justify-end gap-2">
          <span className="arcade mr-auto text-[0.6rem] text-px-ink/70" aria-hidden>
            {page + 1}/{pages.length}
          </span>
          {asking ? (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- arrow keys between the answer buttons
            <div className="flex flex-wrap justify-end gap-1" onKeyDown={onChoiceKey}>
              {choices!.map((choice, index) => (
                <button
                  key={choice.label}
                  ref={(button) => {
                    choiceRefs.current[index] = button
                  }}
                  type="button"
                  onClick={choice.onSelect}
                  className="menu-row arcade w-auto text-[0.6rem] before:text-px-red"
                >
                  {choice.label}
                </button>
              ))}
            </div>
          ) : (
            <button type="button" onClick={advance} className="menu-row arcade w-auto text-[0.6rem] before:text-px-red">
              {last && !typing ? closeLabel : nextLabel}
              {!typing && !last ? (
                <span aria-hidden className="animate-px-bob inline-block text-px-red">
                  ▼
                </span>
              ) : null}
            </button>
          )}
        </div>
      </div>
    </div>
  )
})

export default DialogBox

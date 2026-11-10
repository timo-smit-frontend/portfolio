import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * A small game-styled label under a toolbar button, shown at once on hover and on keyboard focus (the native
 * `title` is slow and unstyled). It meets WCAG 1.4.13: Escape hides it without moving focus or the pointer,
 * the pointer can move onto it, and it stays until hover and focus are both gone. The button keeps its own
 * accessible name, so the label is hidden from assistive tech (it would only repeat that name).
 *
 * The label is placed under the nearest positioned ancestor (the toolbar panel), as wide as it, so every
 * button's label shows in the same spot. Its invisible top edge reaches up into the panel, so the pointer can
 * move from the button onto the label without it disappearing.
 */
export function Tooltip({ label, hint, lang, children }: { label: string; hint?: string; lang?: string; children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || el.dataset.dismissed !== undefined) return
      // A game dialog handles its own Escape.
      if (document.querySelector('dialog[open]')) return
      const shown = el.matches(':hover') || el.querySelector(':focus-visible')
      if (!shown) return
      // Only hide the label: Escape must not also leave the building.
      event.preventDefault()
      setDismissed(true)
    }
    // Shown again next time, once both the pointer and focus have left.
    const onPointerLeave = () => {
      if (!el.contains(document.activeElement)) setDismissed(false)
    }
    const onFocusOut = () => {
      if (!el.matches(':hover')) setDismissed(false)
    }
    document.addEventListener('keydown', onKey, true)
    el.addEventListener('pointerleave', onPointerLeave)
    el.addEventListener('focusout', onFocusOut)
    return () => {
      document.removeEventListener('keydown', onKey, true)
      el.removeEventListener('pointerleave', onPointerLeave)
      el.removeEventListener('focusout', onFocusOut)
    }
  }, [])

  return (
    <span ref={ref} className="tip inline-flex" data-dismissed={dismissed || undefined}>
      {children}
      <span aria-hidden className="tip-bubble absolute inset-x-0 top-[calc(100%-0.5rem)] z-50 pt-5">
        <span lang={lang} className="panel block px-3 py-2 text-left">
          <span className="block font-site-pixel text-sm leading-tight font-semibold text-ui-text">{label}</span>
          {hint ? <span className="mt-1 block text-xs leading-snug text-ui-muted">{hint}</span> : null}
        </span>
      </span>
    </span>
  )
}

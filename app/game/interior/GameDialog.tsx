import { useEffect, useId, useRef, type ReactNode } from 'react'
import { quietFocus } from '~/game/quietFocus'
import { useLocale } from '~/i18n/useLocale'

/**
 * The window that opens when you use something in a room, like an RPG item screen.
 *
 * Built on the native <dialog> with showModal(): the rest of the page becomes inert, focus stays inside,
 * Esc closes it and focus returns to whatever opened it (WCAG 2.1.2 / 2.4.3). Closed dialogs stay in the
 * prerendered HTML, so the content is still there for search engines and for the llms.txt pipeline.
 */
/** Who opened each open dialog, so a dialog opened from inside another can hand focus back to the same place. */
const openers = new WeakMap<HTMLDialogElement, { element: HTMLElement | null; quiet: boolean }>()

export default function GameDialog({
  open,
  onClose,
  eyebrow,
  title,
  children
}: {
  open: boolean
  onClose: () => void
  eyebrow: string
  title: string
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const { t } = useLocale()
  /** What had focus when the dialog opened, and whether that focus was the game's own (no ring). */
  const opener = useRef<{ element: HTMLElement | null; quiet: boolean } | null>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      const element = document.activeElement instanceof HTMLElement ? document.activeElement : null
      // Opened from inside another dialog: the new one may open while the old one is still up, with focus on
      // a button in it. Take over the old dialog's opener, so closing goes back to the room or the desk you
      // used, not to a button in a closed dialog.
      const host = element?.closest('dialog')
      const inherited = host && host !== dialog ? openers.get(host) : undefined
      opener.current = inherited ?? { element, quiet: element?.dataset.quietFocus !== undefined }
      openers.set(dialog, opener.current)
      dialog.showModal()
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  // Closing returns focus to what opened it (the room, a desk you used). If you were playing (no ring), keep
  // it that way; if you had tabbed there, the ring comes back as usual.
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    const restore = () => {
      const from = opener.current
      opener.current = null
      openers.delete(dialog)
      if (!from?.element?.isConnected) return
      if (from.quiet) quietFocus(from.element)
      else if (document.activeElement !== from.element) from.element.focus()
    }
    dialog.addEventListener('close', restore)
    return () => dialog.removeEventListener('close', restore)
  }, [])

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    const handleClose = () => onClose()
    // A click on the backdrop (the dialog element itself, outside the window) closes it; Esc is the keyboard way.
    const handleBackdrop = (event: MouseEvent) => {
      if (event.target === dialog) dialog.close()
    }
    dialog.addEventListener('close', handleClose)
    dialog.addEventListener('click', handleBackdrop)
    return () => {
      dialog.removeEventListener('close', handleClose)
      dialog.removeEventListener('click', handleBackdrop)
    }
  }, [onClose])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className="m-auto max-h-[calc(100dvh-1.5rem)] w-[min(50rem,calc(100%-1.5rem))] overflow-visible bg-transparent p-0 text-px-ink backdrop:bg-[#04141a]/70"
    >
      <div className="pixel-drop">
        <div className="panel-paper enter-window flex max-h-[calc(100dvh-1.5rem)] flex-col">
          <header className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 sm:px-9 sm:pt-8">
            <div className="min-w-0">
              <p className="arcade text-[0.6rem] text-px-red">{eyebrow}</p>
              <h2 id={titleId} className="heading mt-2 text-3xl sm:text-4xl">
                {title}
              </h2>
            </div>
            <form method="dialog" className="shrink-0">
              <button type="submit" className="tile arcade inline-flex min-h-11 items-center gap-2 px-3 text-[0.55rem] text-ui-text">
                {t.game.close}
                <span aria-hidden className="keycap h-5 text-[0.45rem]">
                  Esc
                </span>
              </button>
            </form>
          </header>
          <div className="scroll-panel min-h-0 flex-1 overflow-y-auto px-6 pb-8 sm:px-9">{children}</div>
        </div>
      </div>
    </dialog>
  )
}

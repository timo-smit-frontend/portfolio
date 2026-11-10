import { MouseEvent } from 'react'
import { useProgress } from '~/game/progress'
import { useLocale } from '~/i18n/useLocale'

const MAIN_ID = 'main'

export default function SkipToMainContent() {
  const { t } = useLocale()
  const { storyMode, toggleStoryMode } = useProgress()

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    const main = document.getElementById(MAIN_ID)
    if (!main) {
      return
    }

    event.preventDefault()
    main.focus({ preventScroll: true })
    main.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    })
  }

  return (
    <>
      <a href={`#${MAIN_ID}`} onClick={handleClick} className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100">
        {/* Button look on an inner span: the button utilities would otherwise override sr-only. */}
        <span className="button-gold">{t.skip}</span>
      </a>
      {/* Second skip link: read everything without playing (story mode), for screen reader and keyboard users. */}
      {!storyMode ? (
        <button
          type="button"
          onClick={() => {
            toggleStoryMode()
            document.getElementById(MAIN_ID)?.focus({ preventScroll: true })
          }}
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100"
        >
          <span className="button-gold">{t.game.quests.skipGame}</span>
        </button>
      ) : null}
    </>
  )
}

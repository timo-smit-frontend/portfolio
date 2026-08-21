import { MouseEvent } from 'react'
import { useLocale } from '~/i18n/useLocale'

const MAIN_ID = 'main'

export default function SkipToMainContent() {
  const { t } = useLocale()

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
    <a
      href={`#${MAIN_ID}`}
      onClick={handleClick}
      className="button-gold sr-only focus:not-sr-only focus:fixed focus:inset-auto focus:top-4 focus:left-4 focus:z-100 focus:w-auto focus:px-7! focus:py-3.5!"
    >
      {t.skip}
    </a>
  )
}

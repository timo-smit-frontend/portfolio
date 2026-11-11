import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import SkipToMainContent from '~/components/elements/SkipToMainContent'
import { useMediaQuery } from '~/components/elements/useMediaQuery'
import { homePath } from '~/components/layout/nav'
import EdgeOfMap from '~/game/EdgeOfMap'
import { PixelArrow } from '~/game/PixelArrow'
import PixelSprite from '~/game/PixelSprite'
import { PLACE_ICON, PLACE_PATH, PLACES } from '~/game/places'
import { ICON_PALETTE } from '~/game/sprites'
import { useLocale } from '~/i18n/useLocale'

const CONTROLS_ID = 'edge-controls'

/** The 404 page: you walked off the edge of the town map. */
export default function ErrorPage() {
  const { locale, t, localize } = useLocale()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const touch = useMediaQuery('(pointer: coarse)', false)
  // The page is prerendered once as /404; the address that was really asked for is only known in the browser.
  const [asked, setAsked] = useState<string | null>(null)
  useEffect(() => setAsked(decodeURI(pathname)), [pathname])

  const e = t.error
  const text = useMemo(
    () => ({
      label: e.sceneLabel,
      controlsId: CONTROLS_ID,
      sign: e.sign(asked ?? '/404'),
      bump: e.bump,
      pip: e.pip,
      pipName: e.pipName,
      signName: e.signName,
      next: t.game.next,
      close: t.game.close
    }),
    [e, asked, t.game.next, t.game.close]
  )

  return (
    <>
      <SkipToMainContent />
      <main
        id="main"
        tabIndex={-1}
        aria-labelledby="error-title"
        className="min-h-dvh bg-[radial-gradient(ellipse_at_50%_20%,#123a44_0%,#081d23_65%,#050f15_100%)] px-4 pt-safe-10 pb-safe-12 sm:px-6"
      >
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          <header className="enter-rise flex flex-col gap-3 text-center">
            <p className="eyebrow">404 · {e.eyebrow}</p>
            <h1 id="error-title" className="heading text-3xl text-ui-text sm:text-4xl">
              {e.title404}
              <span className="sr-only"> ({e.pageNotFound})</span>
            </h1>
            <p className="prose-panel mx-auto max-w-2xl">{e.lead}</p>
          </header>

          <div className="pixel-drop enter-window" style={{ ['--enter-delay' as string]: '0.1s' }}>
            <div className="panel p-2 sm:p-3">
              <EdgeOfMap text={text} onExit={() => navigate(homePath(locale))} />
            </div>
          </div>

          <p id={CONTROLS_ID} className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center text-sm text-ui-text/85">
            {touch ? null : (
              <span aria-hidden className="flex gap-1">
                {(['left', 'up', 'down', 'right'] as const).map((dir) => (
                  <kbd key={dir} className="keycap">
                    <PixelArrow dir={dir} className="size-2.5" />
                  </kbd>
                ))}
                <kbd className="keycap ml-1">Enter</kbd>
              </span>
            )}
            <span>{touch ? e.controlsTouch : e.controls}</span>
          </p>

          <section
            aria-labelledby="fast-travel-title"
            className="panel enter-rise flex flex-col gap-5 px-5 py-6 sm:px-8"
            style={{ ['--enter-delay' as string]: '0.2s' }}
          >
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex min-w-0 flex-col gap-1">
                <span className="eyebrow">{e.pathLabel}</span>
                <code className="font-site-pixel text-lg break-all text-ui-text">{asked ?? '…'}</code>
              </p>
              <Link to={homePath(locale)} className="button-gold shrink-0">
                <PixelArrow dir="left" className="size-3" />
                {t.game.backToTown}
              </Link>
            </div>

            <div className="h-0.5 bg-ui-line/60" aria-hidden />

            <div className="flex flex-col gap-3">
              <h2 id="fast-travel-title" className="eyebrow">
                {e.fastTravel}
              </h2>
              <p className="prose-panel text-base">{e.fastTravelHint}</p>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {PLACES.filter((place) => place !== 'town').map((place) => (
                  <li key={place}>
                    <Link to={localize(PLACE_PATH[place])} className="tile flex min-h-14 items-center gap-3 px-4 py-2">
                      <PixelSprite rows={PLACE_ICON[place]} palette={ICON_PALETTE} scale={2} />
                      <span className="font-site-pixel text-lg">{t.game.places[place]}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}

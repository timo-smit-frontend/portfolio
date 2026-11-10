import { Link } from 'react-router'
import Logo from '~/components/elements/Logo'
import MotionToggle from '~/components/elements/MotionToggle'
import { Tooltip } from '~/components/elements/Tooltip'
import LanguageSwitch from '~/components/layout/LanguageSwitch'
import PixelSprite from '~/game/PixelSprite'
import { PLACE_ICON, PLACE_PATH, PLACES, type PlaceId } from '~/game/places'
import { ARROW_ROTATION, PixelArrow } from '~/game/PixelArrow'
import { QuestJournal, StoryModeToggle } from '~/game/Quests'
import { ICON_PALETTE } from '~/game/sprites'
import { useLocale } from '~/i18n/useLocale'
import { SITE_NAME } from '~/seo/site'

/** Brand plate top-left, settings top-right. */
function KeyboardIcon() {
  return (
    <svg viewBox="0 0 12 8" aria-hidden className="h-3 w-[18px]" shapeRendering="crispEdges">
      <path
        d="M0 0h12v8H0zM1 1v6h10V1zM2 2h1v1H2zm2 0h1v1H4zm2 0h1v1H6zm2 0h1v1H8zM2 4h1v1H2zm2 0h1v1H4zm2 0h1v1H6zm2 0h1v1H8zM3 6h6v1H3z"
        fill="currentColor"
      />
    </svg>
  )
}

export function TopBar({ shortcuts, onToggleShortcuts }: { shortcuts: boolean; onToggleShortcuts: () => void }) {
  const { t, localize } = useLocale()

  return (
    // Small screens: logo and settings share one full-width bar (tighter still under 352px, so it fits a
    // 320px phone). From sm up they float as two panels.
    <header className="pointer-events-none absolute inset-x-0 top-0 z-40 px-safe-3 pt-safe-3 max-[352px]:px-safe-2 max-[352px]:pt-safe-2 sm:px-safe-4 sm:pt-safe-4 stage:fixed">
      <div className="max-sm:pixel-drop max-sm:pointer-events-auto">
        <div className="flex items-center justify-between gap-2 max-sm:panel max-sm:py-2 max-sm:pr-2 max-sm:pl-3 max-[352px]:pr-1.5 max-[352px]:pl-2 sm:items-start sm:gap-3">
          <Link to={localize(PLACE_PATH.town)} className="pointer-events-auto sm:pixel-drop">
            <span className="flex items-center gap-3 sm:panel sm:py-2 sm:pr-4 sm:pl-2.5">
              <span className="sr-only">{SITE_NAME}</span>
              <Logo className="h-9 w-auto text-site-gold max-[352px]:h-8" />
              <span aria-hidden className="hidden flex-col sm:flex">
                <span className="font-site-pixel text-base leading-tight font-semibold">Timo Smit</span>
                <span className="text-xs leading-tight text-ui-muted">{t.seo.jobTitle}</span>
              </span>
            </span>
          </Link>
          <div className="pointer-events-auto sm:pixel-drop">
            <div className="flex items-center gap-1.5 max-[352px]:gap-1 sm:panel sm:gap-2 sm:p-2">
              <QuestJournal />
              <StoryModeToggle />
              {/* Keyboard shortcut switch (WCAG 2.1.4): only useful with a keyboard, so hidden on small touch screens. */}
              <span className="hidden sm:inline-flex">
                <Tooltip label={t.game.quickTravel} hint={t.game.quickTravelHint}>
                  <button
                    type="button"
                    aria-pressed={shortcuts}
                    onClick={onToggleShortcuts}
                    className="tile inline-flex min-h-10 min-w-10 items-center justify-center"
                  >
                    <KeyboardIcon />
                    <span className="sr-only">{t.game.shortcuts}</span>
                  </button>
                </Tooltip>
              </span>
              <MotionToggle />
              <LanguageSwitch />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

/** The places bar, shown with quick travel on, like a game hotbar. Real links, with the 1 to 5 keys on each tile. */
export function Hotbar({ current }: { current: PlaceId }) {
  const { t, localize } = useLocale()
  const label = (place: PlaceId) => (place === 'town' ? t.nav.home : t.nav[place])

  return (
    <nav
      aria-label={t.game.placesNav}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-safe-2 pt-2 pb-safe-2 sm:px-safe-4 sm:pt-4 sm:pb-safe-4"
    >
      <div className="pixel-drop pointer-events-auto w-full sm:w-auto">
        <ul className="panel grid grid-cols-5 gap-1 p-1.5 sm:gap-1.5 sm:p-2">
          {PLACES.map((place, index) => {
            const isCurrent = place === current
            return (
              <li key={place}>
                <Link
                  to={localize(PLACE_PATH[place])}
                  aria-current={isCurrent ? 'page' : undefined}
                  className="tile-quiet relative flex h-full min-h-14 flex-col items-center justify-center gap-1 px-1 py-1.5 text-center sm:w-24 sm:px-2"
                >
                  <span aria-hidden className="keycap absolute top-1 left-1 hidden h-4 min-w-4 px-1 text-[0.45rem] stage:inline-flex">
                    {index + 1}
                  </span>
                  <PixelSprite rows={PLACE_ICON[place]} palette={ICON_PALETTE} scale={2} className="sm:hidden" />
                  <PixelSprite rows={PLACE_ICON[place]} palette={ICON_PALETTE} scale={3} className="hidden sm:block" />
                  <span className="font-site-pixel text-[0.7rem] leading-tight font-semibold sm:text-sm">{label(place)}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}

function ArrowKey({ dir }: { dir: keyof typeof ARROW_ROTATION }) {
  return (
    <span className="keycap w-6 px-0">
      <PixelArrow dir={dir} />
    </span>
  )
}

/** Controls reminder in the corner of the town (stage screens only; small screens tap to walk). */
export function KeysLegend({ shortcuts }: { shortcuts: boolean }) {
  const { t } = useLocale()

  return (
    <div aria-hidden className="pointer-events-none fixed bottom-4 left-4 z-30 hidden xl:block">
      <div className="pixel-drop">
        <div className="panel flex flex-col gap-2 px-4 py-3 text-sm">
          <span className="flex items-center gap-2">
            <span className="flex gap-1.5">
              {(['up', 'down', 'left', 'right'] as const).map((dir) => (
                <ArrowKey key={dir} dir={dir} />
              ))}
            </span>
            {t.game.keys.move}
          </span>
          <span className="flex items-center gap-2">
            <span className="keycap">Enter</span>
            {t.game.keys.interact}
          </span>
          {shortcuts ? (
            <span className="flex items-center gap-2">
              <span className="keycap">1–5</span>
              {t.game.keys.travel}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}

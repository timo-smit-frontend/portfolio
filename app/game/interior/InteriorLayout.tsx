import { useEffect, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router'
import PixelSprite from '~/game/PixelSprite'
import { PLACE_ICON, PLACE_PATH } from '~/game/places'
import { questProgress, QUESTS, useProgress, type QuestId } from '~/game/progress'
import { ICON_PALETTE } from '~/game/sprites'
import type { BuildingId } from '~/game/world'
import { useLocale } from '~/i18n/useLocale'

export const PLACE_TITLE_ID = 'place-title'
export const ROOM_HINT_ID = 'room-hint'

/** Back to the town square (the player appears on this building's doorstep). */
export function useLeave() {
  const navigate = useNavigate()
  const { localize } = useLocale()
  return () => navigate(localize(PLACE_PATH.town))
}

export type TrackedQuest = {
  id: QuestId
  /** `id` is the progress id (job:0, edu:ai...); `onOpen` shows its dialog. */
  items: { id: string; label: string; onOpen: () => void }[]
}

/** Opens the dialog named in the URL hash (#job-0, #story...), used by the quest journal to re-read things. */
export function useHashItem(open: (hash: string) => boolean) {
  const { hash, pathname } = useLocation()
  const navigate = useNavigate()
  useEffect(() => {
    if (!hash) return
    if (open(decodeURIComponent(hash.slice(1)))) navigate(pathname, { replace: true })
    // Only react to a new hash.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash])
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <svg viewBox="0 0 8 8" aria-hidden className="size-4 shrink-0" shapeRendering="crispEdges">
      <path d="M0 0h8v8H0zM1 1v6h6V1z" fill="currentColor" />
      {checked ? <path d="M2 4h1v1h1V4h1V3h1V2h1v1H6v1H5v1H4v1H3V5H2z" fill="#b0302a" /> : null}
    </svg>
  )
}

/** The quests that belong to this room, like an MMO quest tracker. */
function QuestTracker({ quests }: { quests: TrackedQuest[] }) {
  const { t } = useLocale()
  const { found, isOpen } = useProgress()

  return (
    <div className="flex flex-col gap-4">
      {quests.map((tracked) => {
        const quest = QUESTS.find((q) => q.id === tracked.id)!
        const { done, total, complete } = questProgress(quest, found)
        return (
          <section key={tracked.id} aria-labelledby={`quest-${tracked.id}`}>
            <h2
              id={`quest-${tracked.id}`}
              className="flex items-baseline justify-between gap-3 font-site-pixel text-base leading-tight font-semibold"
            >
              <span className="flex items-center gap-2">
                <Checkbox checked={complete} />
                {t.game.quests.list[tracked.id]}
              </span>
              <span className="arcade shrink-0 text-[0.55rem] text-px-red">
                {done}/{total}
              </span>
            </h2>
            {tracked.items.length > 1 || isOpen(tracked.items[0]!.id) ? (
              <ul className="mt-2 flex flex-col gap-0.5 pl-6">
                {tracked.items.map((item) => {
                  const itemFound = found.has(item.id)
                  return (
                    <li key={item.id} className="flex items-center gap-2 text-sm">
                      <span aria-hidden className={itemFound ? 'text-px-red' : 'text-px-ink/40'}>
                        {itemFound ? '★' : '·'}
                      </span>
                      {isOpen(item.id) ? (
                        <button
                          type="button"
                          onClick={item.onOpen}
                          className="min-h-6 cursor-pointer text-left underline decoration-px-ink/30 underline-offset-2 hover:decoration-px-red"
                        >
                          {item.label}
                          {itemFound ? <span className="sr-only"> ({t.game.quests.found})</span> : null}
                        </button>
                      ) : (
                        <span className="text-px-ink/75">{t.game.quests.unknown}</span>
                      )}
                    </li>
                  )
                })}
              </ul>
            ) : null}
          </section>
        )
      })}
    </div>
  )
}

/**
 * A building's inside: the room fills the screen, an area sign names the place, and an RPG choice box lists
 * what you can use here. Using something (in the room or in the box) opens its game dialog (children).
 * Smaller screens and zoom: the same parts stacked in a normal scrolling page (WCAG 1.4.10).
 */
export default function InteriorLayout({
  place,
  intro,
  room,
  quests,
  children
}: {
  place: BuildingId
  intro: string
  room: ReactNode
  quests: TrackedQuest[]
  children: ReactNode
}) {
  const { t } = useLocale()

  return (
    <section
      aria-labelledby={PLACE_TITLE_ID}
      className="relative flex flex-col gap-3 px-safe-3 pt-safe-20 pb-28 sm:px-safe-6 stage:h-dvh stage:gap-4 stage:px-safe-8 stage:pt-safe-4 stage:pb-28"
    >
      {/* Area sign. */}
      <div className="pixel-drop z-10 self-center short:absolute short:top-3 short:left-1/2 short:origin-top short:-translate-x-1/2 short:scale-75 stage:fixed stage:top-4 stage:left-1/2 stage:-translate-x-1/2">
        <div className="panel flex items-center gap-4 py-2.5 pr-3 pl-4">
          <PixelSprite rows={PLACE_ICON[place]} palette={ICON_PALETTE} scale={3} className="shrink-0" />
          <div className="min-w-0">
            <p className="eyebrow leading-none">{t.game.places[place]}</p>
            <h1 id={PLACE_TITLE_ID} tabIndex={-1} className="heading mt-1.5 text-2xl leading-none text-ui-text sm:text-3xl">
              {t.nav[place]}
            </h1>
          </div>
        </div>
      </div>

      {/*
        The room, with the choice menu beside it on full-screen stages, or under it in the scrolling layout. The
        room box never gets taller than the screen; a room bigger than its box follows you with a camera.
      */}
      <div className="relative flex flex-col gap-3 stage:mt-20 stage:block stage:min-h-0 stage:flex-1">
        <div className="relative h-[min(75vw,calc(100svh-12rem))] min-h-48 w-full stage:absolute stage:inset-y-0 stage:right-0 stage:left-[19.5rem] stage:h-auto stage:w-auto widestage:left-[22rem]">
          {room}
        </div>

        <div className="pixel-drop mx-auto w-full max-w-4xl stage:absolute stage:bottom-0 stage:left-0 stage:flex stage:max-h-full stage:w-[18rem] stage:flex-col widestage:w-[20rem]">
          <div className="panel-paper scroll-panel grid gap-x-8 gap-y-4 overflow-y-auto px-6 py-5 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] sm:px-8 stage:min-h-0 stage:grid-cols-1 stage:px-5 widestage:px-6">
            <div>
              <p className="font-site-pixel text-lg leading-snug sm:text-xl">{intro}</p>
              {/* Controls for the input the visitor has: keys on desktop, taps on touch screens. */}
              <p id={ROOM_HINT_ID} className="mt-2 text-sm leading-relaxed text-px-ink/75">
                <span className="pointer-coarse:hidden">{t.game.roomControls}</span>
                <span className="hidden pointer-coarse:inline">{t.game.roomControlsTouch}</span>
              </p>
            </div>
            <div className="border-px-ink/15 stage:border-t-[3px] stage:pt-4">
              <QuestTracker quests={quests} />
            </div>
          </div>
        </div>
      </div>

      {children}
    </section>
  )
}

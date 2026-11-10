import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { Tooltip } from '~/components/elements/Tooltip'
import { useMotionPreference } from '~/components/motion/MotionPreference'
import { contactPath } from '~/components/layout/nav'
import { EDUCATIONS } from '~/database/educations'
import { EXPERIENCES } from '~/database/experiences'
import GameDialog from '~/game/interior/GameDialog'
import PixelSprite from '~/game/PixelSprite'
import { PLACE_PATH, placeFromPath } from '~/game/places'
import { questProgress, QUESTS, useProgress } from '~/game/progress'
import { ROBOT, ROBOT_PALETTE } from '~/game/sprites'
import type { Locale } from '~/i18n/locale'
import type { Messages } from '~/i18n/messages'
import { useLocale } from '~/i18n/useLocale'
import { cn } from '~/services/utils'

/** Label and (for things you can read again) the link that opens it. */
function itemInfo(item: string, t: Messages, locale: Locale, localize: (path: string) => string) {
  const [kind, id = ''] = item.split(':')
  if (kind === 'npc') return { label: id === 'pip' ? 'Pip' : 'Byte' }
  if (kind === 'sign') return { label: t.game.places[id as keyof typeof t.game.places] }
  if (kind === 'job') return { label: EXPERIENCES[Number(id)]?.title ?? id, href: `${localize(PLACE_PATH.experience)}#job-${id}` }
  if (kind === 'edu')
    return { label: EDUCATIONS[id as keyof typeof EDUCATIONS]?.title[locale] ?? id, href: `${localize(PLACE_PATH.education)}#${id}` }
  if (kind === 'about') return { label: id === 'story' ? t.game.story : t.game.collabs, href: `${localize(PLACE_PATH.about)}#${id}` }
  return { label: t.game.write, href: `${localize(PLACE_PATH.contact)}#letter` }
}

function BookIcon() {
  return (
    <svg viewBox="0 0 12 10" aria-hidden className="h-3.5 w-[17px]" shapeRendering="crispEdges">
      <path d="M0 1h5v1h1V1h6v8H7v1H5V9H0zM1 2v6h4v1h1V3H5V2zm6 0v1H6v6h1V8h4V2z" fill="currentColor" />
    </svg>
  )
}

function ScrollIcon() {
  return (
    <svg viewBox="0 0 10 10" aria-hidden className="size-3.5" shapeRendering="crispEdges">
      <path d="M1 0h7v1h1v2H8v7H2V9H1V7h1V1H1zm2 1v7h4V1zm1 1h2v1H4zm0 2h2v1H4zm0 2h2v1H4z" fill="currentColor" />
    </svg>
  )
}

/** Quest journal button (with progress) and the journal itself. */
export function QuestJournal() {
  const { t, locale, localize } = useLocale()
  const { found, isOpen, completedQuests, storyMode } = useProgress()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Tooltip label={t.game.quests.journal} hint={t.game.quests.journalHint(completedQuests, QUESTS.length)}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="tile inline-flex min-h-10 items-center gap-2 px-2.5"
          aria-label={`${t.game.quests.journal}, ${t.game.quests.progress(completedQuests, QUESTS.length)}`}
        >
          <ScrollIcon />
          <span aria-hidden className="arcade text-[0.55rem]">
            {completedQuests}/{QUESTS.length}
          </span>
        </button>
      </Tooltip>
      <GameDialog
        open={open}
        onClose={() => setOpen(false)}
        eyebrow={t.game.quests.progress(completedQuests, QUESTS.length)}
        title={t.game.quests.journal}
      >
        <div className="flex flex-col gap-6">
          {storyMode ? <p className="prose-paper">{t.game.quests.storyModeHint}</p> : null}
          <ul className="grid gap-4 sm:grid-cols-2">
            {QUESTS.map((quest) => {
              const { done, total, complete } = questProgress(quest, found)
              return (
                <li key={quest.id} className={cn('border-[3px] p-4', complete ? 'border-px-ink' : 'border-px-ink/15')}>
                  <p className="flex items-baseline justify-between gap-3 font-site-pixel text-base leading-tight font-semibold">
                    <span>
                      {complete ? (
                        <span aria-hidden className="mr-1 text-px-red">
                          ★
                        </span>
                      ) : null}
                      {t.game.quests.list[quest.id]}
                      {complete ? <span className="sr-only"> ({t.game.quests.complete})</span> : null}
                    </span>
                    <span className="arcade shrink-0 text-[0.55rem] text-px-red">
                      {done}/{total}
                    </span>
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                    {quest.items.map((item) => {
                      const info = itemInfo(item, t, locale, localize)
                      if (!isOpen(item))
                        return (
                          <li key={item} className="text-px-ink/75">
                            {t.game.quests.unknown}
                          </li>
                        )
                      return (
                        <li key={item}>
                          {info.href ? (
                            <Link
                              to={info.href}
                              onClick={() => setOpen(false)}
                              className="inline-flex min-h-6 items-center underline decoration-px-ink/30 underline-offset-2 hover:decoration-px-red"
                            >
                              {info.label}
                            </Link>
                          ) : (
                            <span>{info.label}</span>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </li>
              )
            })}
          </ul>
        </div>
      </GameDialog>
    </>
  )
}

/** Story mode switch: unlocks everything for reading without playing. */
export function StoryModeToggle() {
  const { t } = useLocale()
  const { storyMode, toggleStoryMode } = useProgress()
  return (
    <Tooltip label={t.game.quests.storyMode} hint={t.game.quests.storyModeTip}>
      <button
        type="button"
        aria-pressed={storyMode}
        onClick={toggleStoryMode}
        className="tile inline-flex min-h-10 min-w-10 items-center justify-center"
      >
        <BookIcon />
        <span className="sr-only">{t.game.quests.storyMode}</span>
      </button>
    </Tooltip>
  )
}

/** "Quest updated 3/5" pop-up. Also announced politely to screen readers. */
export function QuestToast() {
  const { t } = useLocale()
  const { toast, dismissToast } = useProgress()

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(dismissToast, 3600)
    return () => window.clearTimeout(id)
  }, [toast, dismissToast])

  const heading = toast ? (toast.all ? t.game.quests.allDone : toast.complete ? t.game.quests.complete : t.game.quests.updated) : ''

  return (
    <div
      role="status"
      // At the top, under the HUD: at the bottom it would cover the speech box's Next button on small screens.
      className="pointer-events-none fixed inset-x-0 top-safe-20 z-50 flex justify-center px-safe-3 stage:top-safe-28"
    >
      {toast ? (
        <div key={toast.id} className="pixel-drop enter-rise">
          <div className="panel flex items-center gap-4 px-5 py-3">
            <span aria-hidden className={cn('text-2xl leading-none', toast.complete ? 'text-site-gold' : 'text-ui-muted')}>
              {toast.complete ? '★' : '☆'}
            </span>
            <div>
              <p className="eyebrow">{heading}</p>
              <p className="mt-1 font-site-pixel text-base font-semibold">
                {t.game.quests.list[toast.quest]} · {toast.done}/{toast.total}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

const FIREWORK_COLORS = ['#e4b84a', '#fff1c4', '#6fc3d2', '#f07c8a', '#9fe0b0']

/** Pixel fireworks over the screen for a few seconds (skipped with reduced motion or paused animations). */
function Fireworks() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const scale = 4
    const w = Math.ceil(window.innerWidth / scale)
    const h = Math.ceil(window.innerHeight / scale)
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')!
    type Spark = { x: number; y: number; vx: number; vy: number; life: number; color: string }
    let sparks: Spark[] = []
    let raf = 0
    let last = performance.now()
    let elapsed = 0
    let nextBurst = 0

    const burst = () => {
      const x = w * (0.2 + Math.random() * 0.6)
      const y = h * (0.15 + Math.random() * 0.35)
      const color = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)]!
      for (let k = 0; k < 28; k++) {
        const angle = (k / 28) * Math.PI * 2
        const speed = 18 + Math.random() * 14
        sparks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, color })
      }
    }

    const frame = (now: number) => {
      const dt = Math.min(50, Math.max(0, now - last)) / 1000
      last = now
      elapsed += dt
      if (elapsed < 5 && elapsed > nextBurst) {
        burst()
        nextBurst = elapsed + 0.45 + Math.random() * 0.4
      }
      ctx.clearRect(0, 0, w, h)
      sparks = sparks.filter((s) => s.life > 0)
      for (const s of sparks) {
        s.x += s.vx * dt
        s.y += s.vy * dt
        s.vy += 22 * dt
        s.life -= dt * 0.8
        ctx.globalAlpha = Math.max(0, s.life)
        ctx.fillStyle = s.color
        ctx.fillRect(Math.round(s.x), Math.round(s.y), 1, 1)
      }
      ctx.globalAlpha = 1
      if (elapsed < 7 || sparks.length) raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [])

  return <canvas ref={ref} aria-hidden className="pixelated pointer-events-none fixed inset-0 z-[60] h-full w-full" />
}

/** Reward for finishing every quest: fireworks and a last word from Byte. */
export function QuestReward() {
  const { t, locale } = useLocale()
  const { justFinished, clearJustFinished } = useProgress()
  const { paused, reduced } = useMotionPreference()
  const [open, setOpen] = useState(false)
  // Finished in the Post office itself: "right around the corner" would be wrong.
  const atPostOffice = placeFromPath(useLocation().pathname) === 'contact'

  useEffect(() => {
    if (!justFinished) return
    // Wait until the dialog that finished the last quest has been closed, then celebrate.
    const id = window.setInterval(() => {
      // Also wait for a speech box (Byte, Pip, a sign) to be closed, so the reward never covers a conversation.
      if (document.querySelector('dialog[open], [data-speech-box]')) return
      window.clearInterval(id)
      setOpen(true)
    }, 300)
    return () => window.clearInterval(id)
  }, [justFinished])

  return (
    <>
      {open && !paused && !reduced ? <Fireworks /> : null}
      <GameDialog
        open={open}
        onClose={() => {
          setOpen(false)
          clearJustFinished()
        }}
        eyebrow={t.game.quests.allDone}
        title={t.game.quests.rewardTitle}
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-5">
            <PixelSprite rows={ROBOT} palette={ROBOT_PALETTE} scale={5} className="shrink-0" />
            <div className="prose-paper">
              {(atPostOffice ? [...t.game.quests.reward.slice(0, -1), t.game.quests.rewardHere] : t.game.quests.reward).map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
          <Link
            to={`${contactPath(locale)}#letter`}
            onClick={() => {
              setOpen(false)
              clearJustFinished()
            }}
            className="button-gold self-start"
          >
            {t.nav.getInTouch}
          </Link>
        </div>
      </GameDialog>
    </>
  )
}

import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import TraitSwapper from '~/components/elements/TraitSwapper'
import { useMotionPreference } from '~/components/motion/MotionPreference'
import { Hotbar, KeysLegend, TopBar } from '~/game/Hud'
import { QuestReward, QuestToast } from '~/game/Quests'
import { PLACE_TITLE_ID } from '~/game/interior/InteriorLayout'
import { PLACE_PATH, PLACES, placeFromPath, type PlaceId } from '~/game/places'
import { quietFocus } from '~/game/quietFocus'
import Town, { type Spawn } from '~/game/Town'
import { BLACK_MS, CLOSE_MS, closeOn, closeRadius, door, doorBusy, fullRadius, OPEN_MS, openRadius, smallRadius } from '~/game/transition'
import { doorstep, SPAWN, type BuildingId, type Point } from '~/game/world'
import { useLocale } from '~/i18n/useLocale'
import { PixelCursor } from '~/game/PixelArrow'

// Every building is its own chunk (with the room engine), so the town loads and hydrates with less script.
const AboutPlace = lazy(() => import('~/game/interior/AboutPlace'))
const ExperiencePlace = lazy(() => import('~/game/interior/ExperiencePlace'))
const EducationPlace = lazy(() => import('~/game/interior/EducationPlace'))
const ContactPlace = lazy(() => import('~/game/interior/ContactPlace'))

const SHORTCUTS_KEY = 'ts-shortcuts'
/** How long the iris may stay dark waiting for the next scene to know where the player is. */
const FOCUS_WAIT_MS = 600

function readShortcuts() {
  try {
    return window.localStorage.getItem(SHORTCUTS_KEY) === 'on'
  } catch {
    return false
  }
}

// The welcome card shows once per visit (browser session); walking back into town later skips it.
const WELCOME_KEY = 'ts-welcome-seen'
let welcomeDismissed = false

function rememberWelcome() {
  welcomeDismissed = true
  try {
    window.sessionStorage.setItem(WELCOME_KEY, '1')
  } catch {
    // Storage blocked: the module flag still covers this page load.
  }
}

function welcomeSeen() {
  if (welcomeDismissed) return true
  try {
    return window.sessionStorage.getItem(WELCOME_KEY) === '1'
  } catch {
    return false
  }
}

const MOVE_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'])
const STAGE_QUERY = '(min-width: 1024px) and (min-height: 640px)'

function Welcome({ onStart }: { onStart: () => void }) {
  const { locale, t, localize } = useLocale()
  const { paused } = useMotionPreference()

  return (
    // Scrolls rather than clips when the card is taller than a small phone; m-auto centres it when it fits.
    <div className="absolute inset-0 z-20 flex overflow-y-auto bg-[#04141a]/55 p-4 pt-20 pb-6 sm:pb-28">
      <div className="pixel-drop m-auto w-full max-w-xl">
        <div className="panel enter-window flex flex-col items-center gap-4 px-6 py-7 text-center sm:gap-5 sm:px-10 sm:py-10">
          <p className="eyebrow">{t.hero.kicker}</p>
          <p aria-hidden className="heading text-5xl text-ui-text [text-shadow:0_4px_0_var(--color-px-ink)] sm:text-6xl">
            Timo Smit
          </p>
          <p aria-hidden className="font-site-pixel text-xl leading-snug sm:text-2xl">
            {t.hero.beforeTrait}
            <TraitSwapper key={locale} traits={t.traits} paused={paused} />
            <br />
            {t.hero.afterTrait}
          </p>
          <p className="max-w-md text-base leading-relaxed text-ui-muted">
            {t.game.intro} {t.game.quests.intro}
          </p>
          {/* Touch screens only, chosen in CSS (not after hydrating), so the card never changes height. */}
          <p className="panel-soft hidden max-w-md px-4 py-2 font-site-pixel text-base leading-snug pointer-coarse:block">
            {t.game.touchHint}
          </p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <button type="button" onClick={onStart} className="button-gold">
              {t.game.start}
              <PixelCursor dir="right" className="animate-px-blink h-[10.5px] w-1.5" />
            </button>
            <Link to={localize(PLACE_PATH.about)} className="button-ghost">
              {t.nav.about}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function PlaceView({ place }: { place: Exclude<PlaceId, 'town'> }) {
  if (place === 'about') return <AboutPlace />
  if (place === 'experience') return <ExperiencePlace />
  if (place === 'education') return <EducationPlace />
  return <ContactPlace />
}

/**
 * The whole site as one game. The URL decides the place (town or a building), so every place has its own
 * address, title and prerendered content; moving between places is an iris transition instead of a page load.
 */
export default function GameShell() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { localize, t } = useLocale()
  const { reduced, paused } = useMotionPreference()
  const place = placeFromPath(pathname) ?? 'town'
  const [shown, setShown] = useState<PlaceId>(place)
  const shownRef = useRef(shown)
  shownRef.current = shown
  const placeRef = useRef(place)
  placeRef.current = place
  const [covering, setCovering] = useState(false)
  const overlay = useRef<HTMLDivElement>(null)
  const runner = useRef({ running: false, raf: 0, fallback: 0 })
  // Server and hydration render the card at the town; a visitor who already started skips it after hydrating.
  const [welcome, setWelcome] = useState(() => place === 'town' && !welcomeDismissed)
  useEffect(() => {
    if (welcomeSeen()) setWelcome(false)
  }, [])
  const [spawn, setSpawn] = useState<Spawn>({ ...SPAWN, dir: 'down', key: 'start' })
  const previous = useRef<PlaceId>(place)
  const firstRender = useRef(true)

  const go = useCallback((next: PlaceId) => navigate(localize(PLACE_PATH[next])), [localize, navigate])
  const [shortcuts, setShortcuts] = useState(false)

  useEffect(() => setShortcuts(readShortcuts()), [])

  const toggleShortcuts = () => {
    const next = !shortcuts
    setShortcuts(next)
    try {
      window.localStorage.setItem(SHORTCUTS_KEY, next ? 'on' : 'off')
    } catch {
      // Storage blocked: the choice still holds for this visit.
    }
  }

  // Keys that work everywhere: 1 to 5 travel (single-key shortcuts, so they can be switched off, WCAG 2.1.4)
  // and Escape leaves a building. Never while typing in a field or with a modifier held.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return
      const target = event.target as HTMLElement | null
      // Typing, or inside a game dialog / menu: the dialog handles its own keys (Esc closes it).
      if (target?.closest('input, textarea, select, [contenteditable="true"], dialog, [role="dialog"]')) return
      if (document.querySelector('dialog[open]')) return
      const index = Number(event.key) - 1
      // Mid-transition: travelling again waits until this door has finished, so the circle never jumps.
      if (doorBusy() && (event.key === 'Escape' || (shortcuts && Number.isInteger(index) && PLACES[index]))) {
        event.preventDefault()
        return
      }
      if (shortcuts && Number.isInteger(index) && PLACES[index]) {
        event.preventDefault()
        if (PLACES[index] !== place) go(PLACES[index]!)
        return
      }
      if (event.key === 'Escape' && place !== 'town') {
        event.preventDefault()
        go('town')
        return
      }
      // Walking keys pressed while nothing in particular has focus (the heading you land on after entering, or
      // the page itself): hand them to the scene, so you can walk right away. Only on full-screen stages: in the
      // scrolling layout the arrow keys must keep scrolling the page.
      if (MOVE_KEYS.has(event.key) && window.matchMedia(STAGE_QUERY).matches) {
        const active = document.activeElement
        const idle = !active || active === document.body || active.id === 'main' || active.id === PLACE_TITLE_ID
        if (!idle) return
        const scene =
          place === 'town' ? document.getElementById('town') : document.querySelector<HTMLElement>('section [role="application"]')
        if (!scene) return
        event.preventDefault()
        quietFocus(scene)
        scene.dispatchEvent(new KeyboardEvent('keydown', { key: event.key, bubbles: true, cancelable: true }))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [shortcuts, place, go])

  const onEnter = useCallback(
    (id: BuildingId, at: Point) => {
      closeOn(at)
      go(id)
    },
    [go]
  )

  /** Show a place now. Coming back to town puts you on the doorstep of the building you left. */
  const swapTo = useCallback((next: PlaceId) => {
    const from = shownRef.current
    if (next === from) return
    if (next === 'town' && from !== 'town') setSpawn({ ...doorstep(from), dir: 'down', key: `${from}-${Date.now()}` })
    shownRef.current = next
    setShown(next)
  }, [])

  // Going through a door: one timeline (see transition.ts) paints the iris every frame, closing on the door
  // or the player, swapping the scene in the dark and opening on the player again. The town camera and the
  // rooms read the same clock, so the zoom and the circle move as one.
  const runDoor = useCallback(() => {
    const r = runner.current
    if (r.running) return
    r.running = true
    const size = () => ({ w: window.innerWidth, h: window.innerHeight })
    const centre = () => ({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
    const origin = door.origin ?? door.focus?.() ?? centre()
    door.origin = null
    const paint = (at: Point, radius: number) => {
      const el = overlay.current
      if (!el) return
      el.style.setProperty('--iris-x', `${at.x}px`)
      el.style.setProperty('--iris-y', `${at.y}px`)
      el.style.setProperty('--iris', `${Math.max(0, radius)}px`)
    }
    const begin = (phase: typeof door.phase, now: number) => {
      door.phase = phase
      door.start = now
    }
    const finish = () => {
      cancelAnimationFrame(r.raf)
      window.clearTimeout(r.fallback)
      swapTo(placeRef.current)
      door.phase = 'idle'
      r.running = false
      setCovering(false)
      // Travelled on while the door was opening: go through the next one.
      if (placeRef.current !== shownRef.current) runDoor()
    }
    const { w, h } = size()
    paint(origin, fullRadius(origin, w, h))
    setCovering(true)
    begin('close', performance.now())
    const tick = (now: number) => {
      const t = now - door.start
      const { w, h } = size()
      const small = smallRadius(w, h)
      if (door.phase === 'close') {
        paint(origin, closeRadius(t, fullRadius(origin, w, h), small))
        if (t >= CLOSE_MS) {
          begin('black', now)
          swapTo(placeRef.current)
        }
      } else if (door.phase === 'black') {
        paint(origin, 0)
        // Open on the player: a room that is still loading has no position yet, so stay dark a moment longer
        // instead of opening in the middle of the screen and jumping.
        if (t >= BLACK_MS && (door.focus?.() || t >= BLACK_MS + FOCUS_WAIT_MS)) begin('open', now)
      } else {
        const at = door.focus?.() ?? centre()
        paint(at, openRadius(t, fullRadius(at, w, h), small))
        if (t >= OPEN_MS) {
          finish()
          return
        }
      }
      r.raf = requestAnimationFrame(tick)
    }
    r.raf = requestAnimationFrame(tick)
    // Animation frames stop in a background tab: never leave the screen covered.
    r.fallback = window.setTimeout(finish, CLOSE_MS + BLACK_MS + OPEN_MS + 1500)
  }, [swapTo])

  // URL changed (door, hotbar, back button): go through the door, or swap at once with reduced motion or
  // with animations paused (the town skips its camera push then too, so it is all or nothing).
  useEffect(() => {
    if (place === shownRef.current) return
    if (reduced || paused) swapTo(place)
    else runDoor()
  }, [place, reduced, paused, runDoor, swapTo])

  useEffect(() => {
    const r = runner.current
    return () => {
      cancelAnimationFrame(r.raf)
      window.clearTimeout(r.fallback)
      door.phase = 'idle'
    }
  }, [])

  // After a scene change: put keyboard focus where the new scene starts (WCAG 2.4.3).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    if (previous.current === shown) return
    previous.current = shown
    if (shown !== 'town') setWelcome(false)
    // Timeouts (not requestAnimationFrame) so this also runs in a background tab; retried until the place's
    // heading exists, since a building's content can still be loading.
    let tries = 0
    let id = 0
    const attempt = () => {
      const target = shown === 'town' ? document.getElementById('town') : document.getElementById(PLACE_TITLE_ID)
      quietFocus(target)
      // The previous place's heading can still be in the page (hidden while the next one loads), and a hidden
      // element silently refuses focus: keep trying until focus has really landed.
      if (target && document.activeElement === target) window.scrollTo(0, 0)
      else if (tries++ < 60) id = window.setTimeout(attempt, 50)
    }
    id = window.setTimeout(attempt, 0)
    return () => window.clearTimeout(id)
  }, [shown])

  const start = () => {
    rememberWelcome()
    setWelcome(false)
    window.setTimeout(() => quietFocus(document.getElementById('town')), 0)
  }

  const inTown = shown === 'town'

  return (
    <div className="relative min-h-dvh stage:h-dvh stage:overflow-hidden">
      <TopBar shortcuts={shortcuts} onToggleShortcuts={toggleShortcuts} />

      {/* Town: always mounted, so the player keeps their spot; hidden while inside a building. */}
      <div hidden={!inTown} className="relative h-svh min-h-96 stage:h-dvh">
        {inTown ? <h1 className="sr-only">{t.hero.srTitle}</h1> : null}
        <Town active={inTown} intro={welcome} spawn={spawn} onEnter={onEnter} />
        {inTown && welcome ? <Welcome onStart={start} /> : null}
      </div>
      {inTown ? <KeysLegend shortcuts={shortcuts} /> : null}

      {!inTown ? (
        <Suspense fallback={<div className="h-dvh" />}>
          <PlaceView key={shown} place={shown} />
        </Suspense>
      ) : null}

      {shortcuts ? <Hotbar current={place} /> : null}
      <QuestToast />
      <QuestReward />

      <div ref={overlay} aria-hidden data-active={covering || undefined} className="iris pointer-events-none fixed inset-0 z-[70]" />
    </div>
  )
}

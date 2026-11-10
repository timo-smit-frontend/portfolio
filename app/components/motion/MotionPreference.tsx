import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { usePrefersReducedMotion } from '~/components/elements/useMediaQuery'

const STORAGE_KEY = 'ts-motion-paused'

type MotionPreference = {
  /** Autonomous motion (3D scene, typing, logo ring) is paused. Scroll-linked and hover effects still respond. */
  paused: boolean
  /** The visitor prefers reduced motion at OS level: no large transforms at all. */
  reduced: boolean
  toggle: () => void
}

const MotionPreferenceContext = createContext<MotionPreference>({ paused: false, reduced: false, toggle: () => {} })

export function useMotionPreference() {
  return useContext(MotionPreferenceContext)
}

function readStoredPause(): boolean | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value === null ? null : value === '1'
  } catch {
    return null
  }
}

function storePause(paused: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, paused ? '1' : '0')
  } catch {
    // Private mode or blocked storage: the choice still applies for this visit.
  }
}

/**
 * One switch for every moving thing on the site (WCAG 2.2.2). Starts paused for prefers-reduced-motion,
 * remembers the visitor's own choice, and is `false` during SSR so hydration stays deterministic.
 */
export function MotionPreferenceProvider({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion(false)
  const [userPaused, setUserPaused] = useState<boolean | null>(null)

  useEffect(() => {
    setUserPaused(readStoredPause())
  }, [])

  const paused = userPaused ?? reduced

  const toggle = useCallback(() => {
    const next = !paused
    storePause(next)
    setUserPaused(next)
  }, [paused])

  const value = useMemo(() => ({ paused, reduced, toggle }), [paused, reduced, toggle])

  useEffect(() => {
    document.documentElement.toggleAttribute('data-motion-paused', paused)
  }, [paused])

  return <MotionPreferenceContext.Provider value={value}>{children}</MotionPreferenceContext.Provider>
}

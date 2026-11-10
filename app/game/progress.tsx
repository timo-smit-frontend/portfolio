import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { EDUCATIONS } from '~/database/educations'
import { EXPERIENCES } from '~/database/experiences'
import type { PlaceId } from '~/game/world'
import { useLocale } from '~/i18n/useLocale'

/**
 * Quests: small goals that give a reason to explore. Every quest is a list of things to discover; finding
 * one (talking to Byte, reading a sign, using a desk...) is stored in the visitor's browser.
 * Story mode unlocks everything for people who would rather read than play (and for screen reader users).
 */

export type QuestId = 'byte' | 'pip' | 'signs' | 'story' | 'brands' | 'desks' | 'books' | 'letter'

export type Quest = { id: QuestId; place: PlaceId; items: string[] }

export const QUESTS: Quest[] = [
  { id: 'byte', place: 'town', items: ['npc:byte'] },
  { id: 'pip', place: 'town', items: ['npc:pip'] },
  { id: 'signs', place: 'town', items: ['sign:about', 'sign:experience', 'sign:education', 'sign:contact'] },
  { id: 'story', place: 'about', items: ['about:story'] },
  { id: 'brands', place: 'about', items: ['about:brands'] },
  { id: 'desks', place: 'experience', items: EXPERIENCES.map((_, index) => `job:${index}`) },
  { id: 'books', place: 'education', items: Object.keys(EDUCATIONS).map((key) => `edu:${key}`) },
  { id: 'letter', place: 'contact', items: ['contact:letter'] }
]

export type Toast = { id: number; quest: QuestId; done: number; total: number; complete: boolean; all: boolean }

type Progress = {
  found: ReadonlySet<string>
  storyMode: boolean
  /** Record a discovery; returns nothing, raises a toast when it moves a quest forward. */
  discover: (item: string) => void
  isFound: (item: string) => boolean
  /** Unlocked: found, or story mode is on. */
  isOpen: (item: string) => boolean
  toggleStoryMode: () => void
  completedQuests: number
  allComplete: boolean
  toast: Toast | null
  dismissToast: () => void
  /** True once, right after the last quest is completed (for the reward). */
  justFinished: boolean
  clearJustFinished: () => void
}

const STORAGE_FOUND = 'ts-quests'
const STORAGE_STORY = 'ts-story-mode'

const ProgressContext = createContext<Progress | null>(null)

export function useProgress() {
  const value = useContext(ProgressContext)
  if (!value) throw new Error('useProgress must be used inside <ProgressProvider>')
  return value
}

function questDone(quest: Quest, found: ReadonlySet<string>) {
  return quest.items.filter((item) => found.has(item)).length
}

export function questProgress(quest: Quest, found: ReadonlySet<string>) {
  const done = questDone(quest, found)
  return { done, total: quest.items.length, complete: done === quest.items.length }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  // Empty on the server and during hydration; the saved state is read right after.
  const [found, setFound] = useState<ReadonlySet<string>>(() => new Set())
  const [storyMode, setStoryMode] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const [justFinished, setJustFinished] = useState(false)
  // Saving starts only after the saved state has been read: otherwise the empty first render would overwrite
  // it (React also runs effects twice in development, which made that visible).
  const [hydrated, setHydrated] = useState(false)
  const toastId = useRef(0)

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_FOUND) ?? '[]') as unknown
      if (Array.isArray(saved)) setFound(new Set(saved.filter((item): item is string => typeof item === 'string')))
      setStoryMode(window.localStorage.getItem(STORAGE_STORY) === 'on')
    } catch {
      // Blocked storage: progress lasts for this visit only.
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_FOUND, JSON.stringify([...found]))
    } catch {
      // Blocked storage: progress lasts for this visit only.
    }
  }, [found, hydrated])

  const foundRef = useRef(found)
  foundRef.current = found

  const discover = useCallback((item: string) => {
    const current = foundRef.current
    if (current.has(item)) return
    const next = new Set(current)
    next.add(item)
    foundRef.current = next
    setFound(next)
    const quest = QUESTS.find((q) => q.items.includes(item))
    if (!quest) return
    const { done, total, complete } = questProgress(quest, next)
    const all = QUESTS.every((q) => questProgress(q, next).complete)
    toastId.current += 1
    setToast({ id: toastId.current, quest: quest.id, done, total, complete, all })
    if (all) setJustFinished(true)
  }, [])

  const toggleStoryMode = useCallback(() => {
    setStoryMode((current) => {
      try {
        window.localStorage.setItem(STORAGE_STORY, current ? 'off' : 'on')
      } catch {
        // Blocked storage: the choice still holds for this visit.
      }
      return !current
    })
  }, [])

  const value = useMemo<Progress>(() => {
    const completedQuests = QUESTS.filter((quest) => questProgress(quest, found).complete).length
    return {
      found,
      storyMode,
      discover,
      isFound: (item) => found.has(item),
      isOpen: (item) => storyMode || found.has(item),
      toggleStoryMode,
      completedQuests,
      allComplete: completedQuests === QUESTS.length,
      toast,
      dismissToast: () => setToast(null),
      justFinished,
      clearJustFinished: () => setJustFinished(false)
    }
  }, [found, storyMode, discover, toggleStoryMode, toast, justFinished])

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

/** Pip comes along inside buildings once you have made friends. */
export function useCompanion() {
  const { isFound } = useProgress()
  const { t } = useLocale()
  // The same words as in town ("Pet Pip"), for the prompt and the hover label.
  return isFound('npc:pip') ? { label: t.game.prompt.pet } : null
}

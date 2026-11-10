import { useMemo, useState } from 'react'
import Image from '~/components/elements/Image'
import { EDUCATIONS } from '~/database/educations'
import GameDialog, { DialogPager } from '~/game/interior/GameDialog'
import InteriorLayout, { ROOM_HINT_ID, useHashItem, useLeave } from '~/game/interior/InteriorLayout'
import { useCompanion, useProgress } from '~/game/progress'
import Room, { type Furniture, type WallDecor } from '~/game/Room'
import { useLocale } from '~/i18n/useLocale'

type EducationKey = keyof typeof EDUCATIONS

const KEYS = Object.keys(EDUCATIONS) as EducationKey[]
// Bookcases along the back wall, with a window in between.
const SHELF_SPOTS = [2, 3, 4, 9, 10]
const SHELF_COLORS = ['#c0473b', '#35589c', '#3f8a5e', '#c98a3a', '#7d62b0']

const DECOR: WallDecor[] = [
  { kind: 'window', x: 6 },
  { kind: 'clock', x: 8 },
  { kind: 'frame', x: 1, color: '#5f9fb0' }
]

export default function EducationPlace() {
  const { locale, t } = useLocale()
  const [open, setOpen] = useState<EducationKey | null>(null)
  const leave = useLeave()
  const companion = useCompanion()
  const { discover, isOpen } = useProgress()
  const count = KEYS.length

  // Using a bookcase in the room counts for the quest; reading again (tracker, journal, story mode) does not.
  const interactBookcase = (key: EducationKey) => {
    setOpen(key)
    discover(`edu:${key}`)
  }
  useHashItem((hash) => {
    if (!(hash in EDUCATIONS)) return false
    setOpen(hash as EducationKey)
    return true
  })
  const reachable = KEYS.filter((key) => isOpen(`edu:${key}`))

  const furniture = useMemo<Furniture[]>(
    () => [
      { id: 'aisle', kind: 'rug', x: 6, y: 6, w: 3, h: 2, color: '#2f6e52', interactive: false },
      ...KEYS.map((key, index): Furniture => ({
        id: key,
        kind: 'shelf',
        x: SHELF_SPOTS[index] ?? index + 2,
        y: 2,
        color: SHELF_COLORS[index % SHELF_COLORS.length],
        label: EDUCATIONS[key].title[locale]
      })),
      // Two reading tables with a chair at each end.
      { id: 'table-1', kind: 'table', x: 3, y: 5, w: 2, interactive: false },
      { id: 'chair-1', kind: 'chair', x: 2, y: 5, face: 'right', interactive: false },
      { id: 'chair-2', kind: 'chair', x: 5, y: 5, face: 'left', interactive: false },
      { id: 'table-2', kind: 'table', x: 8, y: 5, w: 2, interactive: false },
      { id: 'chair-3', kind: 'chair', x: 7, y: 5, face: 'right', interactive: false },
      { id: 'chair-4', kind: 'chair', x: 10, y: 5, face: 'left', interactive: false },
      { id: 'globe', kind: 'globe', x: 11, y: 2, interactive: false },
      { id: 'lamp', kind: 'lamp', x: 12, y: 5, interactive: false },
      { id: 'plant', kind: 'plant', x: 12, y: 2, interactive: false },
      { id: 'plant-2', kind: 'plant', x: 1, y: 8, interactive: false },
      { id: 'plant-3', kind: 'plant', x: 12, y: 8, interactive: false }
    ],
    [locale]
  )

  return (
    <InteriorLayout
      place="education"
      intro={t.game.roomHint.education}
      quests={[
        {
          id: 'books',
          items: KEYS.map((key) => ({ id: `edu:${key}`, label: EDUCATIONS[key].title[locale], onOpen: () => setOpen(key) }))
        }
      ]}
      room={
        <Room
          cols={14}
          rows={10}
          wall="#365e50"
          floor="#a5774a"
          furniture={furniture}
          decor={DECOR}
          spawnX={7}
          label={t.game.places.education}
          describedBy={ROOM_HINT_ID}
          exitLabel={t.game.backToTown}
          companion={companion}
          onSelect={(id) => id in EDUCATIONS && interactBookcase(id as EducationKey)}
          onExit={leave}
        />
      }
    >
      {KEYS.map((key, index) => {
        const education = EDUCATIONS[key]
        const at = reachable.indexOf(key)
        const previous = reachable[(at - 1 + reachable.length) % reachable.length] ?? key
        const next = reachable[(at + 1) % reachable.length] ?? key
        // Only the accessibility topic has a photo (a WCAG presentation).
        const image = 'image' in education ? education.image : undefined
        return (
          <GameDialog
            key={key}
            open={open === key}
            onClose={() => setOpen((current) => (current === key ? null : current))}
            eyebrow={`${t.game.places.education} · ${index + 1}/${count}`}
            title={education.title[locale]}
            footer={
              reachable.length > 1 && at >= 0 ? (
                <DialogPager
                  onPrevious={() => setOpen(previous)}
                  onNext={() => setOpen(next)}
                  previousLabel={EDUCATIONS[previous].title[locale]}
                  nextLabel={EDUCATIONS[next].title[locale]}
                />
              ) : undefined
            }
          >
            <div className="flex flex-col gap-6">
              <div className="prose-paper" dangerouslySetInnerHTML={{ __html: education.description[locale] }} />
              {image ? (
                <div className="border-[3px] border-px-ink/15 bg-white p-2">
                  <Image
                    src={image}
                    alt={t.education.accessibilityImageAlt}
                    width={1200}
                    height={800}
                    sizes="48rem"
                    className="h-auto w-full object-contain"
                  />
                </div>
              ) : null}
            </div>
          </GameDialog>
        )
      })}
    </InteriorLayout>
  )
}

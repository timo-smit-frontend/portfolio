import { useMemo, useState } from 'react'
import Image from '~/components/elements/Image'
import Accordion from '~/components/flex/content/Accordion'
import { EXPERIENCES, type Experience, type ExperienceProject } from '~/database/experiences'
import GameDialog, { DialogPager } from '~/game/interior/GameDialog'
import InteriorLayout, { ROOM_HINT_ID, useHashItem, useLeave } from '~/game/interior/InteriorLayout'
import { useCompanion, useProgress } from '~/game/progress'
import Room, { type Furniture, type WallDecor } from '~/game/Room'
import type { Locale } from '~/i18n/locale'
import { useLocale } from '~/i18n/useLocale'
import { cn } from '~/services/utils'

const DESK_COLORS = ['#a8743f', '#4f6fb3', '#b8633a', '#3f8a5e', '#7d62b0']
// Two rows of desks either side of a carpet aisle that runs from the door to the back wall.
const DESK_SPOTS = [
  [2, 3],
  [6, 3],
  [10, 3],
  [2, 6],
  [10, 6]
] as const

const DECOR: WallDecor[] = [
  { kind: 'window', x: 1 },
  { kind: 'whiteboard', x: 4 },
  { kind: 'clock', x: 8 },
  { kind: 'window', x: 10 },
  { kind: 'frame', x: 12, color: '#e4b84a' }
]

export function formatPeriod(period: { start: string; end?: string } | undefined, present: string) {
  if (!period) return ''
  const start = period.start.slice(0, 4)
  const end = period.end?.slice(0, 4)
  if (!end) return `${start} – ${present}`
  return end === start ? start : `${start} – ${end}`
}

/** A brand logo on a white plate. Decorative: the name is always right next to it. */
export function LogoPlate({ src, width, height, className }: { src: string; width: number; height: number; className?: string }) {
  return (
    <span className={cn('item-slot shrink-0 [--surface-bg:#fff] [--surface-ring:inset_0_0_0_2px_rgb(31_36_51/0.14)]', className)}>
      {/* Fixed sizes: logos are drawn with w-auto, so the browser must not derive their width from a measurement. */}
      <Image src={src} width={width} height={height} alt="" sizes="10rem" className="max-h-full w-auto object-contain" />
    </span>
  )
}

function Projects({ projects, locale, label }: { projects: ExperienceProject[]; locale: Locale; label: string }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="flex flex-col gap-3">
      <h3 className="arcade text-[0.6rem] text-px-red">{label}</h3>
      <ul className="flex flex-col gap-2">
        {projects.map((project, index) => {
          const expanded = open === index
          const panelId = `project-${project.title.replace(/\W+/g, '-').toLowerCase()}`
          return (
            <li key={project.title} className={cn('border-[3px]', expanded ? 'border-px-ink' : 'border-px-ink/15')}>
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpen(expanded ? null : index)}
                className="flex w-full cursor-pointer items-center gap-4 p-3 text-left hover:bg-px-ink/5"
              >
                <LogoPlate src={project.image} width={project.width} height={project.height} className="h-11 w-16 p-1.5" />
                <span className="min-w-0 flex-1">
                  <span className="block font-site-pixel text-lg leading-tight font-semibold">{project.title}</span>
                  {project.role ? <span className="block text-sm text-px-ink/75">{project.role[locale]}</span> : null}
                </span>
                <span aria-hidden className="keycap">
                  {expanded ? '−' : '+'}
                </span>
              </button>
              <div id={panelId}>
                <Accordion open={expanded}>
                  <p className="prose-paper px-4 pt-1 pb-4">{project.description[locale]}</p>
                </Accordion>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function JobDetails({ job, locale }: { job: Experience; locale: Locale }) {
  const { t } = useLocale()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-5">
        <LogoPlate src={job.image} width={job.width} height={job.height} className="h-16 w-36 p-2.5" />
        <div className="min-w-0 flex-1">
          {job.role ? <p className="font-site-pixel text-lg font-semibold">{job.role[locale]}</p> : null}
          <p className="text-base text-px-ink/75">
            {formatPeriod(job.period, t.game.present)}
            {job.kind ? ` · ${job.kind[locale]}` : ''}
          </p>
        </div>
      </div>
      <p className="prose-paper">{job.description[locale]}</p>
      {job.projects?.length ? <Projects projects={job.projects} locale={locale} label={t.game.projects} /> : null}
    </div>
  )
}

export default function ExperiencePlace() {
  const { locale, t } = useLocale()
  const [open, setOpen] = useState<number | null>(null)
  const leave = useLeave()
  const companion = useCompanion()
  const { discover, isOpen } = useProgress()
  const count = EXPERIENCES.length

  // Using a desk in the room counts for the quest; reading again (tracker, journal, story mode) does not.
  const interactDesk = (index: number) => {
    setOpen(index)
    discover(`job:${index}`)
  }
  useHashItem((hash) => {
    const index = Number(/^job-(\d+)$/.exec(hash)?.[1] ?? Number.NaN)
    if (!EXPERIENCES[index]) return false
    setOpen(index)
    return true
  })
  // Previous / next only cycle through desks you have already found (or everything in story mode).
  const reachable = EXPERIENCES.map((_, index) => index).filter((index) => isOpen(`job:${index}`))

  const furniture = useMemo<Furniture[]>(
    () => [
      { id: 'aisle', kind: 'rug', x: 6, y: 5, w: 3, h: 3, color: '#2f5f8a', interactive: false },
      ...EXPERIENCES.slice(0, DESK_SPOTS.length).flatMap((item, index): Furniture[] => {
        const [x, y] = DESK_SPOTS[index]!
        return [
          { id: `job-${index}`, kind: 'desk', x, y, w: 2, color: DESK_COLORS[index], label: item.title },
          // An office chair in front of the screen, over both tiles: step onto it from any side to sit down.
          { id: `chair-${index}`, kind: 'officeChair', x, y: y + 1, w: 2, interactive: false }
        ]
      }),
      { id: 'printer', kind: 'printer', x: 4, y: 2, interactive: false },
      { id: 'shelf', kind: 'shelf', x: 13, y: 2, interactive: false },
      { id: 'cooler', kind: 'cooler', x: 13, y: 5, interactive: false },
      { id: 'plant', kind: 'plant', x: 1, y: 8, interactive: false },
      { id: 'plant-2', kind: 'plant', x: 13, y: 8, interactive: false }
    ],
    []
  )

  return (
    <InteriorLayout
      place="experience"
      intro={t.game.roomHint.experience}
      quests={[
        { id: 'desks', items: EXPERIENCES.map((job, index) => ({ id: `job:${index}`, label: job.title, onOpen: () => setOpen(index) })) }
      ]}
      room={
        <Room
          cols={15}
          rows={10}
          wall="#3f5878"
          floor="#a68255"
          furniture={furniture}
          decor={DECOR}
          spawnX={7}
          label={t.game.places.experience}
          describedBy={ROOM_HINT_ID}
          exitLabel={t.game.backToTown}
          companion={companion}
          onSelect={(id) => interactDesk(Number(id.replace('job-', '')))}
          onExit={leave}
        />
      }
    >
      {EXPERIENCES.map((job, index) => {
        const at = reachable.indexOf(index)
        const previous = reachable[(at - 1 + reachable.length) % reachable.length] ?? index
        const next = reachable[(at + 1) % reachable.length] ?? index
        return (
          <GameDialog
            key={job.title}
            open={open === index}
            onClose={() => setOpen((current) => (current === index ? null : current))}
            eyebrow={`${t.game.places.experience} · ${index + 1}/${count}`}
            title={job.title}
            footer={
              reachable.length > 1 && at >= 0 ? (
                <DialogPager
                  onPrevious={() => setOpen(previous)}
                  onNext={() => setOpen(next)}
                  previousLabel={EXPERIENCES[previous]!.title}
                  nextLabel={EXPERIENCES[next]!.title}
                />
              ) : undefined
            }
          >
            <JobDetails job={job} locale={locale} />
          </GameDialog>
        )
      })}
    </InteriorLayout>
  )
}

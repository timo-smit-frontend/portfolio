import { Fragment, useState, type MouseEvent } from 'react'
import { Animated } from '~/components/elements/Animated'
import Image from '~/components/elements/Image'
import Accordion from '~/components/flex/content/Accordion'
import { EXPERIENCES, type Experience, type ExperienceProject } from '~/database/experiences'
import { type Locale } from '~/i18n/locale'
import { useLocale } from '~/i18n/useLocale'
import { cn } from '~/services/utils'

const LOGO_FRAME = {
  sm: 'h-6 w-20',
  lg: 'h-auto lg:w-44 w-32'
} as const

const LOGO_IMAGE = {
  sm: 'h-4',
  lg: 'h-12 sm:h-16'
} as const

function padIndex(index: number) {
  return String(index + 1).padStart(2, '0')
}

// Logos always sit next to the employer/project name as text, so they are decorative (alt="") to avoid
// screen readers announcing the name twice.
function ExperienceLogo({
  image,
  width,
  height,
  size = 'sm'
}: {
  image: string
  width: number
  height: number
  size?: keyof typeof LOGO_FRAME
}) {
  return (
    <span className={cn('flex shrink-0 items-center justify-start', LOGO_FRAME[size])}>
      <Image
        src={image}
        width={width}
        height={height}
        alt=""
        className={cn(LOGO_IMAGE[size], 'w-full h-auto max-w-full object-contain object-left')}
      />
    </span>
  )
}

function ProjectTiles({
  projects,
  openProjectIndex,
  onToggle,
  idPrefix,
  locale
}: {
  projects: ExperienceProject[]
  openProjectIndex: number | null
  onToggle: (index: number, event: MouseEvent<HTMLButtonElement>) => void
  idPrefix: string
  locale: Locale
}) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {projects.map((project, index) => {
        const open = openProjectIndex === index
        const isRowEnd = index % 2 === 1 || index === projects.length - 1
        const rowStart = index % 2 === 0 ? index : index - 1
        const rowEnd = Math.min(rowStart + 1, projects.length - 1)
        const openInRow = openProjectIndex !== null && openProjectIndex >= rowStart && openProjectIndex <= rowEnd
        const rowProject = openInRow ? projects[openProjectIndex] : null
        const rowPanelId = `${idPrefix}project-row-${rowStart}`
        const tilePanelId = `${idPrefix}project-${index}`

        return (
          <Fragment key={project.title}>
            <li className={cn('rounded-2xl ring-1 ring-site-chrome/8 smooth', open ? 'bg-site-chrome/5' : 'hover:bg-site-chrome/5')}>
              <button
                type="button"
                className="flex w-full cursor-pointer flex-col items-start gap-3 p-4 text-left"
                onClick={(event) => onToggle(index, event)}
                aria-expanded={open}
                aria-controls={`${tilePanelId} ${rowPanelId}`}
              >
                <Image
                  src={project.image}
                  width={project.width}
                  height={project.height}
                  alt=""
                  className="h-10 w-full max-w-32 object-contain object-left"
                />
                <span className="min-w-0">
                  <span className="block font-semibold tracking-tight text-site-cream-fg">{project.title}</span>
                  {project.role ? <span className="mt-0.5 block text-sm text-site-cream-fg/70">{project.role[locale]}</span> : null}
                </span>
              </button>
              <div id={tilePanelId} className="sm:hidden">
                <Accordion open={open}>
                  <p className="content-m px-4 pb-4 text-site-cream-fg/80">{project.description[locale]}</p>
                </Accordion>
              </div>
            </li>
            {isRowEnd ? (
              <li id={rowPanelId} className="col-span-full hidden sm:block">
                <Accordion open={Boolean(rowProject)}>
                  <p className="content-m rounded-2xl bg-site-chrome/5 px-5 py-4 text-site-cream-fg/80 ring-1 ring-site-chrome/8">
                    {rowProject?.description[locale]}
                  </p>
                </Accordion>
              </li>
            ) : null}
          </Fragment>
        )
      })}
    </ul>
  )
}

function EmployerButton({
  item,
  index,
  selected,
  panelId,
  expanded,
  accent,
  onSelect
}: {
  item: Experience
  index: number
  selected: boolean
  panelId: string
  expanded?: boolean
  accent?: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      // Accordion headers (mobile) expose aria-expanded only; the desktop list is a set of toggle buttons.
      aria-pressed={expanded === undefined ? selected : undefined}
      aria-expanded={expanded}
      aria-controls={panelId}
      className={cn(
        'flex w-full items-center gap-4 rounded-2xl p-3 text-left smooth',
        selected && accent
          ? 'cursor-default bg-site-gold text-site-gold-fg'
          : selected
            ? 'cursor-default'
            : 'cursor-pointer hover:bg-site-chrome/5'
      )}
      onClick={onSelect}
    >
      <ExperienceLogo image={item.image} width={item.width} height={item.height} size="sm" />
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold tracking-[0.16em] text-site-cream-fg opacity-70">{padIndex(index)}</span>
        <span className="mt-0.5 block font-semibold tracking-tight text-site-cream-fg">{item.title}</span>
      </span>
      {selected && accent ? (
        // Non-colour cue for the selected employer: gold on cream alone is only 1.68:1 (WCAG 1.4.1 / 1.4.11).
        <svg
          viewBox="0 0 24 24"
          className="size-5 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      ) : null}
    </button>
  )
}

function JobBody({
  job,
  openProjectIndex,
  onProjectToggle,
  idPrefix,
  locale
}: {
  job: Experience
  openProjectIndex: number | null
  onProjectToggle: (index: number, event: MouseEvent<HTMLButtonElement>) => void
  idPrefix: string
  locale: Locale
}) {
  return (
    <>
      <p className="content-l text-site-cream-fg/80">{job.description[locale]}</p>
      {job.projects?.length ? (
        <ProjectTiles
          projects={job.projects}
          openProjectIndex={openProjectIndex}
          onToggle={onProjectToggle}
          idPrefix={idPrefix}
          locale={locale}
        />
      ) : null}
    </>
  )
}

export default function ContentExperiences() {
  const { locale, t } = useLocale()
  const [openIndex, setOpenIndex] = useState(0)
  const [openProjectIndex, setOpenProjectIndex] = useState<number | null>(null)
  const job = EXPERIENCES[openIndex]
  const splitPanelId = 'experience-split-panel'

  const handleToggle = (index: number) => {
    if (openIndex === index) return
    setOpenIndex(index)
    setOpenProjectIndex(null)
  }

  const handleProjectToggle = (projectIndex: number, event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setOpenProjectIndex(openProjectIndex === projectIndex ? null : projectIndex)
  }

  if (!job) return null

  return (
    <section id="content-experiences" className="container-full py-16 lg:py-20">
      <Animated delay={100}>
        <div>
          <div className="flex flex-col gap-4 lg:hidden">
            {EXPERIENCES.map((item, index) => {
              const selected = openIndex === index
              const panelId = `experience-accordion-${index}`

              return (
                <div key={item.title} className="rounded-2xl bg-site-cream p-4">
                  <EmployerButton
                    item={item}
                    index={index}
                    selected={selected}
                    panelId={panelId}
                    expanded={selected}
                    onSelect={() => handleToggle(index)}
                  />
                  <Accordion open={selected}>
                    <div id={panelId} className="flex flex-col gap-4 px-3 pb-3 pt-4">
                      <JobBody
                        job={item}
                        openProjectIndex={openProjectIndex}
                        onProjectToggle={handleProjectToggle}
                        idPrefix={`accordion-${index}-`}
                        locale={locale}
                      />
                    </div>
                  </Accordion>
                </div>
              )
            })}
          </div>

          <div className="hidden gap-10 lg:grid lg:grid-cols-[minmax(16rem,20rem)_1fr] lg:gap-14">
            <div
              role="group"
              aria-label={t.experience.employers}
              className="flex flex-col gap-2 rounded-2xl bg-site-cream p-4 lg:sticky lg:top-28 lg:self-start"
            >
              {EXPERIENCES.map((item, index) => (
                <EmployerButton
                  key={item.title}
                  item={item}
                  index={index}
                  selected={openIndex === index}
                  panelId={splitPanelId}
                  accent
                  onSelect={() => handleToggle(index)}
                />
              ))}
            </div>

            <div id={splitPanelId} className="flex flex-col gap-4 rounded-2xl bg-site-cream p-8 lg:gap-6">
              <div className="flex flex-col gap-10">
                <ExperienceLogo image={job.image} width={job.width} height={job.height} size="lg" />
                <h2 className="title-l min-w-0 flex-1 text-balance text-site-cream-fg">{job.title}</h2>
              </div>
              <JobBody
                job={job}
                openProjectIndex={openProjectIndex}
                onProjectToggle={handleProjectToggle}
                idPrefix="split-"
                locale={locale}
              />
            </div>
          </div>
        </div>
      </Animated>
    </section>
  )
}

import { Fragment, useState, type MouseEvent } from 'react'
import { Animated } from '~/components/elements/Animated'
import Image from '~/components/elements/Image'
import Accordion from '~/components/flex/content/Accordion'
import { EXPERIENCES, type ExperienceProject } from '~/database/experiences'
import { cn } from '~/services/utils'

const LOGO_FRAME = {
  sm: 'h-6 w-20',
  lg: 'h-16 w-44'
} as const

const LOGO_IMAGE = {
  sm: 'h-4',
  lg: 'h-12 sm:h-16'
} as const

function padIndex(index: number) {
  return String(index + 1).padStart(2, '0')
}

function ExperienceLogo({
  image,
  title,
  width,
  height,
  size = 'sm'
}: {
  image: string
  title: string
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
        alt={title}
        className={cn(LOGO_IMAGE[size], 'w-full h-auto max-w-full object-contain object-left')}
      />
    </span>
  )
}

function ProjectTiles({
  projects,
  openProjectIndex,
  onToggle
}: {
  projects: ExperienceProject[]
  openProjectIndex: number | null
  onToggle: (index: number, event: MouseEvent<HTMLButtonElement>) => void
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
        const rowPanelId = `project-row-${rowStart}`
        const tilePanelId = `project-${index}`

        return (
          <Fragment key={project.title}>
            <li
              className={cn(
                'overflow-hidden rounded-2xl ring-1 ring-site-chrome/8 smooth',
                open ? 'bg-site-chrome/5' : 'hover:bg-site-chrome/5'
              )}
            >
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
                  alt={project.title}
                  className="h-10 w-full max-w-32 object-contain object-left"
                />
                <span className="min-w-0">
                  <span className="block font-semibold tracking-tight text-site-cream-fg">{project.title}</span>
                  {project.role ? <span className="mt-0.5 block text-sm text-site-cream-fg/60">{project.role}</span> : null}
                </span>
              </button>
              <div id={tilePanelId} className="sm:hidden">
                <Accordion open={open}>
                  <p className="content-m px-4 pb-4 text-site-cream-fg/80">{project.description}</p>
                </Accordion>
              </div>
            </li>
            {isRowEnd ? (
              <li id={rowPanelId} className="col-span-full hidden sm:block">
                <Accordion open={Boolean(rowProject)}>
                  <p className="content-m rounded-2xl bg-site-chrome/5 px-5 py-4 text-site-cream-fg/80 ring-1 ring-site-chrome/8">
                    {rowProject?.description}
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

export default function ContentExperiences() {
  const [openIndex, setOpenIndex] = useState(0)
  const [openProjectIndex, setOpenProjectIndex] = useState<number | null>(null)
  const job = EXPERIENCES[openIndex]
  const panelId = 'experience-split-panel'

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
    <section id="content-experiences" className="px-6 py-16 sm:px-10 lg:px-16 lg:py-20">
      <Animated delay={100}>
        <div className="grid gap-10 lg:grid-cols-[minmax(16rem,20rem)_1fr] lg:gap-14">
          <nav aria-label="Employers" className="flex flex-col gap-2 lg:sticky lg:top-28 lg:self-start bg-site-cream rounded-2xl p-4">
            {EXPERIENCES.map((item, index) => {
              const selected = openIndex === index

              return (
                <button
                  key={item.title}
                  type="button"
                  aria-pressed={selected}
                  aria-controls={panelId}
                  className={cn(
                    'flex w-full items-center gap-4 rounded-2xl p-3 text-left smooth',
                    selected ? 'cursor-default bg-site-gold text-site-gold-fg' : 'cursor-pointer hover:bg-site-chrome/5'
                  )}
                  onClick={() => handleToggle(index)}
                >
                  <ExperienceLogo image={item.image} title={item.title} width={item.width} height={item.height} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold tracking-[0.16em] text-site-cream-fg opacity-70">{padIndex(index)}</span>
                    <span className="mt-0.5 block font-semibold tracking-tight text-site-cream-fg">{item.title}</span>
                  </span>
                </button>
              )
            })}
          </nav>

          <div id={panelId} className="flex flex-col gap-6 bg-site-cream p-8 rounded-2xl">
            <div className="flex flex-col gap-4 sm:gap-10 ">
              <ExperienceLogo image={job.image} title={job.title} width={job.width} height={job.height} size="lg" />
              <h2 className="title-l min-w-0 flex-1 text-balance text-site-cream-fg">{job.title}</h2>
            </div>
            <p className="content-l text-site-cream-fg/80">{job.description}</p>
            {job.projects?.length ? (
              <ProjectTiles projects={job.projects} openProjectIndex={openProjectIndex} onToggle={handleProjectToggle} />
            ) : null}
          </div>
        </div>
      </Animated>
    </section>
  )
}

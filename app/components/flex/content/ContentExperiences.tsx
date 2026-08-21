import { useState, type MouseEvent } from 'react'
import { Animated } from '~/components/elements/Animated'
import Image from '~/components/elements/Image'
import Accordion from '~/components/flex/content/Accordion'
import SectionCard from '~/components/elements/SectionCard'
import { EXPERIENCES, type Experience, type ExperienceProject } from '~/database/experiences'
import { cn } from '~/services/utils'

const ENTRY_DELAYS = [100, 200, 300, 400] as const

function padIndex(index: number) {
  return String(index + 1).padStart(2, '0')
}

function ExperienceLogo({
  image,
  title,
  width,
  height,
  className
}: {
  image: string
  title: string
  width: number
  height: number
  className?: string
}) {
  return (
    <span className={cn('flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-2.5', className)}>
      <Image src={image} width={width} height={height} alt={title} className="h-full w-full object-contain" />
    </span>
  )
}

function ToggleMark({ open }: { open: boolean }) {
  return (
    <span
      className={cn(
        'flex size-10 shrink-0 items-center justify-center rounded-full bg-site-gold text-xl font-medium leading-none text-site-gold-fg smooth',
        open && 'rotate-45'
      )}
      aria-hidden
    >
      +
    </span>
  )
}

function VisitLink({ href }: { href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="button-gold-outline mt-2 w-fit text-site-cream-fg">
      Visit website →<span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}

function ProjectCard({
  project,
  open,
  onToggle
}: {
  project: ExperienceProject
  open: boolean
  onToggle: (event: MouseEvent<HTMLButtonElement>) => void
}) {
  return (
    <div className={cn('overflow-hidden rounded-2xl bg-white ring-1 ring-site-chrome/8', open && 'ring-2 ring-site-gold')}>
      <button
        type="button"
        className="flex w-full items-start gap-4 p-5 text-left smooth hover:bg-site-chrome/5 sm:p-6"
        onClick={onToggle}
        aria-expanded={open}
      >
        <ExperienceLogo image={project.image} title={project.title} width={project.width} height={project.height} className="size-14" />
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-semibold tracking-tight">{project.title}</span>
          {(project.role || project.period) && (
            <span className="mt-1 block text-sm text-site-cream-fg/60">{[project.role, project.period].filter(Boolean).join(' · ')}</span>
          )}
        </span>
        <ToggleMark open={open} />
      </button>
      <Accordion open={open}>
        <div className="px-5 pb-6 sm:px-6">
          <p className="content-m text-site-cream-fg/80">{project.description}</p>
        </div>
      </Accordion>
    </div>
  )
}

function JobCard({
  job,
  index,
  open,
  openProjectIndex,
  onToggle,
  onProjectToggle
}: {
  job: Experience
  index: number
  open: boolean
  openProjectIndex: number | null
  onToggle: () => void
  onProjectToggle: (projectIndex: number, event: MouseEvent<HTMLButtonElement>) => void
}) {
  const panelId = `experience-panel-${index}`

  return (
    <article
      className={cn(
        'overflow-hidden rounded-3xl bg-site-cream text-site-cream-fg ring-1 ring-site-chrome/8',
        open && 'ring-2 ring-site-gold'
      )}
    >
      <button
        type="button"
        className={cn('flex w-full items-center gap-4 p-5 text-left sm:gap-6 sm:p-7 lg:p-8', !open && 'hover:bg-site-chrome/5 smooth')}
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span className="font-site-outfit text-sm font-semibold tracking-[0.16em] text-site-gold">{padIndex(index)}</span>
        <ExperienceLogo image={job.image} title={job.title} width={job.width} height={job.height} />
        <h3 className="title-xs min-w-0 flex-1 text-balance">{job.title}</h3>
        <ToggleMark open={open} />
      </button>
      <Accordion open={open}>
        <div id={panelId} className="flex flex-col gap-6 px-5 pb-6 sm:px-7 sm:pb-8 lg:px-8">
          <p className="content-l max-w-3xl text-site-cream-fg/80">{job.description}</p>
          {job.link ? <VisitLink href={job.link} /> : null}
          {job.projects?.length ? (
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-site-gold">Projects:</h4>
              <div className="grid gap-3 lg:grid-cols-2">
                {job.projects.map((project, projectIndex) => (
                  <ProjectCard
                    key={project.title}
                    project={project}
                    open={openProjectIndex === projectIndex}
                    onToggle={(event) => onProjectToggle(projectIndex, event)}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </Accordion>
    </article>
  )
}

export default function ContentExperiences() {
  const [openIndex, setOpenIndex] = useState(0)
  const [openProjectIndex, setOpenProjectIndex] = useState<number | null>(null)

  const handleToggle = (index: number) => {
    if (openIndex === index) return
    setOpenIndex(index)
    setOpenProjectIndex(null)
  }

  const handleProjectToggle = (projectIndex: number, event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setOpenProjectIndex(openProjectIndex === projectIndex ? null : projectIndex)
  }

  return (
    <SectionCard tone="cream" id="content-experiences" innerClassName="px-6 py-16 sm:px-10 lg:px-16 lg:py-20">
      <ul className="flex flex-col gap-4">
        {EXPERIENCES.map((job, index) => (
          <li key={job.title}>
            <Animated delay={ENTRY_DELAYS[index] ?? 400}>
              <JobCard
                job={job}
                index={index}
                open={openIndex === index}
                openProjectIndex={openIndex === index ? openProjectIndex : null}
                onToggle={() => handleToggle(index)}
                onProjectToggle={handleProjectToggle}
              />
            </Animated>
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}

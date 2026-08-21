import { useState, type MouseEvent } from 'react'
import { Animated } from '~/components/elements/Animated'
import Image from '~/components/elements/Image'
import Accordion from '~/components/flex/content/Accordion'
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
    <span
      className={cn('flex aspect-2/1 h-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white py-4 px-3', className)}
    >
      <Image src={image} width={width} height={height} alt={title} className="h-8 w-full object-contain" />
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

function ProjectRows({
  projects,
  openProjectIndex,
  onToggle
}: {
  projects: ExperienceProject[]
  openProjectIndex: number | null
  onToggle: (index: number, event: MouseEvent<HTMLButtonElement>) => void
}) {
  return (
    <div className="flex flex-col">
      {projects.map((project, index) => {
        const open = openProjectIndex === index

        return (
          <div key={project.title} className="border-t border-site-chrome/8">
            <button
              type="button"
              className="flex w-full items-center gap-3 py-3 text-left smooth hover:text-site-cyan"
              onClick={(event) => onToggle(index, event)}
              aria-expanded={open}
            >
              <ExperienceLogo
                image={project.image}
                title={project.title}
                width={project.width}
                height={project.height}
                className="h-12 w-24 rounded-lg py-3 px-2"
              />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold tracking-tight">{project.title}</span>
                {project.role ? <span className="mt-0.5 block text-sm text-site-cream-fg/60">{project.role}</span> : null}
              </span>
            </button>
            <Accordion open={open}>
              <p className="content-m pb-3 pl-[4.75rem] text-site-cream-fg/80">{project.description}</p>
            </Accordion>
          </div>
        )
      })}
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
    <article className="overflow-hidden rounded-3xl bg-site-cream text-site-cream-fg ring-1 ring-site-chrome/8">
      <button
        type="button"
        className={cn('flex w-full items-center gap-4 p-5 text-left sm:gap-6 sm:p-7 lg:p-8', !open && 'hover:bg-site-chrome/5 smooth')}
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span className="font-site-outfit text-sm font-semibold tracking-[0.16em] text-site-gold">{padIndex(index)}</span>
        <ExperienceLogo image={job.image} title={job.title} width={job.width} height={job.height} />
        <h2 className="title-xs min-w-0 flex-1 text-balance">{job.title}</h2>
        <ToggleMark open={open} />
      </button>
      <Accordion open={open}>
        <div id={panelId} className="flex flex-col gap-6 px-5 pb-6 sm:px-7 sm:pb-8 lg:px-8">
          <p className="content-l text-site-cream-fg/80">{job.description}</p>
          {job.link ? <VisitLink href={job.link} /> : null}
          {job.projects?.length ? (
            <ProjectRows projects={job.projects} openProjectIndex={openProjectIndex} onToggle={onProjectToggle} />
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
    <section id="content-experiences" className="px-6 py-16 sm:px-10 lg:px-16 lg:py-20">
      <ul className="flex flex-col gap-4 lg:mx-auto lg:max-w-4xl">
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
    </section>
  )
}

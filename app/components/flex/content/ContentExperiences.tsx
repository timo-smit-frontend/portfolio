import { useState, type MouseEvent } from 'react'
import Accordion from '~/components/flex/content/Accordion'
import Image from '~/components/elements/Image'
import { EXPERIENCES } from '~/database/experiences'
import { cn } from '~/services/utils'

const panelClass = 'list-none overflow-hidden rounded-panel bg-site-gunmetal ring-1 ring-site-mulled-wine'

function ExperienceLogo({ image, title, width, height }: { image: string; title: string; width: number; height: number }) {
  return <Image src={image} width={width} height={height} alt={title} className="h-24 w-40 bg-site-gray-nurse object-contain p-4" />
}

export default function ContentExperiences() {
  const [openIndex, setOpenIndex] = useState(0)
  const [openProjectIndex, setOpenProjectIndex] = useState<number | null>(null)

  const handleToggle = (index: number) => {
    if (openIndex !== index) {
      setOpenIndex(index)
      setOpenProjectIndex(null)
    }
  }

  const handleProjectToggle = (projectIndex: number, event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setOpenProjectIndex(openProjectIndex === projectIndex ? null : projectIndex)
  }

  return (
    <section id="content-experiences" className="section">
      <div className="container-full">
        <ul className="mx-auto flex max-w-190 flex-col gap-8">
          {EXPERIENCES.map((listItem, index) => {
            const hasProjects = Boolean(listItem.projects?.length)
            const isOpen = openIndex === index

            return (
              <li key={listItem.title} className={panelClass}>
                {hasProjects ? (
                  <>
                    <button
                      className={cn(
                        'smooth flex w-full items-center justify-between pr-8 font-semibold',
                        isOpen ? 'cursor-normal border-b border-site-mulled-wine' : 'cursor-pointer hover:bg-site-mulled-wine/20'
                      )}
                      onClick={() => handleToggle(index)}
                      aria-expanded={isOpen}
                      type="button"
                    >
                      <div className="flex items-center gap-4">
                        <ExperienceLogo image={listItem.image} title={listItem.title} width={listItem.width} height={listItem.height} />
                        <h3 className="title-xs">{listItem.title}</h3>
                      </div>
                      <span className="text-xl text-site-gray-nurse">{isOpen ? '-' : '+'}</span>
                    </button>
                    <Accordion open={isOpen}>
                      <div className="flex flex-col gap-4 border-t border-site-mulled-wine/20 p-4">
                        <p className="content-m text-site-mantle">{listItem.description}</p>
                        <div className="flex flex-col gap-4">
                          <h4 className="title-xs text-site-envy">Projects:</h4>
                          {listItem.projects?.map((project, projectIndex) => {
                            const isProjectOpen = openProjectIndex === projectIndex

                            return (
                              <div key={project.title} className={panelClass}>
                                <button
                                  className={cn(
                                    'smooth flex w-full items-center justify-between pr-4 font-semibold',
                                    isProjectOpen
                                      ? 'cursor-normal border-b border-site-mulled-wine'
                                      : 'cursor-pointer hover:bg-site-mulled-wine/20'
                                  )}
                                  onClick={(event) => handleProjectToggle(projectIndex, event)}
                                  aria-expanded={isProjectOpen}
                                  type="button"
                                >
                                  <div className="flex items-center gap-4">
                                    <ExperienceLogo
                                      image={project.image}
                                      title={project.title}
                                      width={project.width}
                                      height={project.height}
                                    />
                                    <h5 className="text-base text-site-gray-nurse">{project.title}</h5>
                                  </div>
                                  <span className="text-xl text-site-gray-nurse">{isProjectOpen ? '-' : '+'}</span>
                                </button>
                                <Accordion open={isProjectOpen}>
                                  <div className="border-t border-site-mulled-wine/20 p-4">
                                    <p className="content-m text-site-mantle">{project.description}</p>
                                  </div>
                                </Accordion>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </Accordion>
                  </>
                ) : (
                  <>
                    <button
                      className={cn(
                        'smooth flex w-full items-center justify-between pr-8 font-semibold',
                        isOpen ? 'cursor-normal border-b border-site-mulled-wine' : 'cursor-pointer hover:bg-site-mulled-wine/20'
                      )}
                      onClick={() => handleToggle(index)}
                      aria-expanded={isOpen}
                      type="button"
                    >
                      <div className="flex items-center gap-4">
                        <ExperienceLogo image={listItem.image} title={listItem.title} width={listItem.width} height={listItem.height} />
                        <h3 className="title-xs">{listItem.title}</h3>
                      </div>
                      <span className="text-xl text-site-gray-nurse">{isOpen ? '-' : '+'}</span>
                    </button>
                    <Accordion open={isOpen}>
                      <div className="flex flex-col gap-4 p-4">
                        <p className="content-m text-site-mantle">{listItem.description}</p>
                        {listItem.link && (
                          <a
                            href={listItem.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-underline mt-4 inline-block text-site-envy"
                          >
                            Visit website →
                          </a>
                        )}
                      </div>
                    </Accordion>
                  </>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

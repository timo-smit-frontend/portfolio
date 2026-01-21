import { useState } from 'react'
import EXPERIENCES from '../data/Experiences.js'
import AccordionContent from './elements/AccordionContent'

export default function ContentExperiences() {
  const [openIndex, setOpenIndex] = useState(0)
  const [openProjectIndex, setOpenProjectIndex] = useState<number | null>(null)

  const handleToggle = (index: number) => {
    if (openIndex !== index) {
      setOpenIndex(index)
      setOpenProjectIndex(null)
    }
  }

  const handleProjectToggle = (projectIndex: number, event: React.MouseEvent) => {
    event.stopPropagation()
    setOpenProjectIndex(openProjectIndex === projectIndex ? null : projectIndex)
  }

  return (
    <section className="section flex flex-col items-center">
      <div className="container">
        <div className="flex flex-col items-center gap-8">
          <h2 className="lg:text-4xl text-3xl font-bold">
            My <span>professional</span> front-end experiences
          </h2>
          <ul className="flex flex-col gap-8 max-w-190">
            {EXPERIENCES.map((listItem, index) => {
              const hasProjects = 'projects' in listItem && listItem.projects
              
              return (
                <li key={index} className="border border-[var(--white)] rounded list-none overflow-hidden">
                  {hasProjects ? (
                    <>
                      <button
                        className={`w-full pr-8 font-semibold flex items-center justify-between smooth ${
                          openIndex === index ? 'cursor-normal border-b border-white' : 'cursor-pointer hover:bg-white/20'
                        }`}
                        onClick={() => handleToggle(index)}
                        aria-expanded={openIndex === index}
                        tabIndex={0}
                        type="button"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            className="bg-white object-contain w-40 h-24 p-4"
                            src={listItem.image}
                            alt={listItem.title}
                            width={listItem.width}
                            height={listItem.height}
                          />
                          <div className="flex flex-col items-start">
                            <h3>{listItem.title}</h3>
                          </div>
                        </div>
                        <span className="text-[var(--white)] text-xl">{openIndex === index ? '-' : '+'}</span>
                      </button>
                      <AccordionContent isOpen={openIndex === index}>
                        <div className="flex flex-col gap-4 p-4 border-t border-white/20">
                          <p className="mb-4">{listItem.description}</p>
                          <div className="flex flex-col gap-4">
                            <h4 className="text-lg text-[var(--yellow)] font-semibold">Projects:</h4>
                            {listItem.projects?.map((project, projectIndex) => (
                              <div
                                key={projectIndex}
                                className="border border-[var(--white)] rounded overflow-hidden"
                              >
                                <button
                                  className={`w-full pr-4 font-semibold flex items-center justify-between smooth ${
                                    openProjectIndex === projectIndex ? 'cursor-normal border-b border-white' : 'cursor-pointer hover:bg-white/20'
                                  }`}
                                  onClick={(e) => handleProjectToggle(projectIndex, e)}
                                  aria-expanded={openProjectIndex === projectIndex}
                                  tabIndex={0}
                                  type="button"
                                >
                                  <div className="flex items-center gap-4">
                                    <img
                                      className="bg-white object-contain w-40 h-24 p-4"
                                      src={project.image}
                                      alt={project.title}
                                      width={project.width}
                                      height={project.height}
                                    />
                                    <div className="flex flex-col items-start">
                                      <h5 className="text-base text-[var(--white)]">{project.title}</h5>
                                    </div>
                                  </div>
                                  <span className="text-[var(--white)] text-xl">{openProjectIndex === projectIndex ? '-' : '+'}</span>
                                </button>
                                <AccordionContent isOpen={openProjectIndex === projectIndex}>
                                  <div className="p-4 border-t border-white/20">
                                    <p>{project.description}</p>
                                  </div>
                                </AccordionContent>
                              </div>
                            ))}
                          </div>
                        </div>
                      </AccordionContent>
                    </>
                  ) : (
                    // Regular experience item
                    <>
                      <button
                        className={`w-full pr-8 font-semibold flex items-center justify-between smooth ${
                          openIndex === index ? 'cursor-normal border-b border-white' : 'cursor-pointer hover:bg-white/20'
                        }`}
                        onClick={() => handleToggle(index)}
                        aria-expanded={openIndex === index}
                        tabIndex={0}
                        type="button"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            className="bg-white object-contain w-40 h-24 p-4"
                            src={listItem.image}
                            alt={listItem.title}
                            width={listItem.width}
                            height={listItem.height}
                          />
                          <h3>{listItem.title}</h3>
                        </div>
                        <span className="text-[var(--white)] text-xl">{openIndex === index ? '-' : '+'}</span>
                      </button>
                      <AccordionContent isOpen={openIndex === index}>
                        <div className="flex flex-col gap-4 p-4">
                          <p>{listItem.description}</p>
                          {listItem.link && (
                            <a
                              href={listItem.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block mt-4 text-[var(--yellow)] hover:underline"
                            >
                              Visit website →
                            </a>
                          )}
                        </div>
                      </AccordionContent>
                    </>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}

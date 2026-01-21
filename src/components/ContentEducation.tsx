import { useState } from 'react'
import { EDUCATIONS } from '../data/Educations'

type EducationKey = keyof typeof EDUCATIONS

export default function ContentEducation() {
  const [activeTopic, setActiveTopic] = useState<EducationKey>('accessibility')
  const education = EDUCATIONS[activeTopic]

  const handleTabClick = (topicKey: EducationKey) => setActiveTopic(topicKey)

  return (
    <section className="section flex flex-col items-center">
      <div className="container flex flex-col gap-8">
        <nav className="my-4 p-0 flex gap-2">
          {Object.entries(EDUCATIONS).map(([key, edu]) => (
            <button
              key={key}
              onClick={() => handleTabClick(key as EducationKey)}
              className={`px-4 py-2 rounded-lg border-0 font-['Roboto_Condensed',sans-serif] text-base cursor-pointer transition-all duration-200
              ${activeTopic === key ? 'bg-[var(--yellow)] text-black' : 'bg-[var(--dark-blue)] text-[var(--white)] hover:bg-[var(--dark-yellow)] hover:text-[var(--black)]'}`}
              aria-pressed={activeTopic === key}
            >
              {edu.title}
            </button>
          ))}
        </nav>

        {education && (
          <div id="tab-content" className="p-8 rounded-lg bg-[var(--dark-blue)] grid w-full grid-cols-1 md:grid-cols-2 lg:gap-20 gap-10">
            <div className="flex flex-col justify-between relative h-fit">
              <div className="flex flex-col gap-4">
                <h3 className="lg:text-3xl text-2xl font-bold">{education.title}</h3>
                <div
                  className="flex flex-col gap-4 text-[var(--white)]"
                  dangerouslySetInnerHTML={{
                    __html: education.description
                  }}
                />
              </div>
            </div>

            {education.image && <div className="flex justify-end w-full"><img className='w-full object-cover' src={education.image} alt={`${education.title} Timo Smit`} width="475" height="317" /></div>}
          </div>
        )}
      </div>
    </section>
  )
}

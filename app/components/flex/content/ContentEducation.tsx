import { useState } from 'react'
import Image from '~/components/elements/Image'
import { EDUCATIONS } from '~/database/educations'
import { cn } from '~/services/utils'

type EducationKey = keyof typeof EDUCATIONS

export default function ContentEducation() {
  const [activeTopic, setActiveTopic] = useState<EducationKey>('accessibility')
  const education = EDUCATIONS[activeTopic]

  return (
    <section className="section flex flex-col items-center">
      <div className="container flex flex-col gap-8">
        <nav className="my-4 flex gap-2 p-0">
          {Object.entries(EDUCATIONS).map(([key, edu]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTopic(key as EducationKey)}
              className={cn(
                'cursor-pointer rounded-lg border-0 px-4 py-2 text-base transition-all duration-200',
                activeTopic === key ? 'button-green' : 'bg-site-gunmetal text-site-gray-nurse hover:bg-site-mulled-wine/20'
              )}
              aria-pressed={activeTopic === key}
            >
              {edu.title}
            </button>
          ))}
        </nav>

        {education && (
          <div
            id="tab-content"
            className="grid w-full gap-10 rounded-panel bg-site-gunmetal p-8 ring-1 ring-site-mulled-wine md:grid-cols-2"
          >
            <div className="relative flex h-fit flex-col justify-between">
              <div className="flex flex-col gap-4">
                <h2 className="title-xs">{education.title}</h2>
                <div
                  className="content-m flex flex-col gap-4 text-site-mantle"
                  dangerouslySetInnerHTML={{ __html: education.description }}
                />
              </div>
            </div>

            {education.image && (
              <Image
                src={education.image}
                alt={`${education.title} Timo Smit`}
                width={475}
                height={317}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        )}
      </div>
    </section>
  )
}

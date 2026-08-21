import { useState } from 'react'
import Image from '~/components/elements/Image'
import SectionCard from '~/components/elements/SectionCard'
import { EDUCATIONS } from '~/database/educations'
import { cn } from '~/services/utils'

type EducationKey = keyof typeof EDUCATIONS

export default function ContentEducation() {
  const [activeTopic, setActiveTopic] = useState<EducationKey>('accessibility')
  const education = EDUCATIONS[activeTopic]

  return (
    <SectionCard tone="cream" innerClassName="flex flex-col gap-8 px-6 py-16 sm:px-10 lg:px-16 lg:py-20">
      <nav className="flex flex-wrap gap-2 p-0">
        {Object.entries(EDUCATIONS).map(([key, edu]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTopic(key as EducationKey)}
            className={cn(activeTopic === key ? 'button-gold' : 'button-gold-outline text-site-cream-fg', 'cursor-pointer')}
            aria-pressed={activeTopic === key}
          >
            {edu.title}
          </button>
        ))}
      </nav>

      {education && (
        <div
          id="tab-content"
          className="grid w-full gap-10 rounded-2xl bg-white p-8 text-site-cream-fg ring-1 ring-site-chrome/8 md:grid-cols-2"
        >
          <div className="relative flex h-fit flex-col justify-between">
            <div className="flex flex-col gap-4">
              <h2 className="title-xs">{education.title}</h2>
              <div
                className="content-m flex flex-col gap-4 text-site-cream-fg/80"
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
              className="h-full w-full rounded-xl object-cover"
            />
          )}
        </div>
      )}
    </SectionCard>
  )
}

import { useState } from 'react'
import Image from '~/components/elements/Image'
import { EDUCATIONS } from '~/database/educations'
import type { Locale } from '~/i18n/locale'
import { useLocale } from '~/i18n/useLocale'
import { cn } from '~/services/utils'

type EducationKey = keyof typeof EDUCATIONS
type Education = (typeof EDUCATIONS)[EducationKey]

function EducationCard({ education, locale, imageAlt }: { education: Education; locale: Locale; imageAlt: string }) {
  return (
    <div className="grid w-full gap-10 rounded-2xl bg-site-cream p-8 text-site-cream-fg ring-1 ring-site-chrome/8 md:grid-cols-2">
      <div className="relative flex h-fit flex-col justify-between">
        <div className="flex flex-col gap-4">
          <h2 className="title-xs">{education.title[locale]}</h2>
          <div
            className="content-m flex flex-col gap-4 text-site-cream-fg/80"
            dangerouslySetInnerHTML={{ __html: education.description[locale] }}
          />
        </div>
      </div>

      {education.image && (
        <Image src={education.image} alt={imageAlt} width={1200} height={800} className="h-auto w-full rounded-xl object-contain" />
      )}
    </div>
  )
}

export default function ContentEducation() {
  const { locale, t } = useLocale()
  const [activeTopic, setActiveTopic] = useState<EducationKey>('accessibility')
  const education = EDUCATIONS[activeTopic]
  // The accessibility photo carries content (a WCAG presentation); the other topics use a decorative placeholder.
  const imageAlt = (key: EducationKey) => (key === 'accessibility' ? t.education.accessibilityImageAlt : '')

  return (
    <section className="container-full flex flex-col gap-8 py-16 lg:py-20">
      <div role="group" aria-label={t.education.topics} className="hidden flex-wrap gap-2 p-0 sm:flex">
        {Object.entries(EDUCATIONS).map(([key, edu]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTopic(key as EducationKey)}
            className={cn(activeTopic === key ? 'button-gold' : 'button-gold-outline text-site-cream', 'cursor-pointer')}
            aria-pressed={activeTopic === key}
          >
            {edu.title[locale]}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-8 sm:hidden">
        {(Object.entries(EDUCATIONS) as [EducationKey, Education][]).map(([key, item]) => (
          <EducationCard key={key} education={item} locale={locale} imageAlt={imageAlt(key)} />
        ))}
      </div>

      {education && (
        <div id="tab-content" className="hidden sm:block">
          <EducationCard education={education} locale={locale} imageAlt={imageAlt(activeTopic)} />
        </div>
      )}
    </section>
  )
}

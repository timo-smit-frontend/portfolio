import { ReactNode } from 'react'
import { Animated } from '~/components/elements/Animated'
import Breadcrumbs from '~/components/elements/Breadcrumbs'
import SectionCard from '~/components/elements/SectionCard'
import useLocationFinder from '~/hooks/useLocationFinder'

export type ContentTextSection = {
  title: string
  body: ReactNode
}

export default function ContentText({
  title,
  description,
  sections,
  updated,
  id = 'content-text'
}: {
  title?: string
  description?: string
  sections?: ContentTextSection[]
  updated?: string
  id?: string
}) {
  const { ref } = useLocationFinder()
  const hasSections = Boolean(sections?.length)

  return (
    <SectionCard tone="cream" first id={id} innerClassName="px-6 pt-28 pb-16 sm:px-10 lg:px-16 lg:pt-32 lg:pb-20" sectionRef={ref}>
      <div className="flex max-w-3xl flex-col gap-8">
        <Breadcrumbs className="text-site-cream-fg/60" />
        <div className="flex flex-col gap-4 lg:gap-8">
          {(title || description) && (
            <div className="flex flex-col gap-2 lg:gap-4">
              {title && (
                <Animated delay={100}>
                  <h1 className="title-section">{title}</h1>
                </Animated>
              )}
              {description && (
                <Animated delay={200}>
                  <p className="content-l text-site-cream-fg/80">{description}</p>
                </Animated>
              )}
            </div>
          )}
          {hasSections && (
            <div className="flex flex-col gap-10 lg:gap-12">
              {sections?.map((section) => {
                const headingId = `content-text-${section.title.toLowerCase().replace(/\s+/g, '-')}`

                return (
                  <Animated key={section.title} delay={300}>
                    <section className="flex flex-col gap-3" aria-labelledby={headingId}>
                      <h2 id={headingId} className="title-xs">
                        {section.title}
                      </h2>
                      <div className="content-m text-site-cream-fg/80 [&_a]:underline [&_a]:underline-offset-4 [&_a]:transition-colors hover:[&_a]:text-site-gold">
                        {section.body}
                      </div>
                    </section>
                  </Animated>
                )
              })}
            </div>
          )}
          {updated && <p className="content-s text-site-cream-fg/60">Last updated {updated}.</p>}
        </div>
      </div>
    </SectionCard>
  )
}

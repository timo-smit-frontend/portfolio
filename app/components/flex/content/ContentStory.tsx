import { Animated } from '~/components/elements/Animated'
import Image from '~/components/elements/Image'
import { useLocale } from '~/i18n/useLocale'

const STORY_DELAYS = [100, 200, 300] as const

export default function ContentStory({ htmlParagraphs }: { htmlParagraphs: readonly string[] }) {
  const { t } = useLocale()
  return (
    <section id="content-story" className="px-6 py-16 sm:px-10 lg:px-16 lg:py-20">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-6">
          {htmlParagraphs.map((html, index) => (
            <Animated key={html.slice(0, 24)} delay={STORY_DELAYS[index] ?? 300}>
              <div className="content-l text-site-cyan-fg/80" dangerouslySetInnerHTML={{ __html: html }} />
            </Animated>
          ))}
        </div>
        <div className="relative overflow-hidden rounded-2xl lg:[&>picture]:absolute lg:[&>picture]:inset-0">
          <Animated delay={400}>
            <Image
              src="/images/timosmit.webp"
              alt={t.image.alt}
              width={4032}
              height={2005}
              maxwidth={1200}
              className="h-auto w-full rounded-2xl object-cover object-left lg:size-full"
            />
          </Animated>
        </div>
      </div>
    </section>
  )
}

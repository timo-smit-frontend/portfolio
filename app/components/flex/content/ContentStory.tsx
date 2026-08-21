import { Animated } from '~/components/elements/Animated'
import Image from '~/components/elements/Image'
import SectionCard from '~/components/elements/SectionCard'
import { SITE_IMAGE_ALT } from '~/services/imageCopy'

const STORY_DELAYS = [100, 200, 300] as const

export default function ContentStory({ htmlParagraphs }: { htmlParagraphs: string[] }) {
  return (
    <SectionCard tone="cream" id="content-story" innerClassName="px-6 py-16 sm:px-10 lg:px-16 lg:py-20">
      <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-6">
          {htmlParagraphs.map((html, index) => (
            <Animated key={html.slice(0, 24)} delay={STORY_DELAYS[index] ?? 300}>
              <div className="content-l" dangerouslySetInnerHTML={{ __html: html }} />
            </Animated>
          ))}
        </div>
        <Animated delay={400}>
          <Image
            src="/images/timosmit.webp"
            alt={SITE_IMAGE_ALT}
            width={4032}
            height={2005}
            maxwidth={1200}
            className="h-auto w-full rounded-2xl object-cover"
          />
        </Animated>
      </div>
    </SectionCard>
  )
}

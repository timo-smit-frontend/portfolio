import { Animated } from '~/components/elements/Animated'
import Breadcrumbs from '~/components/elements/Breadcrumbs'
import SectionCard from '~/components/elements/SectionCard'
import useLocationFinder from '~/hooks/useLocationFinder'

export default function BannerPage({ title, description }: { title: string; description: string }) {
  const { ref } = useLocationFinder()

  return (
    <SectionCard tone="cream" first id="banner-page" innerClassName="px-6 pt-28 pb-16 sm:px-10 lg:px-16 lg:pt-32 lg:pb-20" sectionRef={ref}>
      <div className="flex flex-col gap-8">
        <Breadcrumbs className="text-site-cream-fg/70" />
        <div className="flex max-w-3xl flex-col gap-4">
          <Animated delay={100}>
            <h1 className="title-section text-balance">{title}</h1>
          </Animated>
          <Animated delay={200}>
            <p className="content-l text-site-cream-fg/80">{description}</p>
          </Animated>
        </div>
      </div>
    </SectionCard>
  )
}

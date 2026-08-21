import { Link } from 'react-router'
import { Animated } from '~/components/elements/Animated'
import SectionCard from '~/components/elements/SectionCard'
import TraitSwapper from '~/components/elements/TraitSwapper'

export default function BannerHero() {
  return (
    <SectionCard
      tone="cream"
      first
      id="banner-hero"
      innerClassName="relative flex min-h-[calc(100dvh-1rem)] flex-col items-center justify-center px-6 pb-16 pt-28 sm:px-10 lg:px-24 lg:pt-32"
    >
      <div className="relative flex w-full max-w-5xl flex-col items-center text-center">
        <Animated delay={100}>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-site-cream-fg/70">Front-end developer at UBO Agency</p>
        </Animated>
        <h1 className="sr-only">Timo Smit is a creative Front-end Developer</h1>
        <Animated delay={200}>
          <p className="title-landing mt-5 max-w-5xl" aria-hidden="true">
            Timo Smit is a <TraitSwapper />
            <br />
            Front-end Developer!
          </p>
        </Animated>
        <Animated delay={300}>
          <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row">
            <Link to="/contact/" className="button-gold">
              Get in touch
            </Link>
            <Link to="/experience/" className="button-gold-outline text-site-cream-fg">
              Experience
            </Link>
          </div>
        </Animated>
      </div>
    </SectionCard>
  )
}

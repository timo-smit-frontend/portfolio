import { useState } from 'react'
import { Link } from 'react-router'
import { Animated } from '~/components/elements/Animated'
import MotionToggle from '~/components/elements/MotionToggle'
import SectionCard from '~/components/elements/SectionCard'
import TraitSwapper from '~/components/elements/TraitSwapper'
import { usePrefersReducedMotion } from '~/components/elements/useMediaQuery'
import { contactPath, PATHS } from '~/components/layout/nav'
import { useLocale } from '~/i18n/useLocale'

// Remembers the visitor's pause/play choice across client-side navigations (never set during SSR).
let rememberedPause: boolean | null = null

export default function BannerHero() {
  const { locale, t, localize } = useLocale()
  const prefersReducedMotion = usePrefersReducedMotion(false)
  const [userPaused, setUserPaused] = useState<boolean | null>(rememberedPause)
  // prefers-reduced-motion starts paused; the visitor can still choose to play it.
  const paused = userPaused ?? prefersReducedMotion

  const togglePaused = () => {
    rememberedPause = !paused
    setUserPaused(!paused)
  }

  return (
    <SectionCard
      tone="cream"
      first
      id="banner-hero"
      innerClassName="relative flex min-h-[calc(100dvh-1rem)] flex-col items-center justify-center px-6 pb-16 pt-28 sm:px-10 lg:px-24 lg:pt-32"
    >
      <div className="relative flex w-full max-w-5xl flex-col items-center text-center">
        <Animated reveal="load" delay={100}>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-site-cream-fg/70">{t.hero.kicker}</p>
        </Animated>
        <h1 className="sr-only">{t.hero.srTitle}</h1>
        <Animated reveal="load" delay={200}>
          <p className="title-landing mt-5 max-w-5xl wrap-anywhere max-[359px]:text-4xl" aria-hidden="true">
            {t.hero.beforeTrait}
            <TraitSwapper key={locale} traits={t.traits} paused={paused} />
            <br />
            {t.hero.afterTrait}
          </p>
        </Animated>
        <Animated reveal="load" delay={300}>
          <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row">
            <Link to={contactPath(locale)} className="button-gold">
              {t.nav.getInTouch}
            </Link>
            <Link to={localize(PATHS.experience)} className="button-gold-outline text-site-cream-fg">
              {t.nav.experience}
            </Link>
          </div>
        </Animated>
      </div>
      {/* Only shown where the typing animation runs (see TRAIT_ANIMATION_QUERY in TraitSwapper). */}
      <MotionToggle
        paused={paused}
        onToggle={togglePaused}
        pauseLabel={t.motion.pauseTraits}
        playLabel={t.motion.playTraits}
        className="absolute bottom-4 right-4 hidden min-[800px]:inline-flex sm:bottom-6 sm:right-6"
      />
    </SectionCard>
  )
}

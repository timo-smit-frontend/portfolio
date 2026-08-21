import { Link } from 'react-router'
import { Animated } from '~/components/elements/Animated'
import SectionCard from '~/components/elements/SectionCard'
import TraitSwapper from '~/components/elements/TraitSwapper'
import { contactPath, PATHS } from '~/components/layout/nav'
import { useLocale } from '~/i18n/useLocale'

export default function BannerHero() {
  const { locale, t, localize } = useLocale()

  return (
    <SectionCard
      tone="cream"
      first
      id="banner-hero"
      innerClassName="relative flex min-h-[calc(100dvh-1rem)] flex-col items-center justify-center px-6 pb-16 pt-28 sm:px-10 lg:px-24 lg:pt-32"
    >
      <div className="relative flex w-full max-w-5xl flex-col items-center text-center">
        <Animated delay={100}>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-site-cream-fg/70">{t.hero.kicker}</p>
        </Animated>
        <h1 className="sr-only">{t.hero.srTitle}</h1>
        <Animated delay={200}>
          <p className="title-landing mt-5 max-w-5xl" aria-hidden="true">
            {t.hero.beforeTrait}
            <TraitSwapper key={locale} traits={t.traits} />
            <br />
            {t.hero.afterTrait}
          </p>
        </Animated>
        <Animated delay={300}>
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
    </SectionCard>
  )
}

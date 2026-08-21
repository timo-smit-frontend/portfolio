import { Link } from 'react-router'
import { Animated } from '~/components/elements/Animated'
import { homePath } from '~/components/layout/nav'
import { useLocale } from '~/i18n/useLocale'

export default function ErrorPage() {
  const { locale, t } = useLocale()

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center bg-site-chrome py-16 text-site-cyan-fg sm:py-24 lg:py-32"
      aria-labelledby="error-title"
    >
      <div className="container-full">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <Animated delay={100}>
            <p className="title-xl text-site-gold">404</p>
          </Animated>
          <Animated delay={200}>
            <h1 id="error-title" className="title-l">
              {t.error.title}
            </h1>
          </Animated>
          <Animated delay={300}>
            <p className="content-l text-site-cyan-fg/80">{t.error.description}</p>
          </Animated>
          <Animated delay={400}>
            <Link to={homePath(locale)} className="button-gold mt-2">
              {t.error.back}
            </Link>
          </Animated>
        </div>
      </div>
    </main>
  )
}

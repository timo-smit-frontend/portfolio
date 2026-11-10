import { Link } from 'react-router'
import SkipToMainContent from '~/components/elements/SkipToMainContent'
import { homePath } from '~/components/layout/nav'
import PixelSprite from '~/game/PixelSprite'
import { HERO_FRAMES, HERO_PALETTE } from '~/game/sprites'
import { useLocale } from '~/i18n/useLocale'

export default function ErrorPage() {
  const { locale, t } = useLocale()

  return (
    <>
      <SkipToMainContent />
      <main
        id="main"
        tabIndex={-1}
        className="flex min-h-dvh flex-col items-center justify-center bg-[radial-gradient(ellipse_at_50%_35%,#123a44_0%,#081d23_70%)] px-4 py-16"
        aria-labelledby="error-title"
      >
        <div className="flex w-full max-w-xl flex-col items-center gap-6">
          {/* The player has walked off the edge of the map. */}
          <div aria-hidden className="flex items-end gap-2">
            <PixelSprite rows={HERO_FRAMES.up[0]!} palette={HERO_PALETTE} scale={6} />
            <span className="arcade animate-px-bob pb-20 text-2xl text-site-gold">!</span>
          </div>
          <div className="pixel-drop w-full">
            <div className="panel enter-window flex flex-col items-center gap-4 px-6 py-8 text-center sm:px-10">
              <p className="eyebrow">404 · {t.game.notFound}</p>
              <h1 id="error-title" className="heading text-3xl">
                {t.error.title}
              </h1>
              <p className="prose-panel">{t.error.description}</p>
              <Link to={homePath(locale)} className="button-gold mt-2">
                {t.game.backToTown}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

import BannerHero from '~/components/flex/banner/BannerHero'
import ContentCta from '~/components/flex/content/ContentCta'
import ContentLogos from '~/components/flex/content/ContentLogos'
import ContentStory from '~/components/flex/content/ContentStory'
import { contactPath } from '~/components/layout/nav'
import { useLocale } from '~/i18n/useLocale'

export default function Home() {
  const { locale, t } = useLocale()

  return (
    <>
      <BannerHero />
      <ContentStory htmlParagraphs={t.story.paragraphs} />
      <ContentLogos />
      <ContentCta title={t.cta.title} description={t.cta.description} link={{ url: contactPath(locale), title: t.nav.getInTouch }} />
    </>
  )
}

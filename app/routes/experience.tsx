import BannerPage from '~/components/flex/banner/BannerPage'
import ContentExperiences from '~/components/flex/content/ContentExperiences'
import { useLocale } from '~/i18n/useLocale'

export default function Experience() {
  const { t } = useLocale()

  return (
    <>
      <BannerPage title={t.experience.title} description={t.experience.description} />
      <ContentExperiences />
    </>
  )
}

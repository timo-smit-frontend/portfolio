import BannerPage from '~/components/flex/banner/BannerPage'
import ContentEducation from '~/components/flex/content/ContentEducation'
import { useLocale } from '~/i18n/useLocale'

export default function Education() {
  const { t } = useLocale()

  return (
    <>
      <BannerPage title={t.education.title} description={t.education.description} />
      <ContentEducation />
    </>
  )
}

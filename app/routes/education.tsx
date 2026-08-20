import BannerFigcaption from '~/components/flex/banner/BannerFigcaption'
import ContentEducation from '~/components/flex/content/ContentEducation'

export default function Education() {
  return (
    <>
      <BannerFigcaption
        title="Education"
        description="Accessibility, consultancy, creative development, and React / Next.js."
        image="/images/timosmit.webp"
      />
      <ContentEducation />
    </>
  )
}

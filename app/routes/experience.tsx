import BannerFigcaption from '~/components/flex/banner/BannerFigcaption'
import ContentExperiences from '~/components/flex/content/ContentExperiences'

export default function Experience() {
  return (
    <>
      <BannerFigcaption
        title="My professional front-end experiences"
        description="UBO Agency, Capgemini, Accent Interactive, and SmartHOTEL."
        image="/images/timosmit.webp"
      />
      <ContentExperiences />
    </>
  )
}

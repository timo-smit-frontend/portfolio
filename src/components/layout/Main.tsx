import ContentExperiences from '../ContentExperiences'
import ContentEducation from '../ContentEducation'
import ContentIntro from '../ContentIntro'

export default function Main() {
  return (
    <main id="main" className="container max-w-500 mx-auto">
      <ContentIntro />
      <ContentExperiences />
      <ContentEducation />
    </main>
  )
}

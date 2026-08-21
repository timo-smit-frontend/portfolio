import { Link } from 'react-router'
import { Animated } from '~/components/elements/Animated'

export default function ContentCta({
  title,
  description,
  link
}: {
  title?: string
  description?: string
  link?: { url?: string; title?: string }
}) {
  return (
    <section id="content-cta" className="flex flex-col items-center px-6 py-16 text-center sm:px-10 lg:px-16 lg:py-20">
      <div className="flex max-w-2xl flex-col items-center gap-4 lg:gap-6">
        {title && (
          <Animated delay={100}>
            <h2 className="title-section">{title}</h2>
          </Animated>
        )}
        {description && (
          <Animated delay={200}>
            <p className="content-l text-site-cyan-fg/80">{description}</p>
          </Animated>
        )}
        {link?.url && link?.title && (
          <Animated delay={300}>
            <Link to={link.url} className="button-gold">
              {link.title}
            </Link>
          </Animated>
        )}
      </div>
    </section>
  )
}

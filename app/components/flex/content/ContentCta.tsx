import { Link } from 'react-router'
import { Animated } from '~/components/elements/Animated'
import Image from '~/components/elements/Image'
import { SITE_IMAGE_ALT } from '~/services/imageCopy'

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
        <Animated>
          <div className="size-28 overflow-hidden rounded-full ring-2 ring-site-cyan-fg/15 sm:size-32">
            <Image
              src="/images/timosmit-headshot.png"
              alt={SITE_IMAGE_ALT}
              width={400}
              height={400}
              maxwidth={400}
              sizes="8rem"
              className="size-full rounded-full object-cover"
            />
          </div>
        </Animated>
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

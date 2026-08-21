import { Animated } from '~/components/elements/Animated'
import Image from '~/components/elements/Image'
import SectionCard from '~/components/elements/SectionCard'

const LOGOS = [
  { src: '/images/logo/ubo.png', title: 'UBO Agency', width: 310, height: 163 },
  { src: '/images/logo/capgemini.svg', title: 'Capgemini', width: 1024, height: 239 },
  { src: '/images/logo/wfp.webp', title: 'World Food Programme', width: 360, height: 167 },
  { src: '/images/logo/tweede-kamer.jpg', title: 'Tweede Kamer der Staten-Generaal', width: 1200, height: 339 },
  { src: '/images/logo/accent-interactive.jpeg', title: 'Accent Interactive', width: 4500, height: 1458 },
  { src: '/images/logo/smart-hotel.jpg', title: 'SmartHOTEL', width: 1000, height: 215 }
]

export default function ContentLogos() {
  return (
    <SectionCard tone="cream" id="content-logos" innerClassName="px-6 py-12 sm:px-10 lg:px-16 lg:py-16">
      <div className="flex flex-col items-center gap-8">
        <Animated delay={100}>
          <p className="text-center text-sm font-semibold uppercase tracking-[0.16em] text-site-cream-fg/60">Places I’ve shipped for.</p>
        </Animated>
        <ul className="flex w-full flex-wrap items-center justify-center gap-8 sm:gap-12">
          {LOGOS.map((logo) => (
            <li key={logo.src} className="flex h-14 items-center sm:h-16">
              <Image
                src={logo.src}
                alt={logo.title}
                width={logo.width}
                height={logo.height}
                className="h-full w-auto max-w-36 object-contain sm:max-w-44"
              />
            </li>
          ))}
        </ul>
      </div>
    </SectionCard>
  )
}

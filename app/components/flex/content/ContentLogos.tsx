import AutoScroll from 'embla-carousel-auto-scroll'
import { useMemo, useSyncExternalStore } from 'react'
import { Animated } from '~/components/elements/Animated'
import { Carousel, CarouselContent, CarouselItem } from '~/components/elements/Carousel'
import Image from '~/components/elements/Image'
import SectionCard from '~/components/elements/SectionCard'

const LOGOS = [
  { src: '/images/logo/ubo.png', title: 'UBO Agency', width: 310, height: 163 },
  { src: '/images/logo/casio.svg', title: 'Casio', width: 177, height: 32 },
  { src: '/images/logo/fairbanks.svg', title: 'Fairbanks', width: 158, height: 31 },
  { src: '/images/logo/movimento.svg', title: 'Movimento', width: 178, height: 34 },
  { src: '/images/logo/brouwer-metaal.svg', title: 'Brouwer Metaal', width: 294, height: 35 },
  { src: '/images/logo/im-duurzaam.svg', title: 'IM Duurzaam', width: 473, height: 380 },
  { src: '/images/logo/profield.svg', title: 'Profield', width: 845, height: 178 },
  { src: '/images/logo/capgemini.svg', title: 'Capgemini', width: 1024, height: 239 },
  { src: '/images/logo/wfp.webp', title: 'World Food Programme', width: 360, height: 167 },
  { src: '/images/logo/tweede-kamer.png', title: 'Tweede Kamer der Staten-Generaal', width: 1200, height: 339 },
  { src: '/images/logo/accent-interactive.png', title: 'Accent Interactive', width: 4500, height: 1458 },
  { src: '/images/logo/smart-hotel.png', title: 'SmartHOTEL', width: 1000, height: 215 }
]

const reduceMotionQuery = '(prefers-reduced-motion: reduce)'

function subscribeReducedMotion(onStoreChange: () => void) {
  const media = window.matchMedia(reduceMotionQuery)
  media.addEventListener('change', onStoreChange)
  return () => media.removeEventListener('change', onStoreChange)
}

function getReducedMotionSnapshot() {
  return window.matchMedia(reduceMotionQuery).matches
}

const LOGO_SIZES = '(min-width: 640px) 11rem, 9rem'

function LogoSlide({ logo, decorative = false }: { logo: (typeof LOGOS)[number]; decorative?: boolean }) {
  return (
    <CarouselItem className="flex h-14 shrink-0 items-center px-8 sm:h-16 sm:px-12" aria-hidden={decorative || undefined}>
      <span className="flex h-14 w-36 items-center justify-center sm:h-16 sm:w-44">
        <Image
          src={logo.src}
          alt={decorative ? '' : logo.title}
          width={logo.width}
          height={logo.height}
          sizes={LOGO_SIZES}
          className="h-14 w-auto max-h-full max-w-full object-contain sm:h-16"
        />
      </span>
    </CarouselItem>
  )
}

export default function ContentLogos() {
  const prefersReducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotionSnapshot, () => true)
  const autoScroll = useMemo(
    () =>
      AutoScroll({
        speed: 0.5,
        startDelay: 0,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        stopOnFocusIn: true,
        rootNode: (emblaRoot) => emblaRoot.parentElement
      }),
    []
  )

  return (
    <SectionCard tone="cream" id="content-logos" innerClassName="py-12 lg:py-16">
      <div className="flex flex-col items-center gap-8">
        <Animated delay={100}>
          <p className="px-6 text-center text-sm font-semibold uppercase tracking-[0.16em] text-site-cream-fg/60 sm:px-10 lg:px-16">
            Places I’ve worked for.
          </p>
        </Animated>
        {prefersReducedMotion ? (
          <ul className="flex w-full flex-wrap items-center justify-center gap-12 px-6 sm:gap-16 sm:px-10 lg:px-16">
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
        ) : (
          <Carousel
            opts={{ loop: true, align: 'start', dragFree: true }}
            plugins={[autoScroll]}
            aria-label="Places I’ve worked for"
            className="w-full [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
          >
            <CarouselContent>
              {LOGOS.map((logo) => (
                <LogoSlide key={logo.src} logo={logo} />
              ))}
              {LOGOS.map((logo) => (
                <LogoSlide key={`${logo.src}-loop`} logo={logo} decorative />
              ))}
            </CarouselContent>
          </Carousel>
        )}
      </div>
    </SectionCard>
  )
}

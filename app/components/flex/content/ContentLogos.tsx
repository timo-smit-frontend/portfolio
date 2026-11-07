import AutoScroll from 'embla-carousel-auto-scroll'
import { useEffect, useMemo, useState } from 'react'
import { Animated } from '~/components/elements/Animated'
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '~/components/elements/Carousel'
import Image from '~/components/elements/Image'
import MotionToggle from '~/components/elements/MotionToggle'
import SectionCard from '~/components/elements/SectionCard'
import { usePrefersReducedMotion } from '~/components/elements/useMediaQuery'
import { useLocale } from '~/i18n/useLocale'

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

const TITLE_ID = 'content-logos-title'

// Remembers the visitor's pause/play choice across client-side navigations (never set during SSR).
let rememberedPause = false

export default function ContentLogos() {
  const { t } = useLocale()
  // Server and hydration render the static list (true); the moving strip only mounts on clients that allow motion.
  const prefersReducedMotion = usePrefersReducedMotion(true)
  const [api, setApi] = useState<CarouselApi>()
  const [paused, setPaused] = useState(rememberedPause)
  const [hovered, setHovered] = useState(false)
  const [resumeSignal, setResumeSignal] = useState(0)
  const autoScroll = useMemo(
    () =>
      AutoScroll({
        speed: 0.5,
        startDelay: 0,
        // Play/stop is driven by the effect below so the pause button always wins over hover/drag resumes.
        playOnInit: false,
        stopOnInteraction: true,
        stopOnMouseEnter: false,
        stopOnFocusIn: false
      }),
    []
  )

  useEffect(() => {
    if (!api) return

    const root = api.rootNode().parentElement ?? api.rootNode()
    const onEnter = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') setHovered(true)
    }
    const onLeave = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') setHovered(false)
    }
    // A drag stops the plugin; resume once it has settled, and after embla re-inits on resize.
    const onResume = () => setResumeSignal((count) => count + 1)

    root.addEventListener('pointerenter', onEnter)
    root.addEventListener('pointerleave', onLeave)
    api.on('settle', onResume).on('reInit', onResume)

    return () => {
      root.removeEventListener('pointerenter', onEnter)
      root.removeEventListener('pointerleave', onLeave)
      api.off('settle', onResume).off('reInit', onResume)
    }
  }, [api])

  useEffect(() => {
    const plugin = api?.plugins().autoScroll
    if (!plugin) return

    if (paused || hovered) plugin.stop()
    else if (!plugin.isPlaying()) plugin.play()
  }, [api, paused, hovered, resumeSignal])

  const togglePaused = () => {
    rememberedPause = !paused
    setPaused(!paused)
  }

  return (
    <SectionCard tone="cream" id="content-logos" innerClassName="relative py-12 lg:py-16">
      <div className="flex flex-col items-center gap-8">
        <Animated delay={100}>
          <h2
            id={TITLE_ID}
            className="px-6 text-center text-sm font-semibold uppercase tracking-[0.16em] text-site-cream-fg/70 sm:px-10 lg:px-16"
          >
            {t.logos.label}
          </h2>
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
            setApi={setApi}
            aria-labelledby={TITLE_ID}
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
      {prefersReducedMotion ? null : (
        <MotionToggle
          paused={paused}
          onToggle={togglePaused}
          pauseLabel={t.motion.pauseLogos}
          playLabel={t.motion.playLogos}
          className="absolute bottom-2 right-2 size-8 sm:bottom-3 sm:right-3 lg:bottom-4 lg:right-4 lg:size-10"
        />
      )}
    </SectionCard>
  )
}

import Image from '~/components/elements/Image'
import TraitSwapper from '~/components/elements/TraitSwapper'

export default function BannerOverlay() {
  return (
    <section id="banner-overlay" className="relative h-screen overflow-hidden bg-site-dark">
      <div className="absolute inset-0 [&_img]:h-full [&_img]:max-h-none [&_img]:w-full [&_picture]:h-full [&_picture]:w-full" aria-hidden>
        <Image
          src="/images/timosmit.webp"
          alt=""
          width={4032}
          height={2005}
          priority
          maxwidth={1600}
          sizes="100vw"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="relative flex h-full flex-col">
        <div className="container-full flex flex-1 items-center justify-center">
          <h1 className="title-l max-w-5xl text-center text-balance text-site-gray-nurse">
            <span className="sr-only">Timo Smit, Front-end Developer. </span>
            Timo Smit is a <TraitSwapper /> Front-end Developer!
          </h1>
        </div>
      </div>
    </section>
  )
}

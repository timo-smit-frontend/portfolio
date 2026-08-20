import Image from '~/components/elements/Image'

export default function Logo({ className, variant = 'header' }: { className?: string; variant?: 'header' | 'footer' }) {
  const src = variant === 'footer' ? '/images/logo/ts_logo_2.png' : '/images/logo/ts_logo.png'

  return <Image src={src} alt="" width={300} height={300} className={className} />
}

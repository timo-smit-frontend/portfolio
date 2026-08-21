import { cn } from '~/services/utils'

export default function Logo({
  className,
  variant = 'default',
  tone = 'cream'
}: {
  className?: string
  variant?: 'default' | 'simplified'
  tone?: 'cream' | 'cyan'
}) {
  return (
    <svg
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(tone === 'cyan' ? 'text-site-cyan-fg' : 'text-site-cyan', className)}
      aria-hidden
    >
      {variant === 'simplified' ? (
        <>
          <path d="M0 0H88V24.0001H0V0Z" fill="currentColor" />
          <path d="M32 8.00003H56V100H32V8.00003Z" fill="currentColor" />
          <path d="M64 32.0001H128V52.8698H64V32.0001Z" fill="currentColor" />
          <path d="M64 107.13H128V128H64V107.13Z" fill="currentColor" />
          <path d="M108.336 69.5657H127.999L128 107.13L108.336 107.131V69.5657Z" fill="currentColor" />
          <path d="M64 52.8698L81.7349 52.8693V69.5651H64V52.8698Z" fill="currentColor" />
          <path d="M64 69.5651L116.434 69.5657V90.4354H64V69.5651Z" fill="currentColor" />
        </>
      ) : (
        <>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M84.48 13.7846H113.231V55.1385H84.48V13.7846ZM93.1399 22.7746H104.571V46.1485H93.1399V22.7746Z"
            fill="currentColor"
          />
          <path d="M31.7046 13.7846H41.5508V55.1385H31.7046V13.7846Z" fill="currentColor" />
          <path
            d="M43.52 72.8615H14.7692V98.0677H34.6585V105.157H14.7692V114.215H43.52V89.0092H22.7446V81.92H43.52V72.8615Z"
            fill="currentColor"
          />
          <path
            d="M46.4738 13.7846H55.2725L63.0154 27.4494L70.7582 13.7846H79.5569V55.1385H70.7582V31.5847L66.5349 39.3161H59.5839L55.2725 31.5847V55.1385H46.4738V13.7846Z"
            fill="currentColor"
          />
          <path
            d="M48.4431 72.8615H57.2418L64.9846 86.5263L72.7275 72.8615H81.5262V114.215H72.7275V90.6617L68.5041 98.393H61.5531L57.2418 90.6617V114.215H48.4431V72.8615Z"
            fill="currentColor"
          />
          <path d="M86.4492 72.8615H96.2954V114.215H86.4492V72.8615Z" fill="currentColor" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0 0H128V128H0V0ZM9.84615 59.0769V9.84615H16.9354V55.1385H26.7815V9.84615H118.154V59.0769H9.84615ZM9.84615 118.154V68.9231H101.218V114.215H111.065V68.9231H118.154V118.154H9.84615Z"
            fill="currentColor"
          />
        </>
      )}
    </svg>
  )
}

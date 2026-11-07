import { Link } from 'react-router'
import { LOCALES, LOCALE_META } from '~/i18n/locale'
import { useLocale } from '~/i18n/useLocale'
import { cn } from '~/services/utils'

// Full class names (no template strings) so Tailwind generates them.
// Inactive /70: 6.37:1 on cream (5.79:1 on the translucent sticky header) and 7.53:1 on the dark mobile menu.
const TONE = {
  cream: {
    current: 'text-site-cream-fg',
    inactive: 'text-site-cream-fg/70',
    hover: 'hover:text-site-gold-ink',
    separator: 'text-site-cream-fg/35'
  },
  cyan: {
    current: 'text-site-cyan-fg',
    inactive: 'text-site-cyan-fg/70',
    hover: 'hover:text-site-gold',
    separator: 'text-site-cyan-fg/35'
  }
} as const

export default function LanguageSwitch({ className, tone = 'cream' }: { className?: string; tone?: 'cream' | 'cyan' }) {
  const { locale, t, switchTo } = useLocale()
  const colors = TONE[tone]

  return (
    <nav aria-label={t.lang.switch} className={className}>
      <ul className="flex items-center gap-1 text-sm font-semibold tracking-[0.08em]">
        {LOCALES.map((item, index) => {
          const current = item === locale
          const meta = LOCALE_META[item]

          return (
            <li key={item} className="flex items-center gap-1">
              {index > 0 ? (
                <span aria-hidden className={cn('px-0.5', colors.separator)}>
                  /
                </span>
              ) : null}
              <Link
                to={switchTo(item)}
                lang={meta.html}
                hrefLang={meta.hrefLang}
                aria-current={current ? 'true' : undefined}
                className={cn(
                  'rounded-full px-1.5 py-1 smooth',
                  colors.hover,
                  // Underline marks the current language without relying on colour alone (WCAG 1.4.1).
                  current ? [colors.current, 'underline decoration-2 underline-offset-4'] : colors.inactive
                )}
              >
                {meta.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

import { Link } from 'react-router'
import { LOCALES, LOCALE_META } from '~/i18n/locale'
import { useLocale } from '~/i18n/useLocale'
import { cn } from '~/services/utils'

export default function LanguageSwitch({
  className,
  tone = 'cream'
}: {
  className?: string
  tone?: 'cream' | 'cyan'
}) {
  const { locale, t, switchTo } = useLocale()

  return (
    <nav aria-label={t.lang.switch} className={className}>
      <ul className="flex items-center gap-1 text-sm font-semibold tracking-[0.08em]">
        {LOCALES.map((item, index) => {
          const current = item === locale
          const meta = LOCALE_META[item]
          const fg = tone === 'cyan' ? 'text-site-cyan-fg' : 'text-site-cream-fg'

          return (
            <li key={item} className="flex items-center gap-1">
              {index > 0 ? (
                <span aria-hidden className={cn('px-0.5', tone === 'cyan' ? 'text-site-cyan-fg/35' : 'text-site-cream-fg/35')}>
                  /
                </span>
              ) : null}
              <Link
                to={switchTo(item)}
                lang={meta.html}
                hrefLang={meta.hrefLang}
                aria-current={current ? 'true' : undefined}
                className={cn(
                  'rounded-full px-1.5 py-1 smooth hover:text-site-gold',
                  current ? fg : `${fg}/50`
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

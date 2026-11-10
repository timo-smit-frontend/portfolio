import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { Tooltip } from '~/components/elements/Tooltip'
import { LOCALES, LOCALE_META, type Locale } from '~/i18n/locale'
import { useLocale } from '~/i18n/useLocale'

/** A language chosen here wins over the default by location (functions/_middleware.ts reads this cookie). */
function rememberLanguage(locale: Locale) {
  document.cookie = `ts-lang=${locale}; path=/; max-age=31536000; samesite=lax; secure`
}

/**
 * The language just picked here. The link you clicked turns into the plain "current language" tile, so focus
 * would drop to the page; the new tile takes it instead, and keyboard players keep their place (WCAG 2.4.3).
 */
let focusAfterSwitch: Locale | null = null

export default function LanguageSwitch({ className }: { className?: string }) {
  const { locale, t, switchTo } = useLocale()
  const currentRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (focusAfterSwitch !== locale || !currentRef.current?.offsetParent) return
    focusAfterSwitch = null
    currentRef.current.focus({ preventScroll: true })
  }, [locale])

  return (
    <nav aria-label={t.lang.switch} className={className}>
      <ul className="flex items-center gap-1">
        {LOCALES.map((item) => {
          const current = item === locale
          const meta = LOCALE_META[item]

          return (
            <li key={item}>
              {current ? (
                // The language you are reading is not a link (nothing to switch to): a filled gold tile, so it
                // is told apart by fill and shape, not colour alone (WCAG 1.4.1).
                <span
                  ref={currentRef}
                  tabIndex={-1}
                  aria-current="true"
                  lang={meta.html}
                  className="tile arcade inline-flex min-h-10 min-w-10 cursor-default items-center justify-center px-2 text-[0.55rem]"
                >
                  {meta.label}
                </span>
              ) : (
                <Tooltip label={meta.name} hint={meta.switchHint} lang={meta.html}>
                  <Link
                    to={switchTo(item)}
                    onClick={() => {
                      rememberLanguage(item)
                      focusAfterSwitch = item
                    }}
                    lang={meta.html}
                    hrefLang={meta.hrefLang}
                    className="tile arcade inline-flex min-h-10 min-w-10 items-center justify-center px-2 text-[0.55rem]"
                  >
                    {meta.label}
                  </Link>
                </Tooltip>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

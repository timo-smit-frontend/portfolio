import { Link, useLocation } from 'react-router'
import Logo from '~/components/elements/Logo'
import { FOOTER_NAV } from '~/components/layout/nav'
import { SITE_NAME, isCurrentPath } from '~/seo/site'
import { LINKEDIN_URL } from '~/services/contact'

export default function Footer() {
  const location = useLocation()

  return (
    <footer className="pb-2 text-site-cream-fg">
      <div className="container-full">
        <div className="overflow-clip rounded-4xl bg-site-cream px-6 py-12 sm:px-10 lg:px-16 lg:py-16">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-24">
            <Link to="/" className="block w-fit transition-opacity hover:opacity-80" aria-label={SITE_NAME}>
              <Logo className="h-12 w-auto" tone="cream" />
            </Link>

            <div className="grid gap-10 sm:grid-cols-2 sm:gap-16">
              <nav aria-label="Footer menu">
                <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-site-cream-fg/55">Menu</h2>
                <ul className="mt-4 flex flex-col gap-3 text-base font-medium leading-7">
                  {FOOTER_NAV.map((item) => (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className="link-underline transition-colors hover:text-site-gold aria-[current=page]:text-site-gold"
                        aria-current={isCurrentPath(location.pathname, item.to) ? 'page' : undefined}
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-site-cream-fg/55">Follow me</h2>
                <ul className="mt-4 flex flex-col gap-3 text-base font-medium leading-7">
                  <li>
                    <a
                      href={LINKEDIN_URL}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="group flex w-fit items-center gap-2 transition-colors hover:text-site-gold"
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor" aria-hidden>
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                        <rect width="4" height="12" x="2" y="9" />
                        <circle cx="4" cy="4" r="2" />
                      </svg>
                      <span className="link-underline">LinkedIn</span>
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

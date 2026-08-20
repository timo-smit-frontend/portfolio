import { Link, useLocation } from 'react-router'
import Logo from '~/components/elements/Logo'
import { SITE_NAME, isCurrentPath } from '~/seo/site'
import { LINKEDIN_URL } from '~/services/contact'

const FOOTER_MENU = [
  { title: 'Experience', to: '/experience/' },
  { title: 'Education', to: '/education/' },
  { title: 'Contact', to: '/contact/' }
]

export default function Footer() {
  const location = useLocation()

  return (
    <footer className="max-lg:border-t border-site-mulled-wine max-lg:pt-8 pb-16 text-site-gray-nurse lg:pb-24">
      <div className="container-full">
        <div className="grid gap-14 lg:grid-cols-[minmax(180px,1fr)_auto] lg:items-start lg:gap-24 xl:gap-40">
          <Link to="/" className="block w-fit transition-opacity hover:opacity-80" aria-label={SITE_NAME}>
            <Logo variant="footer" className="h-auto w-40 sm:w-46 lg:w-54" />
          </Link>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(150px,211px)_auto] lg:gap-8 xl:gap-16">
            <nav aria-label="Footer menu" className="hidden lg:block">
              <h2 className="text-lg font-bold leading-7">Menu</h2>
              <ul className="mt-4 flex flex-col sm:gap-2 gap-6 text-base font-medium leading-7">
                {FOOTER_MENU.map((item) => (
                  <li key={item.to} className="min-w-60">
                    <Link
                      to={item.to}
                      className="link-underline transition-colors hover:text-site-envy aria-[current=page]:text-site-envy"
                      aria-current={isCurrentPath(location.pathname, item.to) ? 'page' : undefined}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="min-w-60">
              <h2 className="text-lg font-bold leading-7">Follow</h2>
              <ul className="mt-4 flex flex-col sm:gap-2 gap-6 text-base font-medium leading-7">
                <li>
                  <a
                    href={LINKEDIN_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group flex w-fit items-center gap-2 transition-colors hover:text-site-envy"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
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

        <div className="mt-16 flex flex-col gap-4 border-t border-site-mulled-wine pt-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base font-medium leading-7">© {new Date().getFullYear()} Timo Smit. All rights reserved.</p>
          <Link
            to="/privacy/"
            className="link-underline w-fit text-base font-medium leading-7 transition-colors hover:text-site-envy aria-[current=page]:text-site-envy"
            aria-current={isCurrentPath(location.pathname, '/privacy/') ? 'page' : undefined}
          >
            Privacy statement
          </Link>
        </div>
      </div>
    </footer>
  )
}

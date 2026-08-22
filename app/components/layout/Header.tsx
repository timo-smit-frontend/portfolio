import * as SheetPrimitive from '@radix-ui/react-dialog'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import BurgerMenu from '~/components/elements/BurgerMenu'
import Logo from '~/components/elements/Logo'
import LanguageSwitch from '~/components/layout/LanguageSwitch'
import { contactPath, homePath, primaryNav } from '~/components/layout/nav'
import { useLocale } from '~/i18n/useLocale'
import { SITE_NAME, isCurrentPath } from '~/seo/site'
import { cn } from '~/services/utils'

const navLinkClass =
  'inline-flex items-center rounded-full px-3 py-1.5 text-base font-medium smooth hover:bg-site-cream-fg/10 aria-[current=page]:bg-site-cream-fg/15'
const mobileNavLinkClass = 'mobile-menu-hover title-base flex w-full items-center px-0 py-2 text-2xl sm:text-3xl lg:text-4xl'

function MobileNavLink({ to, pathname, onNavigate, children }: { to: string; pathname: string; onNavigate: () => void; children: string }) {
  const current = isCurrentPath(pathname, to)

  return (
    <Link
      to={to}
      className={cn(mobileNavLinkClass, current && 'text-site-gold')}
      aria-current={current ? 'page' : undefined}
      onClick={onNavigate}
    >
      {children}
    </Link>
  )
}

function MobileMenuSheet({ open, onOpenChange, pathname }: { open: boolean; onOpenChange: (open: boolean) => void; pathname: string }) {
  const [iconOpen, setIconOpen] = useState(false)
  const { locale, t } = useLocale()
  const nav = primaryNav(locale)
  const home = homePath(locale)
  const contact = contactPath(locale)

  useEffect(() => {
    if (!open) {
      setIconOpen(false)
      return
    }

    const frame = requestAnimationFrame(() => setIconOpen(true))
    return () => cancelAnimationFrame(frame)
  }, [open])

  return (
    <SheetPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <SheetPrimitive.Trigger
        className="relative z-10 inline-flex size-10 items-center justify-center rounded-full text-site-cream-fg hover:bg-site-cream-fg/10 lg:hidden"
        aria-label={open ? t.nav.close : t.nav.open}
      >
        <BurgerMenu className="cursor-pointer" open={open} />
      </SheetPrimitive.Trigger>
      <SheetPrimitive.Portal>
        <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-site-chrome/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:duration-200 data-[state=open]:duration-300" />
        <SheetPrimitive.Content
          aria-modal="true"
          onCloseAutoFocus={(event) => event.preventDefault()}
          className="fixed inset-0 z-50 flex h-full flex-col bg-site-chrome text-site-cyan-fg shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:duration-200 data-[state=open]:duration-300"
        >
          <SheetPrimitive.Title className="sr-only">{t.nav.menu}</SheetPrimitive.Title>
          <SheetPrimitive.Description className="sr-only">{t.nav.siteNavigation}</SheetPrimitive.Description>
          <div className="container-full flex min-h-0 flex-1 flex-col">
            <div className="flex items-center justify-between py-3">
              <Link to={home} className="shrink-0 transition-opacity hover:opacity-80" onClick={() => onOpenChange(false)}>
                <span className="sr-only">{SITE_NAME}</span>
                <Logo className="h-10 w-auto" tone="cyan" />
              </Link>
              <SheetPrimitive.Close
                className="inline-flex size-10 items-center justify-center rounded-full text-site-cyan-fg hover:bg-site-cyan-fg/10"
                aria-label={t.nav.close}
              >
                <BurgerMenu className="cursor-pointer" open={iconOpen} />
              </SheetPrimitive.Close>
            </div>
            <nav aria-label={t.nav.primary} className="flex flex-col gap-4 py-10">
              {nav.map((item) => (
                <MobileNavLink key={item.to} to={item.to} pathname={pathname} onNavigate={() => onOpenChange(false)}>
                  {item.title}
                </MobileNavLink>
              ))}
              <Link to={contact} className="button-gold mt-6 w-fit" onClick={() => onOpenChange(false)}>
                {t.nav.getInTouch}
              </Link>
            </nav>
            <LanguageSwitch tone="cyan" className="mt-auto pb-10" />
          </div>
        </SheetPrimitive.Content>
      </SheetPrimitive.Portal>
    </SheetPrimitive.Root>
  )
}

export default function Header() {
  const location = useLocation()
  const { locale, t } = useLocale()
  const [isSticky, setIsSticky] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const nav = primaryNav(locale)
  const home = homePath(locale)
  const contact = contactPath(locale)

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onScroll = () => setIsSticky(window.scrollY > 10)

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 text-site-cream-fg">
      <div className="container-full pt-2">
        <div
          className={cn(
            'pointer-events-auto grid grid-cols-[1fr_auto_1fr] items-center sm:rounded-4xl rounded-2xl sm:px-10 px-6 smooth',
            isSticky ? 'h-20 bg-site-cream/90 shadow backdrop-blur-md' : 'h-20 bg-transparent'
          )}
        >
          <Link to={home} className="z-10 w-fit shrink-0 justify-self-start transition-opacity hover:opacity-80">
            <span className="sr-only">{SITE_NAME}</span>
            <Logo className="h-10 w-auto" />
          </Link>

          <nav aria-label={t.nav.primary} className="hidden items-center gap-1 lg:flex">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={navLinkClass}
                aria-current={isCurrentPath(location.pathname, item.to) ? 'page' : undefined}
              >
                {item.title}
              </Link>
            ))}
          </nav>

          <div className="z-10 col-start-3 flex items-center justify-self-end gap-2 lg:gap-3">
            <LanguageSwitch className="hidden lg:block" />
            <Link to={contact} className="button-gold hidden whitespace-nowrap lg:inline-flex">
              {t.nav.getInTouch}
            </Link>
            <MobileMenuSheet open={menuOpen} onOpenChange={setMenuOpen} pathname={location.pathname} />
          </div>
        </div>
      </div>
    </header>
  )
}

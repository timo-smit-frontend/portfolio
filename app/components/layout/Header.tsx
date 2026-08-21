import * as SheetPrimitive from '@radix-ui/react-dialog'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import BurgerMenu from '~/components/elements/BurgerMenu'
import Logo from '~/components/elements/Logo'
import { CONTACT_URL, GET_IN_TOUCH, PRIMARY_NAV } from '~/components/layout/nav'
import { SITE_NAME, isCurrentPath } from '~/seo/site'
import { cn } from '~/services/utils'

const navLinkClass =
  'inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium smooth hover:bg-site-cream-fg/10 aria-[current=page]:bg-site-cream-fg/15'
const mobileNavLinkClass = 'mobile-menu-hover title-base flex w-full items-center px-0 py-2 text-2xl sm:text-3xl'

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
        aria-label={open ? 'Close menu' : 'Open menu'}
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
          <SheetPrimitive.Title className="sr-only">Menu</SheetPrimitive.Title>
          <SheetPrimitive.Description className="sr-only">Site navigation</SheetPrimitive.Description>
          <div className="container-full">
            <div className="flex items-center justify-between py-3">
              <Link to="/" className="shrink-0 transition-opacity hover:opacity-80" onClick={() => onOpenChange(false)}>
                <span className="sr-only">{SITE_NAME}</span>
                <Logo className="h-10 w-auto" tone="cyan" />
              </Link>
              <SheetPrimitive.Close
                className="inline-flex size-10 items-center justify-center rounded-full text-site-cyan-fg hover:bg-site-cyan-fg/10"
                aria-label="Close menu"
              >
                <BurgerMenu className="cursor-pointer" open={iconOpen} />
              </SheetPrimitive.Close>
            </div>
            <nav aria-label="Primary" className="flex flex-col gap-4 py-10">
              {PRIMARY_NAV.map((item) => (
                <MobileNavLink key={item.to} to={item.to} pathname={pathname} onNavigate={() => onOpenChange(false)}>
                  {item.title}
                </MobileNavLink>
              ))}
              <Link to={CONTACT_URL} className="button-gold mt-6 w-fit" onClick={() => onOpenChange(false)}>
                {GET_IN_TOUCH}
              </Link>
            </nav>
          </div>
        </SheetPrimitive.Content>
      </SheetPrimitive.Portal>
    </SheetPrimitive.Root>
  )
}

export default function Header() {
  const location = useLocation()
  const [isSticky, setIsSticky] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

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
            'pointer-events-auto flex items-center justify-between rounded-4xl px-5 smooth',
            isSticky ? 'h-16 bg-site-cream/90 shadow backdrop-blur-md' : 'h-20 bg-transparent'
          )}
        >
          <Link to="/" className="shrink-0 transition-opacity hover:opacity-80">
            <span className="sr-only">{SITE_NAME}</span>
            <Logo className="h-10 w-auto" />
          </Link>

          <div className="flex items-center gap-2 lg:gap-4">
            <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
              {PRIMARY_NAV.map((item) => (
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

            <Link to={CONTACT_URL} className="button-gold hidden h-8 px-4 text-sm lg:inline-flex">
              {GET_IN_TOUCH}
            </Link>

            <MobileMenuSheet open={menuOpen} onOpenChange={setMenuOpen} pathname={location.pathname} />
          </div>
        </div>
      </div>
    </header>
  )
}

import { useEffect, type ReactNode } from 'react'
import SkipToMainContent from '~/components/elements/SkipToMainContent'
import Footer from '~/components/layout/Footer'
import Header from '~/components/layout/Header'
import { cn } from '~/services/utils'

const BUTTON_GLOW_SELECTOR = '.button-gold, .button-gold-outline'

function setButtonGlowPoint(el: HTMLElement, x: string, y: string) {
  el.style.setProperty('--mx', x)
  el.style.setProperty('--my', y)
}

export default function Layout({ children, className }: { children: ReactNode; className?: string }) {
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const target = (event.target as Element | null)?.closest(BUTTON_GLOW_SELECTOR)
      if (!(target instanceof HTMLElement) || target.hasAttribute('disabled')) return

      const rect = target.getBoundingClientRect()
      setButtonGlowPoint(target, `${event.clientX - rect.left}px`, `${event.clientY - rect.top}px`)
    }

    const onOut = (event: PointerEvent) => {
      const target = (event.target as Element | null)?.closest(BUTTON_GLOW_SELECTOR)
      if (!(target instanceof HTMLElement)) return
      if (event.relatedTarget instanceof Node && target.contains(event.relatedTarget)) return
      setButtonGlowPoint(target, '50%', '50%')
    }

    document.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerout', onOut)
    return () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerout', onOut)
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <SkipToMainContent />
      <Header />
      <main id="main" className={cn('flex flex-1 flex-col', className)} tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>
  )
}

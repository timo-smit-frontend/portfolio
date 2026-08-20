import { ReactNode } from 'react'
import SkipToMainContent from '~/components/elements/SkipToMainContent'
import Footer from '~/components/layout/Footer'
import Header from '~/components/layout/Header'
import { cn } from '~/services/utils'

export default function Layout({ children, className }: { children: ReactNode; className?: string }) {
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

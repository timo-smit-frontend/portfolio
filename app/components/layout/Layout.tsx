import { type ReactNode } from 'react'
import SkipToMainContent from '~/components/elements/SkipToMainContent'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <SkipToMainContent />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
    </>
  )
}

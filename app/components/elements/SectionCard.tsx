import { ReactNode, Ref } from 'react'
import { cn } from '~/services/utils'

export default function SectionCard({
  tone,
  first = false,
  id,
  children,
  innerClassName,
  sectionRef
}: {
  tone: 'cyan' | 'cream'
  first?: boolean
  id?: string
  children: ReactNode
  innerClassName?: string
  sectionRef?: Ref<HTMLElement>
}) {
  return (
    <section id={id} ref={sectionRef} className={cn('pb-2', first && 'pt-2')}>
      <div className="container-full">
        <div
          className={cn(
            'overflow-clip rounded-2xl sm:rounded-4xl',
            tone === 'cyan' ? 'bg-site-cyan text-site-cyan-fg' : 'bg-site-cream text-site-cream-fg',
            innerClassName
          )}
        >
          {children}
        </div>
      </div>
    </section>
  )
}

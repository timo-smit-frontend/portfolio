import { ReactNode } from 'react'
import { cn } from '~/services/utils'

export default function Accordion({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <div
      className={cn(
        'grid transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none',
        open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
      )}
    >
      {/* inert while collapsed: hidden content must not receive keyboard focus or be read out (WCAG 2.4.3 / 2.4.7) */}
      <div className="overflow-hidden" inert={!open}>
        {children}
      </div>
    </div>
  )
}

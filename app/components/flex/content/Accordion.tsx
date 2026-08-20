import { ReactNode } from 'react'
import { cn } from '~/services/utils'

export default function Accordion({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <div className={cn('grid transition-[grid-template-rows] duration-300 ease-in-out', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
      <div className="overflow-hidden">{children}</div>
    </div>
  )
}

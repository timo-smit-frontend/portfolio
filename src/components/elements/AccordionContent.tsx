import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface AccordionContentProps {
  isOpen: boolean
  children: React.ReactNode
  className?: string
}

export default function AccordionContent({ isOpen, children, className = '' }: AccordionContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number>(0)

  useEffect(() => {
    if (isOpen && contentRef.current) {
      // Measure the content height
      const contentHeight = contentRef.current.scrollHeight
      setHeight(contentHeight)
    } else {
      setHeight(0)
    }
  }, [isOpen])

  // Update height when content changes while open
  useEffect(() => {
    if (isOpen && contentRef.current) {
      const updateHeight = () => {
        if (contentRef.current) {
          setHeight(contentRef.current.scrollHeight)
        }
      }
      
      // Small delay to ensure content is rendered
      const timeoutId = setTimeout(updateHeight, 0)
      
      // Use ResizeObserver if available for dynamic content changes
      if (typeof ResizeObserver !== 'undefined' && contentRef.current) {
        const resizeObserver = new ResizeObserver(updateHeight)
        resizeObserver.observe(contentRef.current)
        
        return () => {
          clearTimeout(timeoutId)
          resizeObserver.disconnect()
        }
      }
      
      return () => clearTimeout(timeoutId)
    }
  }, [isOpen, children])

  return (
    <motion.div
      initial={false}
      animate={{
        height: height,
        opacity: isOpen ? 1 : 0,
      }}
      transition={{
        height: {
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        },
        opacity: {
          duration: 0.2,
          ease: 'easeInOut',
        },
      }}
      style={{ overflow: 'hidden' }}
    >
      <div ref={contentRef} className={className}>{children}</div>
    </motion.div>
  )
}

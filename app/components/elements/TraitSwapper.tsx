import { useEffect, useState } from 'react'
import { messages } from '~/i18n/messages'

const TraitSwapper = ({ traits = messages.en.traits }: { traits?: readonly string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [currentTrait, setCurrentTrait] = useState(traits[0] ?? '')
  const [isErasing, setIsErasing] = useState(false)
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  const [randomTrait, setRandomTrait] = useState('')

  useEffect(() => {
    function handleResize() {
      setIsSmallScreen(window.innerWidth < 800)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>

    if (!isErasing && charIndex < currentTrait.length) {
      timeoutId = setTimeout(() => {
        setCharIndex(charIndex + 1)
      }, 300)
    } else if (isErasing && charIndex > 0) {
      timeoutId = setTimeout(() => {
        setCharIndex(charIndex - 1)
      }, 75)
    } else if (!isErasing && charIndex >= currentTrait.length) {
      timeoutId = setTimeout(() => {
        setIsErasing(true)
      }, 3000)
    } else {
      setIsErasing(false)
      const nextIndex = currentIndex === traits.length - 1 ? 0 : currentIndex + 1
      setCurrentIndex(nextIndex)
      setCurrentTrait(traits[nextIndex] ?? '')
    }

    return () => clearTimeout(timeoutId)
  }, [currentIndex, charIndex, currentTrait, isErasing, traits])

  useEffect(() => {
    if (isSmallScreen) {
      const randomIndex = Math.floor(Math.random() * traits.length)
      setRandomTrait(traits[randomIndex] ?? '')
    }
  }, [isSmallScreen, traits])

  const traitToDisplay = isSmallScreen ? randomTrait || '' : currentTrait.substring(0, charIndex) + '_'

  const displayedTrait = traitToDisplay

  return (
    <span id="trait-styling" className="text-site-gold" aria-hidden="true">
      {displayedTrait}
    </span>
  )
}

export default TraitSwapper

import Credits from '../elements/Credits.js'
import Socials from '../elements/Socials.js'

import logoTS_2 from '/assets/ts_logo_2.png'
import scrollToElementWithId from '../../functions/utils.js'

export default function Footer() {
  return (
    <footer className="flex flex-col items-center justify-center gap-10 py-12 bg-[var(--dark-blue)]">
      <img
        onClick={() => scrollToElementWithId('#header')}
        src={logoTS_2}
        alt="Timo Smit"
        title="Scroll up!"
        className="cursor-pointer w-[100px] h-[100px]"
      />

      <Socials />
      <Credits />
    </footer>
  )
}

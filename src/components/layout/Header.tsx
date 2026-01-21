import logoTS from '/assets/ts_logo.png'
import TraitSwapper from '../elements/TraitSwapper'

export default function Header() {
  return (
    <header
      id="header"
      className="flex flex-col items-center h-screen bg-cover"
      style={{
        backgroundImage: 'url("/assets/timosmit.webp")'
      }}
    >
      <div className="container h-full flex flex-col">
        <nav className="py-10">
          <img className="lg:h-20 h-10 w-auto" src={logoTS} alt="Timo Smit" />
        </nav>
        <div className="flex-1 flex justify-center items-center">
          <h1 className="font-bold lg:text-5xl text-4xl text-[var(--white)]">
            Timo Smit is a <TraitSwapper /> Front-end Developer!
          </h1>
        </div>
      </div>
    </header>
  )
}

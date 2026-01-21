export default function Socials() {
  return (
    <div className="flex gap-4 items-center">
      <a
        className="flex items-center gap-1 group"
        aria-label="Follow Timo Smit on LinkedIn"
        href="https://www.linkedin.com/in/timo-smit-09983b14a/"
      >
        <svg className="h-8 w-auto" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 30 30">
          <path
            className="fill-[var(--white)] group-hover:fill-[var(--yellow)] smooth"
            d="M24,4H6C4.895,4,4,4.895,4,6v18c0,1.105,0.895,2,2,2h18c1.105,0,2-0.895,2-2V6C26,4.895,25.105,4,24,4z M10.954,22h-2.95 v-9.492h2.95V22z M9.449,11.151c-0.951,0-1.72-0.771-1.72-1.72c0-0.949,0.77-1.719,1.72-1.719c0.948,0,1.719,0.771,1.719,1.719 C11.168,10.38,10.397,11.151,9.449,11.151z M22.004,22h-2.948v-4.616c0-1.101-0.02-2.517-1.533-2.517 c-1.535,0-1.771,1.199-1.771,2.437V22h-2.948v-9.492h2.83v1.297h0.04c0.394-0.746,1.356-1.533,2.791-1.533 c2.987,0,3.539,1.966,3.539,4.522V22z"
          ></path>
        </svg>
        <span className="group-hover:text-white smooth">Timo Smit</span>
      </a>
      <a className="flex items-center gap-1 group" aria-label="Follow Timo Smit on Instagram" href="https://www.instagram.com/timosmit_/">
        <svg className="h-8 w-auto" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 30 30">
          <path
            className="fill-[var(--white)] group-hover:fill-[var(--yellow)] smooth"
            d="M 9.9980469 3 C 6.1390469 3 3 6.1419531 3 10.001953 L 3 20.001953 C 3 23.860953 6.1419531 27 10.001953 27 L 20.001953 27 C 23.860953 27 27 23.858047 27 19.998047 L 27 9.9980469 C 27 6.1390469 23.858047 3 19.998047 3 L 9.9980469 3 z M 22 7 C 22.552 7 23 7.448 23 8 C 23 8.552 22.552 9 22 9 C 21.448 9 21 8.552 21 8 C 21 7.448 21.448 7 22 7 z M 15 9 C 18.309 9 21 11.691 21 15 C 21 18.309 18.309 21 15 21 C 11.691 21 9 18.309 9 15 C 9 11.691 11.691 9 15 9 z M 15 11 A 4 4 0 0 0 11 15 A 4 4 0 0 0 15 19 A 4 4 0 0 0 19 15 A 4 4 0 0 0 15 11 z"
          ></path>
        </svg>
        <span className="group-hover:text-white smooth">timosmit_</span>
      </a>
    </div>
  )
}

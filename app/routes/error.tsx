import { Link } from 'react-router'
import { Animated } from '~/components/elements/Animated'

export default function ErrorPage() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center bg-site-chrome py-16 text-site-cyan-fg sm:py-24 lg:py-32"
      aria-labelledby="error-title"
    >
      <div className="container-full">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <Animated delay={100}>
            <p className="title-xl text-site-gold">404</p>
          </Animated>
          <Animated delay={200}>
            <h1 id="error-title" className="title-l">
              This page was not found
            </h1>
          </Animated>
          <Animated delay={300}>
            <p className="content-l text-site-cyan-fg/80">This page does not exist or has been moved.</p>
          </Animated>
          <Animated delay={400}>
            <Link to="/" className="button-gold mt-2">
              Back to home
            </Link>
          </Animated>
        </div>
      </div>
    </main>
  )
}

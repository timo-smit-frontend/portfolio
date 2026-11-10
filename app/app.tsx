import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes } from 'react-router'
import Seo from '~/components/elements/Seo'
import ScrollToTop from '~/components/layout/ScrollToTop'
import { MotionPreferenceProvider } from '~/components/motion/MotionPreference'
import { ProgressProvider } from '~/game/progress'
import Root from '~/root'

const ErrorPage = lazy(() => import('~/routes/error'))

/** Fetch the other places once idle, so walking into a building never waits on a chunk. */
function usePreloadPlaces() {
  useEffect(() => {
    const preload = () =>
      void Promise.all([
        import('~/game/interior/AboutPlace'),
        import('~/game/interior/ExperiencePlace'),
        import('~/game/interior/EducationPlace'),
        import('~/game/interior/ContactPlace')
      ])
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(preload, { timeout: 4000 })
      return () => window.cancelIdleCallback(id)
    }
    const id = globalThis.setTimeout(preload, 2000)
    return () => globalThis.clearTimeout(id)
  }, [])
}

// Every place is a route into the same game: the shell in Root stays mounted, the URL picks the place.
function PlaceRoutes() {
  return (
    <>
      <Route index element={null} />
      <Route path="about" element={null} />
      <Route path="experience" element={null} />
      <Route path="education" element={null} />
      <Route path="contact" element={null} />
    </>
  )
}

export function App() {
  usePreloadPlaces()

  return (
    <MotionPreferenceProvider>
      <ProgressProvider>
        <ScrollToTop />
        <Seo />
        <Suspense fallback={null}>
          <Routes>
            <Route element={<Root />}>
              {PlaceRoutes()}
              <Route path="nl">{PlaceRoutes()}</Route>
            </Route>
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </Suspense>
      </ProgressProvider>
    </MotionPreferenceProvider>
  )
}

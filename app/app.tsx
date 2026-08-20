import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'
import Seo from '~/components/elements/Seo'
import ScrollToTop from '~/components/layout/ScrollToTop'
import { InitialDocumentProvider } from '~/hooks/initialDocument'
import Home from '~/routes/home'
import Root from '~/root'

const Experience = lazy(() => import('~/routes/experience'))
const Education = lazy(() => import('~/routes/education'))

export function App() {
  return (
    <>
      <ScrollToTop />
      <Seo />
      <InitialDocumentProvider>
        <Suspense fallback={null}>
          <Routes>
            <Route element={<Root />}>
              <Route index element={<Home />} />
              <Route path="experience" element={<Experience />} />
              <Route path="education" element={<Education />} />
            </Route>
          </Routes>
        </Suspense>
      </InitialDocumentProvider>
    </>
  )
}

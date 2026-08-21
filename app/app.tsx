import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'
import Seo from '~/components/elements/Seo'
import ScrollToTop from '~/components/layout/ScrollToTop'
import { InitialDocumentProvider } from '~/hooks/initialDocument'
import Root from '~/root'
import Home from '~/routes/home'

const Experience = lazy(() => import('~/routes/experience'))
const Education = lazy(() => import('~/routes/education'))
const Contact = lazy(() => import('~/routes/contact'))
const ErrorPage = lazy(() => import('~/routes/error'))

function PageRoutes() {
  return (
    <>
      <Route index element={<Home />} />
      <Route path="experience" element={<Experience />} />
      <Route path="education" element={<Education />} />
      <Route path="contact" element={<Contact />} />
    </>
  )
}

export function App() {
  return (
    <>
      <ScrollToTop />
      <Seo />
      <InitialDocumentProvider>
        <Suspense fallback={null}>
          <Routes>
            <Route element={<Root />}>
              {PageRoutes()}
              <Route path="nl">{PageRoutes()}</Route>
            </Route>
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </Suspense>
      </InitialDocumentProvider>
    </>
  )
}

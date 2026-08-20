import { Route, Routes } from 'react-router'
import Seo from '~/components/elements/Seo'
import ScrollToTop from '~/components/layout/ScrollToTop'
import { InitialDocumentProvider } from '~/hooks/initialDocument'
import Home from '~/routes/home'
import Root from '~/root'

export function App() {
  return (
    <>
      <ScrollToTop />
      <Seo />
      <InitialDocumentProvider>
        <Routes>
          <Route element={<Root />}>
            <Route index element={<Home />} />
          </Route>
        </Routes>
      </InitialDocumentProvider>
    </>
  )
}

import { Route, Routes } from 'react-router'
import ScrollToTop from '~/components/layout/ScrollToTop'
import { InitialDocumentProvider } from '~/hooks/initialDocument'
import Root from '~/root'

function HomeStub() {
  return (
    <section className="section">
      <div className="container-full">
        <h1 className="title-l">Timo Smit</h1>
      </div>
    </section>
  )
}

export function App() {
  return (
    <>
      <ScrollToTop />
      <InitialDocumentProvider>
        <Routes>
          <Route element={<Root />}>
            <Route index element={<HomeStub />} />
          </Route>
        </Routes>
      </InitialDocumentProvider>
    </>
  )
}

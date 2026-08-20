import { Route, Routes } from 'react-router'
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
    <Routes>
      <Route element={<Root />}>
        <Route index element={<HomeStub />} />
      </Route>
    </Routes>
  )
}

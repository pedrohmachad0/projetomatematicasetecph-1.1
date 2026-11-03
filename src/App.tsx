import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Hub from './pages/Hub'
import Pitagoras from './pages/Pitagoras'
import CalcSoma from './pages/CalcSoma'
import CalcSubtracao from './pages/CalcSubtracao'
import Fracoes from './pages/Fracoes'
import Porcentagem from './pages/Porcentagem'
import Aprender from './pages/Aprender'
import NotFound from './pages/NotFound'

const Pi = lazy(() => import('./pages/Pi'))
const Equacoes = lazy(() => import('./pages/Equacoes'))
const Estatistica = lazy(() => import('./pages/Estatistica'))
const Funcoes = lazy(() => import('./pages/Funcoes'))
const Progressoes = lazy(() => import('./pages/Progressoes'))
const Trigonometria = lazy(() => import('./pages/Trigonometria'))
const Probabilidade = lazy(() => import('./pages/Probabilidade'))

function Loading() {
  return <div role="status" className="p-6 text-center text-sm font-semibold text-slate-500">Carregando simulador…</div>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Hub />} />
          <Route path="pitagoras" element={<Pitagoras />} />
          <Route path="pi" element={<Suspense fallback={<Loading />}><Pi /></Suspense>} />
          <Route path="equacoes" element={<Suspense fallback={<Loading />}><Equacoes /></Suspense>} />
          <Route path="estatistica" element={<Suspense fallback={<Loading />}><Estatistica /></Suspense>} />
          <Route path="funcoes" element={<Suspense fallback={<Loading />}><Funcoes /></Suspense>} />
          <Route path="progressoes" element={<Suspense fallback={<Loading />}><Progressoes /></Suspense>} />
          <Route path="trigonometria" element={<Suspense fallback={<Loading />}><Trigonometria /></Suspense>} />
          <Route path="probabilidade" element={<Suspense fallback={<Loading />}><Probabilidade /></Suspense>} />
          <Route path="soma" element={<CalcSoma />} />
          <Route path="subtracao" element={<CalcSubtracao />} />
          <Route path="fracoes" element={<Fracoes />} />
          <Route path="porcentagem" element={<Porcentagem />} />
          <Route path="aprender" element={<Aprender />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

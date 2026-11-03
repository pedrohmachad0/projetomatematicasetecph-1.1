import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Hub from './pages/Hub'
import Pitagoras from './pages/Pitagoras'
import CalcSoma from './pages/CalcSoma'
import CalcSubtracao from './pages/CalcSubtracao'
import Fracoes from './pages/Fracoes'
import Porcentagem from './pages/Porcentagem'
import NotFound from './pages/NotFound'

const Pi = lazy(() => import('./pages/Pi'))
const Aprender = lazy(() => import('./pages/Aprender'))
const Equacoes = lazy(() => import('./pages/Equacoes'))
const Estatistica = lazy(() => import('./pages/Estatistica'))
const Funcoes = lazy(() => import('./pages/Funcoes'))
const Progressoes = lazy(() => import('./pages/Progressoes'))
const Trigonometria = lazy(() => import('./pages/Trigonometria'))
const Probabilidade = lazy(() => import('./pages/Probabilidade'))
const Inteiros = lazy(() => import('./pages/Inteiros'))
const Proporcao = lazy(() => import('./pages/Proporcao'))
const Potencias = lazy(() => import('./pages/Potencias'))
const Expressoes = lazy(() => import('./pages/Expressoes'))
const Poligonos = lazy(() => import('./pages/Poligonos'))
const Areas = lazy(() => import('./pages/Areas'))
const Tales = lazy(() => import('./pages/Tales'))
const Sistemas = lazy(() => import('./pages/Sistemas'))
const Notaveis = lazy(() => import('./pages/Notaveis'))
const Exponencial = lazy(() => import('./pages/Exponencial'))
const Espacial = lazy(() => import('./pages/Espacial'))
const Analitica = lazy(() => import('./pages/Analitica'))
const Matrizes = lazy(() => import('./pages/Matrizes'))
const Combinatoria = lazy(() => import('./pages/Combinatoria'))
const Juros = lazy(() => import('./pages/Juros'))

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
          <Route path="inteiros" element={<Suspense fallback={<Loading />}><Inteiros /></Suspense>} />
          <Route path="proporcao" element={<Suspense fallback={<Loading />}><Proporcao /></Suspense>} />
          <Route path="potencias" element={<Suspense fallback={<Loading />}><Potencias /></Suspense>} />
          <Route path="expressoes" element={<Suspense fallback={<Loading />}><Expressoes /></Suspense>} />
          <Route path="poligonos" element={<Suspense fallback={<Loading />}><Poligonos /></Suspense>} />
          <Route path="areas" element={<Suspense fallback={<Loading />}><Areas /></Suspense>} />
          <Route path="tales" element={<Suspense fallback={<Loading />}><Tales /></Suspense>} />
          <Route path="sistemas" element={<Suspense fallback={<Loading />}><Sistemas /></Suspense>} />
          <Route path="notaveis" element={<Suspense fallback={<Loading />}><Notaveis /></Suspense>} />
          <Route path="exponencial" element={<Suspense fallback={<Loading />}><Exponencial /></Suspense>} />
          <Route path="espacial" element={<Suspense fallback={<Loading />}><Espacial /></Suspense>} />
          <Route path="analitica" element={<Suspense fallback={<Loading />}><Analitica /></Suspense>} />
          <Route path="matrizes" element={<Suspense fallback={<Loading />}><Matrizes /></Suspense>} />
          <Route path="combinatoria" element={<Suspense fallback={<Loading />}><Combinatoria /></Suspense>} />
          <Route path="juros" element={<Suspense fallback={<Loading />}><Juros /></Suspense>} />
          <Route path="soma" element={<CalcSoma />} />
          <Route path="subtracao" element={<CalcSubtracao />} />
          <Route path="fracoes" element={<Fracoes />} />
          <Route path="porcentagem" element={<Porcentagem />} />
          <Route path="aprender" element={<Suspense fallback={<Loading />}><Aprender /></Suspense>} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

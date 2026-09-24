import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Hub from './pages/Hub'
import Pitagoras from './pages/Pitagoras'
import Pi from './pages/Pi'
import CalcSoma from './pages/CalcSoma'
import CalcSubtracao from './pages/CalcSubtracao'
import Fracoes from './pages/Fracoes'
import Porcentagem from './pages/Porcentagem'
import Aprender from './pages/Aprender'
import Quiz from './pages/Quiz'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Hub />} />
          <Route path="pitagoras" element={<Pitagoras />} />
          <Route path="pi" element={<Pi />} />
          <Route path="soma" element={<CalcSoma />} />
          <Route path="subtracao" element={<CalcSubtracao />} />
          <Route path="fracoes" element={<Fracoes />} />
          <Route path="porcentagem" element={<Porcentagem />} />
          <Route path="aprender" element={<Aprender />} />
          <Route path="quiz/:topic" element={<Quiz />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Hub from './pages/Hub'
import Pitagoras from './pages/Pitagoras'
import CalcSoma from './pages/CalcSoma'
import CalcSubtracao from './pages/CalcSubtracao'
import Aprender from './pages/Aprender'
import Quiz from './pages/Quiz'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Hub />} />
          <Route path="pitagoras" element={<Pitagoras />} />
          <Route path="soma" element={<CalcSoma />} />
          <Route path="subtracao" element={<CalcSubtracao />} />
          <Route path="aprender" element={<Aprender />} />
          <Route path="quiz/:topic" element={<Quiz />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

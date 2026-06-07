import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import InscriptionClient from './pages/InscriptionClient'
import InscriptionOwner from './pages/InscriptionOwner'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/inscription/client" element={<InscriptionClient />} />
        <Route path="/inscription/owner" element={<InscriptionOwner />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
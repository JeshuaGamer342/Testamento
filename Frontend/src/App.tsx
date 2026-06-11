import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import PublicLayout from './layouts/PublicLayout'
import HomePage from './pages/HomePage'
import MessagesPage from './pages/MessagesPage'
import NotariesPage from './pages/NotariesPage'
import NotaryDashboardPage from './pages/NotaryDashboardPage'
import NotaryRegisterAccountPage from './pages/NotaryRegisterAccountPage'
import NotaryRegisterPaymentPage from './pages/NotaryRegisterPaymentPage'
import NotaryRegisterPage from './pages/NotaryRegisterPage'
import WillFormPage from './pages/WillFormPage'

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/mi-testamento" element={<WillFormPage />} />
        <Route path="/notarios-disponibles" element={<NotariesPage />} />
        <Route path="/mensajes" element={<MessagesPage />} />
        <Route path="/nuevo-notario" element={<NotaryRegisterPage />} />
        <Route path="/nuevo-notario/pago" element={<NotaryRegisterPaymentPage />} />
        <Route path="/nuevo-notario/cuenta" element={<NotaryRegisterAccountPage />} />
      </Route>
      <Route path="/panel-notarial" element={<NotaryDashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App

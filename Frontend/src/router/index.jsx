import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from '../pages/Login'
import Home from '../pages/Home'
import ForgotPassword from '../pages/ForgotPassword'
import CreateUser from '../pages/CreateUser'
import CreateArea from '../pages/CreateArea'
import EditArea from '../pages/EditArea'
import ConsultarArea from '../pages/ConsultarArea'
import ProtectedRoute from '../components/ProtectedRoute'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/recuperar-contrasena" element={<ForgotPassword />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/usuarios/crear" element={<ProtectedRoute><CreateUser /></ProtectedRoute>} />
        <Route path="/organizacion/areas/crear" element={<ProtectedRoute><CreateArea /></ProtectedRoute>} />
        <Route path="/organizacion/areas/editar/:nombre" element={<ProtectedRoute><EditArea /></ProtectedRoute>} />
        <Route path="/organizacion/areas/consultar" element={<ProtectedRoute><ConsultarArea /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

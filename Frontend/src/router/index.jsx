import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from '../pages/Login'
import Home from '../pages/Home'
import ForgotPassword from '../pages/ForgotPassword'
import CreateUser from '../pages/CreateUser'
import CreateArea from '../pages/CreateArea'
import EditArea from '../pages/EditArea'
import ConsultarArea from '../pages/ConsultarArea'
import CreateDepartamento from '../pages/CreateDepartamento'
import EditDepartamento from '../pages/EditDepartamento'
import ConsultarDepartamento from '../pages/ConsultarDepartamento'
import CreateSeccion from '../pages/CreateSeccion'
import EditSeccion from '../pages/EditSeccion'
import ConsultarSeccion from '../pages/ConsultarSeccion'
import CreateUnidad from '../pages/CreateUnidad'
import EditUnidad from '../pages/EditUnidad'
import ConsultarUnidad from '../pages/ConsultarUnidad'
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
        <Route path="/organizacion/departamentos/crear" element={<ProtectedRoute><CreateDepartamento /></ProtectedRoute>} />
        <Route path="/organizacion/departamentos/editar/:nombre" element={<ProtectedRoute><EditDepartamento /></ProtectedRoute>} />
        <Route path="/organizacion/departamentos/consultar" element={<ProtectedRoute><ConsultarDepartamento /></ProtectedRoute>} />
        <Route path="/organizacion/secciones/crear" element={<ProtectedRoute><CreateSeccion /></ProtectedRoute>} />
        <Route path="/organizacion/secciones/editar/:nombre" element={<ProtectedRoute><EditSeccion /></ProtectedRoute>} />
        <Route path="/organizacion/secciones/consultar" element={<ProtectedRoute><ConsultarSeccion /></ProtectedRoute>} />
        <Route path="/organizacion/unidades/crear" element={<ProtectedRoute><CreateUnidad /></ProtectedRoute>} />
        <Route path="/organizacion/unidades/editar/:nombre" element={<ProtectedRoute><EditUnidad /></ProtectedRoute>} />
        <Route path="/organizacion/unidades/consultar" element={<ProtectedRoute><ConsultarUnidad /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from '../pages/Login'
import Home from '../pages/Home'
import ForgotPassword from '../pages/ForgotPassword'
import ChangePassword from '../pages/ChangePassword'
import CreateUsers from '../pages/CreateUsers'
import EditUser from '../pages/EditUser'
import QueryUsers from '../pages/QueryUsers'
import CreateAreas from '../pages/CreateAreas'
import EditArea from '../pages/EditArea'
import QueryAreas from '../pages/QueryAreas'
import CreateDepartments from '../pages/CreateDepartments'
import EditDepartamento from '../pages/EditDepartamento'
import QueryDepartments from '../pages/QueryDepartments'
import CreateSections from '../pages/CreateSections'
import EditSeccion from '../pages/EditSeccion'
import QuerySections from '../pages/QuerySections'
import CreateUnits from '../pages/CreateUnits'
import EditUnidad from '../pages/EditUnidad'
import QueryUnits from '../pages/QueryUnits'
import CreatePositions from '../pages/CreatePositions'
import EditPlaza from '../pages/EditPlaza'
import QueryPositions from '../pages/QueryPositions'
import ProtectedRoute from '../components/ProtectedRoute'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/recuperar-contrasena" element={<ForgotPassword />} />
        <Route path="/cambiar-contrasena" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/usuarios/crear" element={<ProtectedRoute><CreateUsers /></ProtectedRoute>} />
        <Route path="/usuarios/editar/:correo" element={<ProtectedRoute><EditUser /></ProtectedRoute>} />
        <Route path="/usuarios/consultar" element={<ProtectedRoute><QueryUsers /></ProtectedRoute>} />
        <Route path="/organizacion/areas/crear" element={<ProtectedRoute><CreateAreas /></ProtectedRoute>} />
        <Route path="/organizacion/areas/editar/:nombre" element={<ProtectedRoute><EditArea /></ProtectedRoute>} />
        <Route path="/organizacion/areas/consultar" element={<ProtectedRoute><QueryAreas /></ProtectedRoute>} />
        <Route path="/organizacion/departamentos/crear" element={<ProtectedRoute><CreateDepartments /></ProtectedRoute>} />
        <Route path="/organizacion/departamentos/editar/:nombre" element={<ProtectedRoute><EditDepartamento /></ProtectedRoute>} />
        <Route path="/organizacion/departamentos/consultar" element={<ProtectedRoute><QueryDepartments /></ProtectedRoute>} />
        <Route path="/organizacion/secciones/crear" element={<ProtectedRoute><CreateSections /></ProtectedRoute>} />
        <Route path="/organizacion/secciones/editar/:nombre" element={<ProtectedRoute><EditSeccion /></ProtectedRoute>} />
        <Route path="/organizacion/secciones/consultar" element={<ProtectedRoute><QuerySections /></ProtectedRoute>} />
        <Route path="/organizacion/unidades/crear" element={<ProtectedRoute><CreateUnits /></ProtectedRoute>} />
        <Route path="/organizacion/unidades/editar/:nombre" element={<ProtectedRoute><EditUnidad /></ProtectedRoute>} />
        <Route path="/organizacion/unidades/consultar" element={<ProtectedRoute><QueryUnits /></ProtectedRoute>} />
        <Route path="/organizacion/plazas/crear" element={<ProtectedRoute><CreatePositions /></ProtectedRoute>} />
        <Route path="/organizacion/plazas/editar/:numeroPlaza" element={<ProtectedRoute><EditPlaza /></ProtectedRoute>} />
        <Route path="/organizacion/plazas/consultar" element={<ProtectedRoute><QueryPositions /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

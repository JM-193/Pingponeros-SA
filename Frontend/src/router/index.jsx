import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from '../pages/Login'
import Home from '../pages/Home'
import ForgotPassword from '../pages/ForgotPassword'
import ChangePassword from '../pages/ChangePassword'
import QueryUsers from '../pages/QueryUsers'
import QueryAreas from '../pages/QueryAreas'
import QueryDepartments from '../pages/QueryDepartments'
import QuerySections from '../pages/QuerySections'
import QueryUnits from '../pages/QueryUnits'
import QueryPositions from '../pages/QueryPositions'
import QueryWorkPositions from '../pages/QueryWorkPositions'
import QueryFunctions from '../pages/QueryFunctions'
import QueryUserFunctions from '../pages/QueryUserFunctions'
import Declarations from '../pages/Declarations'
import DeclarationForm from '../pages/DeclarationForm'
import DeclarationView from '../pages/DeclarationView'
import Reports from '../pages/Reports'
import UserProfile from '../pages/UserProfile'
import ProtectedRoute from '../components/ProtectedRoute'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/recuperar-contrasena" element={<ForgotPassword />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/cambiar-contrasena" element={<ChangePassword />} />
          <Route path="/perfil" element={<UserProfile />} />
          <Route path="/home" element={<Home />} />
          <Route path="/declaraciones" element={<Declarations />} />
          <Route path="/declaraciones/formulario" element={<DeclarationForm />} />
          <Route path="/declaraciones/ver/:id" element={<DeclarationView />} />
          <Route path="/funciones/usuarios/consultar" element={<QueryUserFunctions />} />

          {/* Admin-only routes */}
          <Route element={<ProtectedRoute allowedRoles={[1]} />}>
            <Route path="/usuarios/consultar" element={<QueryUsers />} />
            <Route path="/plazas/consultar" element={<QueryPositions />} />
            <Route path="/organizacion/areas/consultar" element={<QueryAreas />} />
            <Route path="/organizacion/departamentos/consultar" element={<QueryDepartments />} />
            <Route path="/organizacion/secciones/consultar" element={<QuerySections />} />
            <Route path="/organizacion/unidades/consultar" element={<QueryUnits />} />
            <Route path="/puestos-trabajo/consultar" element={<QueryWorkPositions />} />
            <Route path="/funciones/oficiales/consultar" element={<QueryFunctions />} />
            <Route path="/reportes" element={<Reports />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

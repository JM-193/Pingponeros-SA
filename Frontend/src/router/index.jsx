import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from '../pages/Login'
import Home from '../pages/Home'
import ForgotPassword from '../pages/ForgotPassword'
import ChangePassword from '../pages/ChangePassword'
import CreateUsers from '../pages/CreateUsers'
import EditUsers from '../pages/EditUsers'
import QueryUsers from '../pages/QueryUsers'
import CreateAreas from '../pages/CreateAreas'
import EditAreas from '../pages/EditAreas'
import QueryAreas from '../pages/QueryAreas'
import CreateDepartments from '../pages/CreateDepartments'
import EditDepartments from '../pages/EditDepartments'
import QueryDepartments from '../pages/QueryDepartments'
import CreateSections from '../pages/CreateSections'
import EditSections from '../pages/EditSections'
import QuerySections from '../pages/QuerySections'
import CreateUnits from '../pages/CreateUnits'
import EditUnits from '../pages/EditUnits'
import QueryUnits from '../pages/QueryUnits'
import CreatePositions from '../pages/CreatePositions'
import EditPositions from '../pages/EditPositions'
import QueryPositions from '../pages/QueryPositions'
import CreateWorkPositions from '../pages/CreateWorkPositions'
import QueryWorkPositions from '../pages/QueryWorkPositions'
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
          <Route path="/home" element={<Home />} />
          {/* <Route path="/declaraciones/consultar" element={<QueryDeclarations />} /> */}

          {/* Admin-only routes */}
          <Route element={<ProtectedRoute allowedRoles={[1]} />}>
            <Route path="/usuarios/crear" element={<CreateUsers />} />
            <Route path="/usuarios/editar/:correo" element={<EditUsers />} />
            <Route path="/usuarios/consultar" element={<QueryUsers />} />
            <Route path="/plazas/crear" element={<CreatePositions />} />
            <Route path="/plazas/editar/:numeroPlaza" element={<EditPositions />} />
            <Route path="/plazas/consultar" element={<QueryPositions />} />
            <Route path="/organizacion/areas/crear" element={<CreateAreas />} />
            <Route path="/organizacion/areas/editar/:nombre" element={<EditAreas />} />
            <Route path="/organizacion/areas/consultar" element={<QueryAreas />} />
            <Route path="/organizacion/departamentos/crear" element={<CreateDepartments />} />
            <Route path="/organizacion/departamentos/editar/:nombre" element={<EditDepartments />} />
            <Route path="/organizacion/departamentos/consultar" element={<QueryDepartments />} />
            <Route path="/organizacion/secciones/crear" element={<CreateSections />} />
            <Route path="/organizacion/secciones/editar/:nombre" element={<EditSections />} />
            <Route path="/organizacion/secciones/consultar" element={<QuerySections />} />
            <Route path="/organizacion/unidades/crear" element={<CreateUnits />} />
            <Route path="/organizacion/unidades/editar/:nombre" element={<EditUnits />} />
            <Route path="/organizacion/unidades/consultar" element={<QueryUnits />} />
            <Route path="/organizacion/puestos-trabajo/crear" element={<CreateWorkPositions />} />
            <Route path="/puestos-trabajo/consultar" element={<QueryWorkPositions />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

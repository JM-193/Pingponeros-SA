import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from '../pages/Login'
import Home from '../pages/Home'
import ForgotPassword from '../pages/ForgotPassword'
import CreateUser from '../pages/CreateUser'
import CreateArea from '../pages/CreateArea'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/recuperar-contrasena" element={<ForgotPassword />} />
        <Route path="/home" element={<Home />} />
        <Route path="/usuarios/crear" element={<CreateUser />} />
        <Route path="/organizacion/areas/crear" element={<CreateArea />} />
      </Routes>
    </BrowserRouter>
  )
}

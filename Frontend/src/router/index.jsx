import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from '../pages/Login'
import Home from '../pages/Home'
import Users from '../pages/Users'
import ForgotPassword from '../pages/ForgotPassword'
import Organizacion from '../pages/Organizacion'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/recuperar-contrasena" element={<ForgotPassword />} />
        <Route path="/home" element={<Home />} />
        <Route path="/usuarios" element={<Users />} />
        <Route path="/organizacion" element={<Organizacion />} />
      </Routes>
    </BrowserRouter>
  )
}

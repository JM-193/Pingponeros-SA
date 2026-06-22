import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AppBreadcrumbs from '../components/AppBreadcrumbs'

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppBreadcrumbs />
    </MemoryRouter>
  )

describe('AppBreadcrumbs', () => {
  describe('rutas sin migas (oculto)', () => {
    it('no renderiza nada en /home', () => {
      const { container } = renderAt('/home')
      expect(container.firstChild).toBeNull()
    })

    it('no renderiza nada en una ruta desconocida', () => {
      const { container } = renderAt('/ruta-inexistente')
      expect(container.firstChild).toBeNull()
    })
  })

  describe('/cambiar-contrasena', () => {
    it('muestra Inicio y Cambiar Contraseña', () => {
      renderAt('/cambiar-contrasena')
      expect(screen.getByText('Inicio')).toBeInTheDocument()
      expect(screen.getByText('Cambiar Contraseña')).toBeInTheDocument()
    })

    it('Inicio es un enlace a /home', () => {
      renderAt('/cambiar-contrasena')
      const link = screen.getByRole('link', { name: 'Inicio' })
      expect(link).toHaveAttribute('href', '/home')
    })

    it('Cambiar Contraseña no es un enlace', () => {
      renderAt('/cambiar-contrasena')
      expect(screen.queryByRole('link', { name: 'Cambiar Contraseña' })).toBeNull()
    })
  })

  describe('/usuarios/consultar', () => {
    it('muestra Inicio, Usuarios y Consultar', () => {
      renderAt('/usuarios/consultar')
      expect(screen.getByText('Inicio')).toBeInTheDocument()
      expect(screen.getByText('Usuarios')).toBeInTheDocument()
      expect(screen.getByText('Consultar')).toBeInTheDocument()
    })

    it('Inicio es un enlace, Usuarios y Consultar no lo son', () => {
      renderAt('/usuarios/consultar')
      expect(screen.getByRole('link', { name: 'Inicio' })).toBeInTheDocument()
      expect(screen.queryByRole('link', { name: 'Usuarios' })).toBeNull()
      expect(screen.queryByRole('link', { name: 'Consultar' })).toBeNull()
    })
  })

  describe('/usuarios/editar/:correo', () => {
    it('muestra Editar como última miga, no el valor del correo', () => {
      renderAt('/usuarios/editar/user@ucr.ac.cr')
      expect(screen.getByText('Editar')).toBeInTheDocument()
      expect(screen.queryByText('user@ucr.ac.cr')).toBeNull()
    })

    it('Usuarios es un enlace a /usuarios/consultar', () => {
      renderAt('/usuarios/editar/user@ucr.ac.cr')
      const link = screen.getByRole('link', { name: 'Usuarios' })
      expect(link).toHaveAttribute('href', '/usuarios/consultar')
    })
  })

  describe('/organizacion/areas/consultar', () => {
    it('muestra las 4 migas', () => {
      renderAt('/organizacion/areas/consultar')
      expect(screen.getByText('Inicio')).toBeInTheDocument()
      expect(screen.getByText('Organización')).toBeInTheDocument()
      expect(screen.getByText('Áreas')).toBeInTheDocument()
      expect(screen.getByText('Consultar')).toBeInTheDocument()
    })

    it('solo Inicio es enlace', () => {
      renderAt('/organizacion/areas/consultar')
      expect(screen.getByRole('link', { name: 'Inicio' })).toBeInTheDocument()
      expect(screen.queryByRole('link', { name: 'Organización' })).toBeNull()
      expect(screen.queryByRole('link', { name: 'Áreas' })).toBeNull()
      expect(screen.queryByRole('link', { name: 'Consultar' })).toBeNull()
    })
  })

  describe('/organizacion/areas/crear', () => {
    it('Áreas es un enlace a /organizacion/areas/consultar', () => {
      renderAt('/organizacion/areas/crear')
      const link = screen.getByRole('link', { name: 'Áreas' })
      expect(link).toHaveAttribute('href', '/organizacion/areas/consultar')
    })

    it('Crear no es un enlace', () => {
      renderAt('/organizacion/areas/crear')
      expect(screen.queryByRole('link', { name: 'Crear' })).toBeNull()
      expect(screen.getByText('Crear')).toBeInTheDocument()
    })
  })

  describe('/organizacion/areas/editar/:nombre', () => {
    it('muestra Editar como última miga, no el valor del parámetro', () => {
      renderAt('/organizacion/areas/editar/Area-Test')
      expect(screen.getByText('Editar')).toBeInTheDocument()
      expect(screen.queryByText('Area-Test')).toBeNull()
    })

    it('Áreas es un enlace a /organizacion/areas/consultar', () => {
      renderAt('/organizacion/areas/editar/Area-Test')
      const link = screen.getByRole('link', { name: 'Áreas' })
      expect(link).toHaveAttribute('href', '/organizacion/areas/consultar')
    })
  })

  describe('/organizacion/plazas/editar/:numeroPlaza', () => {
    it('muestra Editar como última miga para plazas', () => {
      renderAt('/organizacion/plazas/editar/42')
      expect(screen.getByText('Plazas')).toBeInTheDocument()
      expect(screen.getByText('Editar')).toBeInTheDocument()
      expect(screen.queryByText('42')).toBeNull()
    })
  })

  describe('accesibilidad', () => {
    it('el nav tiene aria-label="breadcrumb"', () => {
      renderAt('/organizacion/areas/consultar')
      expect(screen.getByRole('navigation', { name: 'breadcrumb' })).toBeInTheDocument()
    })
  })
})

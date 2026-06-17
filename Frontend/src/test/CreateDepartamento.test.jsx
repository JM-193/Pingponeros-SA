// CreateDepartments.test.jsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import CreateDepartments from '../pages/CreateDepartments'
import * as areaService from '../services/areaService'

vi.mock('../services/departmentService')
vi.mock('../services/areaService')

describe('CreateDepartments Page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    areaService.obtenerAreas.mockResolvedValue([
      { id: 1, nombre: 'Administración', descripcion: 'Área' },
    ])
  })

  it('renderiza formulario de crear departamento', async () => {
    render(
      <BrowserRouter>
        <CreateDepartments />
      </BrowserRouter>,
    )

    expect(await screen.findByRole('heading', { name: /Crear Departamento/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Nombre del departamento')).toBeInTheDocument()
  })

  it('renderiza Header y Navbar', async () => {
    render(
      <BrowserRouter>
        <CreateDepartments />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Página Principal')).toBeInTheDocument()
    })
  })
})

describe('CreateDepartments Modal Mode', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    areaService.obtenerAreas.mockResolvedValue([
      { id: 1, nombre: 'Administración', descripcion: 'Área' },
    ])
  })

  it('renderiza dentro de un modal cuando isModal es true', async () => {
    render(
      <BrowserRouter>
        <CreateDepartments isModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Crear Departamento')).toBeInTheDocument()
    })

    expect(document.querySelector('dialog')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Nombre del departamento')).toBeInTheDocument()
  })

  it('no renderiza Header ni Navbar en modo modal', async () => {
    render(
      <BrowserRouter>
        <CreateDepartments isModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nombre del departamento')).toBeInTheDocument()
    })

    expect(screen.queryByText('Página Principal')).not.toBeInTheDocument()
  })

  it('no renderiza nada cuando isOpen es false', async () => {
    render(
      <BrowserRouter>
        <CreateDepartments isModal isOpen={false} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(document.querySelector('dialog')).not.toBeInTheDocument()
    })
  })

  it('llama a onClose al hacer clic en Cancelar', async () => {
    const onClose = vi.fn()
    render(
      <BrowserRouter>
        <CreateDepartments isModal isOpen={true} onClose={onClose} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nombre del departamento')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})

// EditDepartments.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import EditDepartments from '../pages/EditDepartments'
import * as departmentService from '../services/departmentService'
import * as areaService from '../services/areaService'

vi.mock('../services/departmentService')
vi.mock('../services/areaService')

const mockDepartamento = {
  nombre: 'Compras',
  descripcion: 'Departamento de compras',
  idArea: 1,
  estado: 1,
}

const mockAreas = [{ id: 1, nombre: 'Administración' }]

describe('EditDepartments Page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renderiza página en estado de carga sin parámetros de ruta', () => {
    render(
      <BrowserRouter>
        <EditDepartments />
      </BrowserRouter>,
    )

    expect(screen.getByText('Cargando departamento...')).toBeInTheDocument()
  })
})

describe('EditDepartments Modal Mode', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renderiza dentro de un modal cuando isModal es true', async () => {
    departmentService.obtenerDepartamentoPorNombre.mockResolvedValueOnce(mockDepartamento)
    areaService.obtenerAreas.mockResolvedValueOnce(mockAreas)

    render(
      <BrowserRouter>
        <EditDepartments isModal isOpen={true} entityName="Compras" onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Editar Departamento')).toBeInTheDocument()
    })

    expect(document.querySelector('dialog')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Compras')).toBeInTheDocument()
  })

  it('muestra cargando dentro del modal', () => {
    render(
      <BrowserRouter>
        <EditDepartments isModal isOpen={true} entityName="Compras" onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    expect(document.querySelector('dialog')).toBeInTheDocument()
    expect(screen.getByText('Cargando departamento...')).toBeInTheDocument()
  })

  it('no renderiza Header ni Navbar en modo modal', async () => {
    departmentService.obtenerDepartamentoPorNombre.mockResolvedValueOnce(mockDepartamento)
    areaService.obtenerAreas.mockResolvedValueOnce(mockAreas)

    render(
      <BrowserRouter>
        <EditDepartments isModal isOpen={true} entityName="Compras" onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('Compras')).toBeInTheDocument()
    })

    expect(screen.queryByText('Página Principal')).not.toBeInTheDocument()
  })

  it('llama a onClose al hacer clic en Cancelar', async () => {
    departmentService.obtenerDepartamentoPorNombre.mockResolvedValueOnce(mockDepartamento)
    areaService.obtenerAreas.mockResolvedValueOnce(mockAreas)
    const onClose = vi.fn()

    render(
      <BrowserRouter>
        <EditDepartments isModal isOpen={true} entityName="Compras" onClose={onClose} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('Compras')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('usa entityName prop en lugar de useParams', async () => {
    departmentService.obtenerDepartamentoPorNombre.mockResolvedValueOnce(mockDepartamento)
    areaService.obtenerAreas.mockResolvedValueOnce(mockAreas)

    render(
      <BrowserRouter>
        <EditDepartments isModal isOpen={true} entityName="Compras" onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(departmentService.obtenerDepartamentoPorNombre).toHaveBeenCalledWith('Compras')
    })
  })
})

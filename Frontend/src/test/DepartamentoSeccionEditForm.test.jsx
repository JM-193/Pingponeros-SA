// DepartmentSectionEditForm.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { toast } from 'react-toastify'
import DepartmentSectionEditForm from '../components/DepartmentSectionEditForm'
import * as areaService from '../services/areaService'

vi.mock('../services/areaService')

const mockAreas = [{ idArea: 1, nombre: 'Administración' }]

const mockEntityDepartamento = {
  nombre: 'Recursos Humanos',
  descripcion: 'Departamento de RRHH',
  idArea: 1,
  estado: 1,
}

const mockEntitySeccion = {
  nombre: 'Contabilidad',
  descripcion: 'Sección de contabilidad',
  idArea: 1,
  estado: 1,
}

describe('DepartmentSectionEditForm Modal', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renderiza departamento dentro de un modal', async () => {
    const fetchByName = vi.fn().mockResolvedValueOnce(mockEntityDepartamento)
    areaService.obtenerAreas.mockResolvedValueOnce(mockAreas)

    render(
      <BrowserRouter>
        <DepartmentSectionEditForm
          entityType="departamento"
          fetchByName={fetchByName}
          updateEntity={vi.fn()}
          isOpen={true}
          entityName="Recursos Humanos"
          onClose={() => {}}
          onSuccess={() => {}}
        />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Editar Departamento')).toBeInTheDocument()
    })

    expect(document.querySelector('dialog')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Recursos Humanos')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Departamento de RRHH')).toBeInTheDocument()
  })

  it('renderiza sección dentro de un modal', async () => {
    const fetchByName = vi.fn().mockResolvedValueOnce(mockEntitySeccion)
    areaService.obtenerAreas.mockResolvedValueOnce(mockAreas)

    render(
      <BrowserRouter>
        <DepartmentSectionEditForm
          entityType="seccion"
          fetchByName={fetchByName}
          updateEntity={vi.fn()}
          isOpen={true}
          entityName="Contabilidad"
          onClose={() => {}}
          onSuccess={() => {}}
        />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Editar Sección')).toBeInTheDocument()
    })

    expect(document.querySelector('dialog')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Contabilidad')).toBeInTheDocument()
  })

  it('muestra cargando dentro del modal para departamento', () => {
    render(
      <BrowserRouter>
        <DepartmentSectionEditForm
          entityType="departamento"
          fetchByName={vi.fn()}
          updateEntity={vi.fn()}
          isOpen={true}
          entityName="Test"
          onClose={() => {}}
          onSuccess={() => {}}
        />
      </BrowserRouter>,
    )

    expect(document.querySelector('dialog')).toBeInTheDocument()
    expect(screen.getByText('Cargando departamento...')).toBeInTheDocument()
  })

  it('no renderiza Header ni Navbar en modo modal', async () => {
    const fetchByName = vi.fn().mockResolvedValueOnce(mockEntityDepartamento)
    areaService.obtenerAreas.mockResolvedValueOnce(mockAreas)

    render(
      <BrowserRouter>
        <DepartmentSectionEditForm
          entityType="departamento"
          fetchByName={fetchByName}
          updateEntity={vi.fn()}
          isOpen={true}
          entityName="Recursos Humanos"
          onClose={() => {}}
          onSuccess={() => {}}
        />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('Recursos Humanos')).toBeInTheDocument()
    })

    expect(screen.queryByText('Página Principal')).not.toBeInTheDocument()
  })

  it('renderiza StateToggle para cambiar estado', async () => {
    const fetchByName = vi.fn().mockResolvedValue(mockEntityDepartamento)
    areaService.obtenerAreas.mockResolvedValue(mockAreas)

    render(
      <BrowserRouter>
        <DepartmentSectionEditForm
          entityType="departamento"
          fetchByName={fetchByName}
          updateEntity={vi.fn()}
          isOpen={true}
          entityName="Recursos Humanos"
          onClose={() => {}}
          onSuccess={() => {}}
        />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Activo' })).toBeInTheDocument()
    })
  })

  it('actualiza departamento correctamente', async () => {
    const fetchByName = vi.fn().mockResolvedValueOnce(mockEntityDepartamento)
    const updateEntity = vi.fn().mockResolvedValueOnce({})
    areaService.obtenerAreas.mockResolvedValueOnce(mockAreas)

    render(
      <BrowserRouter>
        <DepartmentSectionEditForm
          entityType="departamento"
          fetchByName={fetchByName}
          updateEntity={updateEntity}
          isOpen={true}
          entityName="Recursos Humanos"
          onClose={() => {}}
          onSuccess={() => {}}
        />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nombre del departamento')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Actualizar/i }))

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Departamento actualizado correctamente', expect.anything())
    })
  })

  it('muestra error cuando falla la actualización del departamento', async () => {
    const fetchByName = vi.fn().mockResolvedValue(mockEntityDepartamento)
    const updateEntity = vi.fn().mockRejectedValueOnce(new Error('Error al actualizar departamento'))
    areaService.obtenerAreas.mockResolvedValue(mockAreas)

    render(
      <BrowserRouter>
        <DepartmentSectionEditForm
          entityType="departamento"
          fetchByName={fetchByName}
          updateEntity={updateEntity}
          isOpen={true}
          entityName="Recursos Humanos"
          onClose={() => {}}
          onSuccess={() => {}}
        />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nombre del departamento')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Actualizar/i }))

    await waitFor(() => {
      expect(updateEntity).toHaveBeenCalledTimes(1)
    })
  })

  it('llama a onClose al hacer clic en Cancelar', async () => {
    const fetchByName = vi.fn().mockResolvedValueOnce(mockEntityDepartamento)
    areaService.obtenerAreas.mockResolvedValueOnce(mockAreas)
    const onClose = vi.fn()

    render(
      <BrowserRouter>
        <DepartmentSectionEditForm
          entityType="departamento"
          fetchByName={fetchByName}
          updateEntity={vi.fn()}
          isOpen={true}
          entityName="Recursos Humanos"
          onClose={onClose}
          onSuccess={() => {}}
        />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('Recursos Humanos')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('usa entityName prop para cargar la entidad', async () => {
    const fetchByName = vi.fn().mockResolvedValueOnce(mockEntityDepartamento)
    areaService.obtenerAreas.mockResolvedValueOnce(mockAreas)

    render(
      <BrowserRouter>
        <DepartmentSectionEditForm
          entityType="departamento"
          fetchByName={fetchByName}
          updateEntity={vi.fn()}
          isOpen={true}
          entityName="Recursos Humanos"
          onClose={() => {}}
          onSuccess={() => {}}
        />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(fetchByName).toHaveBeenCalledWith('Recursos Humanos')
    })
  })
})

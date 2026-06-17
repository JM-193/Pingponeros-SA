// DepartmentSectionEditForm.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom'
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

const renderDepartamentoWithRoute = (nombre, fetchByName, updateEntity) =>
  render(
    <MemoryRouter initialEntries={[`/organizacion/departamentos/editar/${nombre}`]}>
      <Routes>
        <Route
          path="/organizacion/departamentos/editar/:nombre"
          element={
            <DepartmentSectionEditForm
              entityType="departamento"
              fetchByName={fetchByName}
              updateEntity={updateEntity}
            />
          }
        />
        <Route path="/organizacion/departamentos/consultar" element={<div>Lista</div>} />
      </Routes>
    </MemoryRouter>,
  )

const renderSeccionWithRoute = (nombre, fetchByName, updateEntity) =>
  render(
    <MemoryRouter initialEntries={[`/organizacion/secciones/editar/${nombre}`]}>
      <Routes>
        <Route
          path="/organizacion/secciones/editar/:nombre"
          element={
            <DepartmentSectionEditForm
              entityType="seccion"
              fetchByName={fetchByName}
              updateEntity={updateEntity}
            />
          }
        />
        <Route path="/organizacion/secciones/consultar" element={<div>Lista</div>} />
      </Routes>
    </MemoryRouter>,
  )

describe('DepartmentSectionEditForm', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('muestra estado de carga para departamento sin nombre en ruta', () => {
    render(
      <BrowserRouter>
        <DepartmentSectionEditForm
          entityType="departamento"
          fetchByName={vi.fn()}
          updateEntity={vi.fn()}
        />
      </BrowserRouter>,
    )

    expect(screen.getByText('Cargando departamento...')).toBeInTheDocument()
  })

  it('muestra estado de carga para sección sin nombre en ruta', () => {
    render(
      <BrowserRouter>
        <DepartmentSectionEditForm
          entityType="seccion"
          fetchByName={vi.fn()}
          updateEntity={vi.fn()}
        />
      </BrowserRouter>,
    )

    expect(screen.getByText('Cargando sección...')).toBeInTheDocument()
  })

  it('carga y renderiza formulario de editar departamento', async () => {
    const fetchByName = vi.fn().mockResolvedValueOnce(mockEntityDepartamento)
    areaService.obtenerAreas.mockResolvedValueOnce(mockAreas)

    renderDepartamentoWithRoute('Recursos Humanos', fetchByName, vi.fn())

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Editar Departamento/i })).toBeInTheDocument()
    })

    expect(screen.getByDisplayValue('Recursos Humanos')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Departamento de RRHH')).toBeInTheDocument()
  })

  it('carga y renderiza formulario de editar sección', async () => {
    const fetchByName = vi.fn().mockResolvedValueOnce(mockEntitySeccion)
    areaService.obtenerAreas.mockResolvedValueOnce(mockAreas)

    renderSeccionWithRoute('Contabilidad', fetchByName, vi.fn())

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Editar Sección/i })).toBeInTheDocument()
    })

    expect(screen.getByDisplayValue('Contabilidad')).toBeInTheDocument()
  })

  it('actualiza departamento correctamente', async () => {
    const fetchByName = vi.fn().mockResolvedValueOnce(mockEntityDepartamento)
    const updateEntity = vi.fn().mockResolvedValueOnce({})
    areaService.obtenerAreas.mockResolvedValueOnce(mockAreas)

    renderDepartamentoWithRoute('Recursos Humanos', fetchByName, updateEntity)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nombre del departamento')).toBeInTheDocument()
    })

    const submitButton = screen.getByRole('button', { name: /Actualizar/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Departamento actualizado correctamente')).toBeInTheDocument()
    })
  })

  it('muestra error cuando falla la actualización del departamento', async () => {
    const fetchByName = vi.fn().mockResolvedValue(mockEntityDepartamento)
    const updateEntity = vi.fn().mockRejectedValueOnce(new Error('Error al actualizar departamento'))
    areaService.obtenerAreas.mockResolvedValue(mockAreas)

    renderDepartamentoWithRoute('Recursos Humanos', fetchByName, updateEntity)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nombre del departamento')).toBeInTheDocument()
    })

    const submitButton = screen.getByRole('button', { name: /Actualizar/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(updateEntity).toHaveBeenCalledTimes(1)
    })
  })

  it('muestra error cuando falla la carga', async () => {
    const fetchByName = vi.fn().mockRejectedValueOnce(new Error('Departamento no encontrado'))
    areaService.obtenerAreas.mockResolvedValueOnce([])

    renderDepartamentoWithRoute('Inexistente', fetchByName, vi.fn())

    await waitFor(() => {
      expect(screen.getByText('Departamento no encontrado')).toBeInTheDocument()
    })
  })

  it('renderiza StateToggle para cambiar estado', async () => {
    const fetchByName = vi.fn().mockResolvedValue(mockEntityDepartamento)
    areaService.obtenerAreas.mockResolvedValue(mockAreas)

    renderDepartamentoWithRoute('Recursos Humanos', fetchByName, vi.fn())

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Activo' })).toBeInTheDocument()
    })
  })
})

describe('DepartmentSectionEditForm Modal Mode', () => {
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
          isModal
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
          isModal
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
          isModal
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
          isModal
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
          isModal
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

  it('usa entityName prop en lugar de useParams', async () => {
    const fetchByName = vi.fn().mockResolvedValueOnce(mockEntityDepartamento)
    areaService.obtenerAreas.mockResolvedValueOnce(mockAreas)

    render(
      <BrowserRouter>
        <DepartmentSectionEditForm
          entityType="departamento"
          fetchByName={fetchByName}
          updateEntity={vi.fn()}
          isModal
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

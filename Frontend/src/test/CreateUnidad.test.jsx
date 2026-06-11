// CreateUnits.test.jsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import CreateUnits from '../pages/CreateUnits'
import * as areaService from '../services/areaService'
import * as departmentService from '../services/departmentService'
import * as sectionService from '../services/sectionService'

vi.mock('../services/unitService')
vi.mock('../services/areaService')
vi.mock('../services/departmentService')
vi.mock('../services/sectionService')

describe('CreateUnits Page', () => {
  const mockAreas = [
    { id: 1, nombre: 'Administración' },
    { id: 2, nombre: 'Recursos Humanos' },
  ]
  const mockDepartamentos = [
    { id: 1, idArea: 1, nombre: 'Compras' },
    { id: 2, idArea: 1, nombre: 'Ventas' },
    { id: 3, idArea: 2, nombre: 'Nómina' },
  ]
  const mockSecciones = [
    { id: 1, idArea: 1, nombre: 'Soporte' },
    { id: 2, idArea: 2, nombre: 'Beneficios' },
  ]

  beforeEach(() => {
    vi.resetAllMocks()
    areaService.obtenerAreas.mockResolvedValue(mockAreas)
    departmentService.obtenerDepartamentos.mockResolvedValue(mockDepartamentos)
    sectionService.obtenerSecciones.mockResolvedValue(mockSecciones)
  })

  it('renderiza formulario de crear unidad', async () => {
    render(
      <BrowserRouter>
        <CreateUnits />
      </BrowserRouter>,
    )

    expect(await screen.findByRole('heading', { name: /Crear Unidad/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Nombre de la unidad')).toBeInTheDocument()
  })

  it('renderiza Header y Navbar', async () => {
    render(
      <BrowserRouter>
        <CreateUnits />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Página Principal')).toBeInTheDocument()
    })
  })

  it('carga opciones de área, departamento y sección en el montaje', async () => {
    render(
      <BrowserRouter>
        <CreateUnits />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(areaService.obtenerAreas).toHaveBeenCalled()
      expect(departmentService.obtenerDepartamentos).toHaveBeenCalled()
      expect(sectionService.obtenerSecciones).toHaveBeenCalled()
    })
  })

  it('cambia el tipo de dependencia a departamento', async () => {
    const { container } = render(
      <BrowserRouter>
        <CreateUnits />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nombre de la unidad')).toBeInTheDocument()
    })

    const parentTypeSelect = container.querySelector('select[name="parentType"]')
    fireEvent.change(parentTypeSelect, { target: { value: 'departamento' } })

    await waitFor(() => {
      expect(parentTypeSelect.value).toBe('departamento')
    })
  })

  it('cambia el tipo de dependencia a sección', async () => {
    const { container } = render(
      <BrowserRouter>
        <CreateUnits />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nombre de la unidad')).toBeInTheDocument()
    })

    const parentTypeSelect = container.querySelector('select[name="parentType"]')
    fireEvent.change(parentTypeSelect, { target: { value: 'seccion' } })

    await waitFor(() => {
      expect(parentTypeSelect.value).toBe('seccion')
    })
  })

  it('filtra departamentos por área seleccionada', async () => {
    const { container } = render(
      <BrowserRouter>
        <CreateUnits />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nombre de la unidad')).toBeInTheDocument()
    })

    const parentTypeSelect = container.querySelector('select[name="parentType"]')
    fireEvent.change(parentTypeSelect, { target: { value: 'departamento' } })

    // Cambiar área
    const areaSelect = container.querySelector('select[name="idArea"]')
    fireEvent.change(areaSelect, { target: { value: '1' } })

    await waitFor(() => {
      expect(areaSelect.value).toBe('1')
    })
  })

  it('filtra secciones por área seleccionada', async () => {
    const { container } = render(
      <BrowserRouter>
        <CreateUnits />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nombre de la unidad')).toBeInTheDocument()
    })

    const parentTypeSelect = container.querySelector('select[name="parentType"]')
    fireEvent.change(parentTypeSelect, { target: { value: 'seccion' } })

    const areaSelect = container.querySelector('select[name="idArea"]')
    fireEvent.change(areaSelect, { target: { value: '2' } })

    await waitFor(() => {
      expect(areaSelect.value).toBe('2')
    })
  })

  it('muestra error cuando el departamento seleccionado no pertenece al área', async () => {
    const { container } = render(
      <BrowserRouter>
        <CreateUnits />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nombre de la unidad')).toBeInTheDocument()
    })

    const parentTypeSelect = container.querySelector('select[name="parentType"]')
    fireEvent.change(parentTypeSelect, { target: { value: 'departamento' } })

    const areaSelect = container.querySelector('select[name="idArea"]')
    const deptSelect = container.querySelector('select[name="idDepartamento"]')

    fireEvent.change(areaSelect, { target: { value: '1' } })
    fireEvent.change(deptSelect, { target: { value: '1' } })

    fireEvent.change(areaSelect, { target: { value: '2' } })

    await waitFor(() => {
      expect(screen.getByText(/El departamento seleccionado no pertenece al área elegida/)).toBeInTheDocument()
    })
  })

  it('muestra error cuando la sección seleccionada no pertenece al área', async () => {
    const { container } = render(
      <BrowserRouter>
        <CreateUnits />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nombre de la unidad')).toBeInTheDocument()
    })

    const parentTypeSelect = container.querySelector('select[name="parentType"]')
    fireEvent.change(parentTypeSelect, { target: { value: 'seccion' } })

    const areaSelect = container.querySelector('select[name="idArea"]')
    const secSelect = container.querySelector('select[name="idSeccion"]')

    fireEvent.change(areaSelect, { target: { value: '1' } })
    fireEvent.change(secSelect, { target: { value: '1' } })

    fireEvent.change(areaSelect, { target: { value: '2' } })

    await waitFor(() => {
      expect(screen.getByText(/La sección seleccionada no pertenece al área elegida/)).toBeInTheDocument()
    })
  })

  it('limpia el error cuando se cambia el tipo de dependencia', async () => {
    const { container } = render(
      <BrowserRouter>
        <CreateUnits />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nombre de la unidad')).toBeInTheDocument()
    })

    const parentTypeSelect = container.querySelector('select[name="parentType"]')
    fireEvent.change(parentTypeSelect, { target: { value: 'departamento' } })

    const areaSelect = container.querySelector('select[name="idArea"]')
    const deptSelect = container.querySelector('select[name="idDepartamento"]')

    fireEvent.change(areaSelect, { target: { value: '1' } })
    fireEvent.change(deptSelect, { target: { value: '1' } })
    fireEvent.change(areaSelect, { target: { value: '2' } })

    await waitFor(() => {
      expect(screen.getByText(/El departamento seleccionado no pertenece al área elegida/)).toBeInTheDocument()
    })

    fireEvent.change(parentTypeSelect, { target: { value: 'seccion' } })

    await waitFor(() => {
      expect(screen.queryByText(/El departamento seleccionado no pertenece al área elegida/)).not.toBeInTheDocument()
    })
  })
})

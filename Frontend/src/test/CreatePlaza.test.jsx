// CreatePositions.test.jsx
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import CreatePositions from '../pages/CreatePositions'
import * as positionService from '../services/positionService'
import * as unitService from '../services/unitService'
import * as departmentService from '../services/departmentService'
import * as sectionService from '../services/sectionService'
import * as areaService from '../services/areaService'

vi.mock('../services/positionService')
vi.mock('../services/unitService')
vi.mock('../services/departmentService')
vi.mock('../services/sectionService')
vi.mock('../services/areaService')

const mockUnidades = [{ id: 1, nombre: 'Administración' }]
const mockDepartamentos = [{ id: 1, nombre: 'Compras' }]
const mockSecciones = [{ id: 1, nombre: 'Soporte' }]
const mockAreas = [{ id: 1, nombre: 'Central' }]

describe('CreatePositions Page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    unitService.obtenerUnidades.mockResolvedValue(mockUnidades)
    departmentService.obtenerDepartamentos.mockResolvedValue(mockDepartamentos)
    sectionService.obtenerSecciones.mockResolvedValue(mockSecciones)
    areaService.obtenerAreas.mockResolvedValue(mockAreas)
  })

  it('muestra indicador de carga mientras carga opciones', () => {
    // Las mocks resuelven de forma asíncrona, así que al montar debería verse cargando
    unitService.obtenerUnidades.mockImplementation(() => new Promise(() => {}))
    departmentService.obtenerDepartamentos.mockImplementation(() => new Promise(() => {}))
    sectionService.obtenerSecciones.mockImplementation(() => new Promise(() => {}))
    areaService.obtenerAreas.mockImplementation(() => new Promise(() => {}))

    render(
      <BrowserRouter>
        <CreatePositions />
      </BrowserRouter>,
    )

    expect(screen.getByText(/Cargando datos de organización/i)).toBeInTheDocument()
  })

  it('renderiza formulario después de cargar opciones', async () => {
    render(
      <BrowserRouter>
        <CreatePositions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Crear Plaza/i })).toBeInTheDocument()
    })

    expect(screen.getByLabelText(/Número de Plaza/i)).toBeInTheDocument()
  })

  it('renderiza Header y Navbar', async () => {
    render(
      <BrowserRouter>
        <CreatePositions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Página Principal')).toBeInTheDocument()
    })
  })

  it('muestra error cuando el número de plaza está vacío', async () => {
    render(
      <BrowserRouter>
        <CreatePositions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Crear Plaza/i })).toBeInTheDocument()
    })

    const form = document.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    expect(screen.getByText('El número de plaza es obligatorio.')).toBeInTheDocument()
  })

  it('muestra error cuando el número de plaza es cero o negativo', async () => {
    render(
      <BrowserRouter>
        <CreatePositions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Crear Plaza/i })).toBeInTheDocument()
    })

    const numeroInput = screen.getByLabelText(/Número de Plaza/i)
    fireEvent.change(numeroInput, { target: { value: '0' } })

    const form = document.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    expect(screen.getByText('El número de plaza debe ser un entero positivo.')).toBeInTheDocument()
  })

  it('solo permite dígitos en el campo número de plaza', async () => {
    render(
      <BrowserRouter>
        <CreatePositions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Crear Plaza/i })).toBeInTheDocument()
    })

    const numeroInput = screen.getByLabelText(/Número de Plaza/i)
    fireEvent.change(numeroInput, { target: { value: '12abc' } })

    expect(numeroInput.value).toBe('12')
  })

  it('limpia mensajes de error al cambiar el campo', async () => {
    render(
      <BrowserRouter>
        <CreatePositions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Crear Plaza/i })).toBeInTheDocument()
    })

    const form = document.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    expect(screen.getByText('El número de plaza es obligatorio.')).toBeInTheDocument()

    const numeroInput = screen.getByLabelText(/Número de Plaza/i)
    fireEvent.change(numeroInput, { target: { value: '5' } })

    expect(screen.queryByText('El número de plaza es obligatorio.')).not.toBeInTheDocument()
  })

  it('crea plaza correctamente y muestra mensaje de éxito', async () => {
    positionService.crearPlaza.mockResolvedValueOnce({ numeroPlaza: 5 })

    render(
      <BrowserRouter>
        <CreatePositions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Crear Plaza/i })).toBeInTheDocument()
    })

    const numeroInput = screen.getByLabelText(/Número de Plaza/i)
    fireEvent.change(numeroInput, { target: { value: '5' } })

    const form = document.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    await waitFor(() => {
      expect(screen.getByText(/Plaza '5' creada correctamente/i)).toBeInTheDocument()
    })

    expect(positionService.crearPlaza).toHaveBeenCalledWith(
      expect.objectContaining({ numeroPlaza: 5 }),
    )
  })

  it('mantiene la unidad seleccionada cuando el área se infiere desde su departamento', async () => {
    unitService.obtenerUnidades.mockResolvedValueOnce([
      { id: 1, nombre: 'Portal', idDepartamento: 1 },
    ])
    departmentService.obtenerDepartamentos.mockResolvedValueOnce([
      { id: 1, nombre: 'ITI', idArea: 1 },
    ])

    render(
      <BrowserRouter>
        <CreatePositions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Crear Plaza/i })).toBeInTheDocument()
    })

    const unidadSelect = screen.getByLabelText(/Unidad/i)
    fireEvent.change(unidadSelect, { target: { value: '1' } })

    await waitFor(() => {
      expect(unidadSelect.value).toBe('1')
      expect(screen.getByLabelText(/Departamento/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Departamento/i).value).toBe('1')
      expect(screen.getByLabelText(/Área/i).value).toBe('1')
    })
  })

  it('muestra el selector de tipo de dependencia y alterna entre departamento y sección', async () => {
    render(
      <BrowserRouter>
        <CreatePositions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Crear Plaza/i })).toBeInTheDocument()
    })

    const parentTypeSelect = screen.getByLabelText(/Tipo de dependencia/i)

    expect(screen.queryByLabelText(/Departamento/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Sección/i)).not.toBeInTheDocument()

    fireEvent.change(parentTypeSelect, { target: { value: 'departamento' } })

    expect(screen.getByLabelText(/Departamento/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/Sección/i)).not.toBeInTheDocument()

    fireEvent.change(parentTypeSelect, { target: { value: 'seccion' } })

    expect(screen.getByLabelText(/Sección/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/Departamento/i)).not.toBeInTheDocument()
  })

  it('envía null en campos opcionales no seleccionados', async () => {
    positionService.crearPlaza.mockResolvedValueOnce({ numeroPlaza: 8 })

    render(
      <BrowserRouter>
        <CreatePositions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Crear Plaza/i })).toBeInTheDocument()
    })

    const numeroInput = screen.getByLabelText(/Número de Plaza/i)
    fireEvent.change(numeroInput, { target: { value: '8' } })

    const form = document.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    await waitFor(() => {
      expect(positionService.crearPlaza).toHaveBeenCalledWith({
        numeroPlaza: 8,
        idUnidad: null,
        idDepartamento: null,
        idSeccion: null,
        idArea: null,
      })
    })
  })

  it('muestra mensaje de error cuando la creación falla', async () => {
    positionService.crearPlaza.mockRejectedValueOnce(new Error('La plaza ya existe'))

    render(
      <BrowserRouter>
        <CreatePositions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Crear Plaza/i })).toBeInTheDocument()
    })

    const numeroInput = screen.getByLabelText(/Número de Plaza/i)
    fireEvent.change(numeroInput, { target: { value: '3' } })

    const form = document.querySelector('form')
    await act(async () => { fireEvent.submit(form) })

    await waitFor(() => {
      expect(screen.getByText('La plaza ya existe')).toBeInTheDocument()
    })
  })

  it('muestra error cuando falla la carga de opciones', async () => {
    unitService.obtenerUnidades.mockRejectedValueOnce(new Error('Error al cargar unidades'))

    render(
      <BrowserRouter>
        <CreatePositions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText(/Error al cargar opciones/i)).toBeInTheDocument()
    })
  })
})

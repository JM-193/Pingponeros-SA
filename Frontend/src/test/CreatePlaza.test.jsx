// CreatePlaza.test.jsx
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import CreatePlaza from '../pages/CreatePlaza'
import * as plazaService from '../services/plazaService'
import * as unidadService from '../services/unidadService'
import * as departamentoService from '../services/departmentService'
import * as seccionService from '../services/seccionService'
import * as areaService from '../services/areaService'

vi.mock('../services/plazaService')
vi.mock('../services/unidadService')
vi.mock('../services/departmentService')
vi.mock('../services/seccionService')
vi.mock('../services/areaService')

const mockUnidades = [{ id: 1, nombre: 'Administración' }]
const mockDepartamentos = [{ id: 1, nombre: 'Compras' }]
const mockSecciones = [{ id: 1, nombre: 'Soporte' }]
const mockAreas = [{ id: 1, nombre: 'Central' }]

describe('CreatePlaza Page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    unidadService.obtenerUnidades.mockResolvedValue(mockUnidades)
    departamentoService.obtenerDepartamentos.mockResolvedValue(mockDepartamentos)
    seccionService.obtenerSecciones.mockResolvedValue(mockSecciones)
    areaService.obtenerAreas.mockResolvedValue(mockAreas)
  })

  it('muestra indicador de carga mientras carga opciones', () => {
    // Las mocks resuelven de forma asíncrona, así que al montar debería verse cargando
    unidadService.obtenerUnidades.mockImplementation(() => new Promise(() => {}))
    departamentoService.obtenerDepartamentos.mockImplementation(() => new Promise(() => {}))
    seccionService.obtenerSecciones.mockImplementation(() => new Promise(() => {}))
    areaService.obtenerAreas.mockImplementation(() => new Promise(() => {}))

    render(
      <BrowserRouter>
        <CreatePlaza />
      </BrowserRouter>,
    )

    expect(screen.getByText(/Cargando datos de organización/i)).toBeInTheDocument()
  })

  it('renderiza formulario después de cargar opciones', async () => {
    render(
      <BrowserRouter>
        <CreatePlaza />
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
        <CreatePlaza />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Página Principal')).toBeInTheDocument()
    })
  })

  it('muestra error cuando el número de plaza está vacío', async () => {
    render(
      <BrowserRouter>
        <CreatePlaza />
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
        <CreatePlaza />
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
        <CreatePlaza />
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
        <CreatePlaza />
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
    plazaService.crearPlaza.mockResolvedValueOnce({ numeroPlaza: 5 })

    render(
      <BrowserRouter>
        <CreatePlaza />
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

    expect(plazaService.crearPlaza).toHaveBeenCalledWith(
      expect.objectContaining({ numeroPlaza: 5 }),
    )
  })

  it('mantiene la unidad seleccionada cuando el area se infiere desde su departamento', async () => {
    unidadService.obtenerUnidades.mockResolvedValueOnce([
      { id: 1, nombre: 'Portal', idDepartamento: 1 },
    ])
    departamentoService.obtenerDepartamentos.mockResolvedValueOnce([
      { id: 1, nombre: 'ITI', idArea: 1 },
    ])

    render(
      <BrowserRouter>
        <CreatePlaza />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Crear Plaza/i })).toBeInTheDocument()
    })

    const unidadSelect = document.querySelector('select[name="idUnidad"]')
    const departamentoSelect = document.querySelector('select[name="idDepartamento"]')
    const areaSelect = document.querySelector('select[name="idArea"]')

    fireEvent.change(unidadSelect, { target: { value: '1' } })

    await waitFor(() => {
      expect(unidadSelect.value).toBe('1')
      expect(departamentoSelect.value).toBe('1')
      expect(areaSelect.value).toBe('1')
    })
  })

  it('envía null en campos opcionales no seleccionados', async () => {
    plazaService.crearPlaza.mockResolvedValueOnce({ numeroPlaza: 8 })

    render(
      <BrowserRouter>
        <CreatePlaza />
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
      expect(plazaService.crearPlaza).toHaveBeenCalledWith({
        numeroPlaza: 8,
        idUnidad: null,
        idDepartamento: null,
        idSeccion: null,
        idArea: null,
      })
    })
  })

  it('muestra mensaje de error cuando la creación falla', async () => {
    plazaService.crearPlaza.mockRejectedValueOnce(new Error('La plaza ya existe'))

    render(
      <BrowserRouter>
        <CreatePlaza />
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
    unidadService.obtenerUnidades.mockRejectedValueOnce(new Error('Error al cargar unidades'))

    render(
      <BrowserRouter>
        <CreatePlaza />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText(/Error al cargar opciones/i)).toBeInTheDocument()
    })
  })
})

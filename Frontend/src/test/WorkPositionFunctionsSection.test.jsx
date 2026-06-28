// AsignarFuncionPuesto.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { toast } from 'react-toastify'
import WorkPositionFunctionsSection from '../components/WorkPositionFunctionsSection'
import * as workPositionService from '../services/workPositionService'
import * as functionService from '../services/functionService'

vi.mock('../services/workPositionService')
vi.mock('../services/functionService')

const PUESTO = { id: 3, nombre: 'Chofer interno' }

const funcionAsignada = { id: 1, nombre: 'Transportar funcionario', descripcion: 'Transportar al funcionario designado' }
const funcionDisponible = { id: 2, nombre: 'Elaborar informes', descripcion: 'Redactar informes mensuales' }
const todasLasFunciones = [funcionAsignada, funcionDisponible]

describe('WorkPositionFunctionsSection', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    workPositionService.obtenerFuncionesDePuesto.mockResolvedValue([])
    workPositionService.agregarFuncionAPuesto.mockResolvedValue({})
    workPositionService.quitarFuncionDePuesto.mockResolvedValue({})
    functionService.obtenerFunciones.mockResolvedValue(todasLasFunciones)
  })

  it('muestra mensaje cuando el puesto no tiene funciones asignadas', async () => {
    render(<WorkPositionFunctionsSection puesto={PUESTO} />)

    await waitFor(() => {
      expect(screen.getByText('Este puesto no tiene funciones asignadas.')).toBeInTheDocument()
    })
  })

  it('llama a obtenerFuncionesDePuesto y obtenerFunciones al montar', async () => {
    render(<WorkPositionFunctionsSection puesto={PUESTO} />)

    await waitFor(() => {
      expect(workPositionService.obtenerFuncionesDePuesto).toHaveBeenCalledWith(PUESTO.id)
      expect(functionService.obtenerFunciones).toHaveBeenCalled()
    })
  })

  it('renderiza la tabla con las funciones asignadas', async () => {
    workPositionService.obtenerFuncionesDePuesto.mockResolvedValue([funcionAsignada])
    functionService.obtenerFunciones.mockResolvedValue([funcionAsignada])

    render(<WorkPositionFunctionsSection puesto={PUESTO} />)

    await waitFor(() => {
      expect(screen.getByText('Transportar funcionario')).toBeInTheDocument()
      expect(screen.getByText('Transportar al funcionario designado')).toBeInTheDocument()
    })
  })

  it('muestra en el select solo las funciones no asignadas', async () => {
    workPositionService.obtenerFuncionesDePuesto.mockResolvedValue([funcionAsignada])
    functionService.obtenerFunciones.mockResolvedValue(todasLasFunciones)

    render(<WorkPositionFunctionsSection puesto={PUESTO} />)

    await waitFor(() => {
      expect(screen.getByText('Transportar funcionario')).toBeInTheDocument()
    })

    const select = screen.getByLabelText(/Función disponible/i)
    const opciones = Array.from(select.querySelectorAll('option')).map((o) => o.textContent)
    expect(opciones).toContain('Elaborar informes')
    expect(opciones).not.toContain('Transportar funcionario')
  })

  it('muestra mensaje en select cuando todas las funciones ya están asignadas', async () => {
    workPositionService.obtenerFuncionesDePuesto.mockResolvedValue(todasLasFunciones)
    functionService.obtenerFunciones.mockResolvedValue(todasLasFunciones)

    render(<WorkPositionFunctionsSection puesto={PUESTO} />)

    await waitFor(() => {
      expect(screen.getByText('Transportar funcionario')).toBeInTheDocument()
    })

    expect(screen.getByText('Todas las funciones ya están asignadas')).toBeInTheDocument()
  })

  it('muestra error de validación si se hace clic en Agregar sin seleccionar función', async () => {
    render(<WorkPositionFunctionsSection puesto={PUESTO} />)

    await waitFor(() => {
      expect(functionService.obtenerFunciones).toHaveBeenCalled()
    })

    fireEvent.click(screen.getByRole('button', { name: /Agregar/i }))

    await waitFor(() => {
      // El texto aparece en el <option> por defecto y en el <span> de error
      expect(screen.getAllByText('Seleccione una función')).toHaveLength(2)
    })
    expect(workPositionService.agregarFuncionAPuesto).not.toHaveBeenCalled()
  })

  it('agrega una función llamando al servicio con los parámetros correctos', async () => {
    workPositionService.obtenerFuncionesDePuesto.mockResolvedValue([])
    functionService.obtenerFunciones.mockResolvedValue([funcionDisponible])

    render(<WorkPositionFunctionsSection puesto={PUESTO} />)

    await waitFor(() => {
      expect(functionService.obtenerFunciones).toHaveBeenCalled()
    })

    fireEvent.change(screen.getByLabelText(/Función disponible/i), {
      target: { value: String(funcionDisponible.id) },
    })
    fireEvent.click(screen.getByRole('button', { name: /Agregar/i }))

    await waitFor(() => {
      expect(workPositionService.agregarFuncionAPuesto).toHaveBeenCalledWith(PUESTO.id, funcionDisponible.id)
    })
    expect(toast.success).toHaveBeenCalled()
  })

  it('desvincula una función al confirmar eliminación', async () => {
    workPositionService.obtenerFuncionesDePuesto.mockResolvedValue([funcionAsignada])
    functionService.obtenerFunciones.mockResolvedValue([funcionAsignada])

    render(<WorkPositionFunctionsSection puesto={PUESTO} />)

    await waitFor(() => {
      expect(screen.getByText('Transportar funcionario')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))

    await waitFor(() => {
      expect(workPositionService.quitarFuncionDePuesto).toHaveBeenCalledWith(PUESTO.id, funcionAsignada.id)
    })
    expect(toast.success).toHaveBeenCalled()
  })

  it('renderiza botones de eliminar para cada función asignada', async () => {
    workPositionService.obtenerFuncionesDePuesto.mockResolvedValue([funcionAsignada, funcionDisponible])
    functionService.obtenerFunciones.mockResolvedValue([funcionAsignada, funcionDisponible])

    render(<WorkPositionFunctionsSection puesto={PUESTO} />)

    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button', { name: /Eliminar/i })
      expect(deleteButtons).toHaveLength(2)
    })
  })

  it('muestra el botón Cerrar cuando se provee onClose', async () => {
    const onClose = vi.fn()
    render(<WorkPositionFunctionsSection puesto={PUESTO} onClose={onClose} />)

    await waitFor(() => {
      expect(functionService.obtenerFunciones).toHaveBeenCalled()
    })

    expect(screen.getByRole('button', { name: /Cerrar/i })).toBeInTheDocument()
  })

  it('llama a onClose al hacer clic en Cerrar', async () => {
    const onClose = vi.fn()
    render(<WorkPositionFunctionsSection puesto={PUESTO} onClose={onClose} />)

    await waitFor(() => {
      expect(functionService.obtenerFunciones).toHaveBeenCalled()
    })

    fireEvent.click(screen.getByRole('button', { name: /Cerrar/i }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('no muestra el botón Cerrar cuando no se provee onClose', async () => {
    render(<WorkPositionFunctionsSection puesto={PUESTO} />)

    await waitFor(() => {
      expect(functionService.obtenerFunciones).toHaveBeenCalled()
    })

    expect(screen.queryByRole('button', { name: /Cerrar/i })).not.toBeInTheDocument()
  })
})

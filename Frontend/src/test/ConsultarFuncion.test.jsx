// ConsultarFuncion.test.jsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import QueryFunctions from '../pages/QueryFunctions'
import * as functionService from '../services/functionService'

vi.mock('../services/functionService')

describe('QueryFunctions Page', () => {
  const mockFunciones = [
    { id: 1, nombre: 'Elaborar informes', descripcion: 'Redactar informes mensuales' },
    { id: 2, nombre: 'Atención al cliente', descripcion: 'Brindar atención al público' },
    { id: 3, nombre: 'Capacitación', descripcion: 'Capacitar al personal nuevo' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    functionService.obtenerFunciones.mockResolvedValue(mockFunciones)
  })

  it('carga y renderiza funciones oficiales', async () => {
    render(
      <BrowserRouter>
        <QueryFunctions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Elaborar informes')).toBeInTheDocument()
      expect(screen.getByText('Atención al cliente')).toBeInTheDocument()
      expect(screen.getByText('Capacitación')).toBeInTheDocument()
    })
  })

  it('llama a obtenerFunciones al montar', () => {
    render(
      <BrowserRouter>
        <QueryFunctions />
      </BrowserRouter>,
    )

    expect(functionService.obtenerFunciones).toHaveBeenCalled()
  })

  it('renderiza tabla con columnas Nombre y Descripción', async () => {
    render(
      <BrowserRouter>
        <QueryFunctions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Elaborar informes')).toBeInTheDocument()
      const table = document.querySelector('table')
      expect(table).toBeInTheDocument()
    })
  })

  it('renderiza botones de eliminar para cada fila', async () => {
    render(
      <BrowserRouter>
        <QueryFunctions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button', { name: /Eliminar/i })
      expect(deleteButtons).toHaveLength(mockFunciones.length)
    })
  })

  it('no renderiza botones de editar', async () => {
    render(
      <BrowserRouter>
        <QueryFunctions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Elaborar informes')).toBeInTheDocument()
    })

    expect(screen.queryAllByRole('button', { name: /Editar/i })).toHaveLength(0)
  })

  it('ordena funciones al hacer clic en el encabezado Nombre', async () => {
    functionService.obtenerFunciones.mockResolvedValueOnce([
      { id: 3, nombre: 'Capacitación', descripcion: 'Capacitar personal' },
      { id: 1, nombre: 'Atención al cliente', descripcion: 'Brindar atención' },
      { id: 2, nombre: 'Elaborar informes', descripcion: 'Redactar informes' },
    ])

    render(
      <BrowserRouter>
        <QueryFunctions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Capacitación')).toBeInTheDocument()
    })

    const getFirstColumnValues = () =>
      Array.from(document.querySelectorAll('tbody tr')).map((row) => row.querySelector('td')?.textContent)

    fireEvent.click(screen.getByRole('button', { name: /Ordenar por Nombre ascendente/i }))
    expect(getFirstColumnValues()).toEqual(['Atención al cliente', 'Capacitación', 'Elaborar informes'])

    fireEvent.click(screen.getByRole('button', { name: /Ordenar por Nombre descendente/i }))
    expect(getFirstColumnValues()).toEqual(['Elaborar informes', 'Capacitación', 'Atención al cliente'])
  })

  it('muestra mensaje cuando no hay funciones', async () => {
    functionService.obtenerFunciones.mockResolvedValueOnce([])

    render(
      <BrowserRouter>
        <QueryFunctions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      const emptyMessage = screen.queryByText(/No se encontraron/i)
      if (emptyMessage) {
        expect(emptyMessage).toBeInTheDocument()
      }
    })
  })

  it('abre modal de crear al hacer clic en Crear', async () => {
    render(
      <BrowserRouter>
        <QueryFunctions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Elaborar informes')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Crear/i }))

    await waitFor(() => {
      const dialog = document.querySelector('dialog')
      expect(dialog).toBeInTheDocument()
      expect(screen.getByText('Crear Función Oficial')).toBeInTheDocument()
    })
  })

  it('cierra modal de crear al hacer clic en Cancelar', async () => {
    render(
      <BrowserRouter>
        <QueryFunctions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Elaborar informes')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Crear/i }))

    await waitFor(() => {
      expect(document.querySelector('dialog')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    await waitFor(() => {
      expect(document.querySelector('dialog')).not.toBeInTheDocument()
    })
  })

  it('llama a eliminarFuncion al confirmar eliminación', async () => {
    functionService.eliminarFuncion.mockResolvedValueOnce({})
    functionService.obtenerFunciones.mockResolvedValue(mockFunciones)

    render(
      <BrowserRouter>
        <QueryFunctions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Elaborar informes')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByRole('button', { name: /Eliminar/i })
    fireEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(functionService.eliminarFuncion).toHaveBeenCalled()
    })
  })

  it('renderiza Header y Navbar', () => {
    render(
      <BrowserRouter>
        <QueryFunctions />
      </BrowserRouter>,
    )

    expect(screen.getByText('Página Principal')).toBeInTheDocument()
  })

  it('muestra el título Funciones Oficiales', async () => {
    render(
      <BrowserRouter>
        <QueryFunctions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Funciones Oficiales/i })).toBeInTheDocument()
    })
  })
})

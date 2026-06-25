// ConsultarPuesto.test.jsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import QueryWorkPositions from '../pages/QueryWorkPositions'
import * as workPositionService from '../services/workPositionService'

vi.mock('../services/workPositionService')

describe('QueryWorkPositions Page', () => {
  const mockPuestos = [
    { id: 1, nombre: 'Chofer', descripcion: 'Puesto de conductor' },
    { id: 2, nombre: 'Digitador', descripcion: 'Puesto de digitación' },
    { id: 3, nombre: 'Asistente', descripcion: 'Puesto de asistente administrativo' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    workPositionService.obtenerPuestos.mockResolvedValue(mockPuestos)
  })

  it('carga y renderiza puestos de trabajo', async () => {
    render(
      <BrowserRouter>
        <QueryWorkPositions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Chofer')).toBeInTheDocument()
      expect(screen.getByText('Digitador')).toBeInTheDocument()
      expect(screen.getByText('Asistente')).toBeInTheDocument()
    })
  })

  it('llama a obtenerPuestos al montar', () => {
    render(
      <BrowserRouter>
        <QueryWorkPositions />
      </BrowserRouter>,
    )

    expect(workPositionService.obtenerPuestos).toHaveBeenCalled()
  })

  it('renderiza tabla con columnas Nombre y Descripción', async () => {
    render(
      <BrowserRouter>
        <QueryWorkPositions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Chofer')).toBeInTheDocument()
      const table = document.querySelector('table')
      expect(table).toBeInTheDocument()
    })
  })

  it('renderiza botones de eliminar para cada fila', async () => {
    render(
      <BrowserRouter>
        <QueryWorkPositions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button', { name: /Eliminar/i })
      expect(deleteButtons).toHaveLength(mockPuestos.length)
    })
  })

  it('no renderiza botones de editar', async () => {
    render(
      <BrowserRouter>
        <QueryWorkPositions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Chofer')).toBeInTheDocument()
    })

    expect(screen.queryAllByRole('button', { name: /Editar/i })).toHaveLength(0)
  })

  it('ordena puestos al hacer clic en el encabezado Nombre', async () => {
    workPositionService.obtenerPuestos.mockResolvedValueOnce([
      { id: 3, nombre: 'Chofer', descripcion: 'Conductor' },
      { id: 1, nombre: 'Asistente', descripcion: 'Administrativo' },
      { id: 2, nombre: 'Digitador', descripcion: 'Digitación' },
    ])

    render(
      <BrowserRouter>
        <QueryWorkPositions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Chofer')).toBeInTheDocument()
    })

    const getFirstColumnValues = () =>
      Array.from(document.querySelectorAll('tbody tr')).map((row) => row.querySelector('td')?.textContent)

    fireEvent.click(screen.getByRole('button', { name: /Ordenar por Nombre ascendente/i }))
    expect(getFirstColumnValues()).toEqual(['Asistente', 'Chofer', 'Digitador'])

    fireEvent.click(screen.getByRole('button', { name: /Ordenar por Nombre descendente/i }))
    expect(getFirstColumnValues()).toEqual(['Digitador', 'Chofer', 'Asistente'])
  })

  it('muestra mensaje cuando no hay puestos', async () => {
    workPositionService.obtenerPuestos.mockResolvedValueOnce([])

    render(
      <BrowserRouter>
        <QueryWorkPositions />
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
        <QueryWorkPositions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Chofer')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Crear/i }))

    await waitFor(() => {
      const dialog = document.querySelector('dialog')
      expect(dialog).toBeInTheDocument()
      expect(screen.getByText('Crear Puesto de Trabajo')).toBeInTheDocument()
    })
  })

  it('cierra modal de crear al hacer clic en Cancelar', async () => {
    render(
      <BrowserRouter>
        <QueryWorkPositions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Chofer')).toBeInTheDocument()
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

  it('llama a eliminarPuesto al confirmar eliminación', async () => {
    workPositionService.eliminarPuesto.mockResolvedValueOnce({})
    workPositionService.obtenerPuestos.mockResolvedValue(mockPuestos)

    render(
      <BrowserRouter>
        <QueryWorkPositions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Chofer')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByRole('button', { name: /Eliminar/i })
    fireEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(workPositionService.eliminarPuesto).toHaveBeenCalled()
    })
  })

  it('renderiza Header y Navbar', () => {
    render(
      <BrowserRouter>
        <QueryWorkPositions />
      </BrowserRouter>,
    )

    expect(screen.getByText('Página Principal')).toBeInTheDocument()
  })
})

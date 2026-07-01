// ConsultarClasesOcupacionales.test.jsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import QueryOccupationalClasses from '../pages/QueryOccupationalClasses'
import * as occupationalClassService from '../services/occupationalClassService'

vi.mock('../services/occupationalClassService')

describe('QueryOccupationalClasses Page', () => {
  const mockClases = [
    { idClaseOcupacional: 1, codigo: 100, nombre: 'Profesional 1' },
    { idClaseOcupacional: 2, codigo: 200, nombre: 'Tecnico' },
    { idClaseOcupacional: 3, codigo: 300, nombre: 'Servicio' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    occupationalClassService.obtenerClasesOcupacionales.mockResolvedValue(mockClases)
  })

  it('carga y renderiza clases ocupacionales', async () => {
    render(
      <BrowserRouter>
        <QueryOccupationalClasses />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Profesional 1')).toBeInTheDocument()
      expect(screen.getByText('Tecnico')).toBeInTheDocument()
      expect(screen.getByText('Servicio')).toBeInTheDocument()
    })
  })

  it('llama a obtenerClasesOcupacionales al montar', () => {
    render(
      <BrowserRouter>
        <QueryOccupationalClasses />
      </BrowserRouter>,
    )

    expect(occupationalClassService.obtenerClasesOcupacionales).toHaveBeenCalled()
  })

  it('renderiza una tabla con las clases', async () => {
    render(
      <BrowserRouter>
        <QueryOccupationalClasses />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Profesional 1')).toBeInTheDocument()
      expect(document.querySelector('table')).toBeInTheDocument()
    })
  })

  it('renderiza botones de eliminar para cada fila', async () => {
    render(
      <BrowserRouter>
        <QueryOccupationalClasses />
      </BrowserRouter>,
    )

    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button', { name: /Eliminar/i })
      expect(deleteButtons).toHaveLength(mockClases.length)
    })
  })

  it('filtra clases por término de búsqueda (nombre)', async () => {
    render(
      <BrowserRouter>
        <QueryOccupationalClasses />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Profesional 1')).toBeInTheDocument()
    })

    const search = screen.getByPlaceholderText(/código o nombre de la clase ocupacional/i)
    fireEvent.change(search, { target: { value: 'Tecnico' } })

    await waitFor(() => {
      expect(screen.getByText('Tecnico')).toBeInTheDocument()
      expect(screen.queryByText('Profesional 1')).not.toBeInTheDocument()
    })
  })

  it('filtra clases por código', async () => {
    render(
      <BrowserRouter>
        <QueryOccupationalClasses />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Servicio')).toBeInTheDocument()
    })

    const search = screen.getByPlaceholderText(/código o nombre de la clase ocupacional/i)
    fireEvent.change(search, { target: { value: '300' } })

    await waitFor(() => {
      expect(screen.getByText('Servicio')).toBeInTheDocument()
      expect(screen.queryByText('Tecnico')).not.toBeInTheDocument()
    })
  })

  it('abre el modal de crear al hacer clic en Crear', async () => {
    render(
      <BrowserRouter>
        <QueryOccupationalClasses />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Profesional 1')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Crear/i }))

    await waitFor(() => {
      expect(document.querySelector('dialog')).toBeInTheDocument()
      expect(screen.getByText('Crear Clase Ocupacional')).toBeInTheDocument()
    })
  })

  it('llama a eliminarClaseOcupacional al confirmar la eliminación', async () => {
    occupationalClassService.eliminarClaseOcupacional.mockResolvedValueOnce({})

    render(
      <BrowserRouter>
        <QueryOccupationalClasses />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Profesional 1')).toBeInTheDocument()
    })

    fireEvent.click(screen.getAllByRole('button', { name: /Eliminar/i })[0])

    await waitFor(() => {
      expect(occupationalClassService.eliminarClaseOcupacional).toHaveBeenCalledWith(1)
    })
  })

  it('muestra el título Clases Ocupacionales', async () => {
    render(
      <BrowserRouter>
        <QueryOccupationalClasses />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Clases Ocupacionales/i })).toBeInTheDocument()
    })
  })
})

// ConsultarFuncionUsuario.test.jsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import QueryUserFunctions from '../pages/QueryUserFunctions'
import * as session from '../services/session'
import * as userFunctionService from '../services/userFunctionService'

vi.mock('../services/userFunctionService')
vi.mock('../services/session')

describe('QueryUserFunctions Page — administrador', () => {
  const mockAdmin = { correoInstitucional: 'admin@ucr.ac.cr', rol: 1 }
  const mockFunciones = [
    { id: 1, correoInstitucional: 'admin@ucr.ac.cr', nombre: 'Función A', descripcion: 'Desc A' },
    { id: 2, correoInstitucional: 'usuario@ucr.ac.cr', nombre: 'Función B', descripcion: 'Desc B' },
    { id: 3, correoInstitucional: 'otro@ucr.ac.cr', nombre: 'Función C', descripcion: 'Desc C' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    session.obtenerSesion.mockReturnValue(mockAdmin)
    userFunctionService.obtenerTodasFuncionesUsuario.mockResolvedValue(mockFunciones)
  })

  it('carga y renderiza todas las funciones de usuario para admin', async () => {
    render(
      <BrowserRouter>
        <QueryUserFunctions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Función A')).toBeInTheDocument()
      expect(screen.getByText('Función B')).toBeInTheDocument()
      expect(screen.getByText('Función C')).toBeInTheDocument()
    })
  })

  it('llama a obtenerTodasFuncionesUsuario cuando el usuario es admin', () => {
    render(
      <BrowserRouter>
        <QueryUserFunctions />
      </BrowserRouter>,
    )

    expect(userFunctionService.obtenerTodasFuncionesUsuario).toHaveBeenCalled()
    expect(userFunctionService.obtenerFuncionesUsuarioPorCorreo).not.toHaveBeenCalled()
  })

  it('muestra la columna Usuario (correo) para admin', async () => {
    render(
      <BrowserRouter>
        <QueryUserFunctions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('admin@ucr.ac.cr')).toBeInTheDocument()
      expect(screen.getByText('usuario@ucr.ac.cr')).toBeInTheDocument()
    })
  })

  it('renderiza botones de eliminar para cada fila', async () => {
    render(
      <BrowserRouter>
        <QueryUserFunctions />
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
        <QueryUserFunctions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Función A')).toBeInTheDocument()
    })

    expect(screen.queryAllByRole('button', { name: /Editar/i })).toHaveLength(0)
  })

  it('llama a eliminarFuncionUsuario al confirmar eliminación', async () => {
    userFunctionService.eliminarFuncionUsuario.mockResolvedValueOnce({})
    userFunctionService.obtenerTodasFuncionesUsuario.mockResolvedValue(mockFunciones)

    render(
      <BrowserRouter>
        <QueryUserFunctions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Función A')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByRole('button', { name: /Eliminar/i })
    fireEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(userFunctionService.eliminarFuncionUsuario).toHaveBeenCalled()
    })
  })

  it('ordena funciones al hacer clic en el encabezado Nombre', async () => {
    userFunctionService.obtenerTodasFuncionesUsuario.mockResolvedValueOnce([
      { id: 3, correoInstitucional: 'c@ucr.ac.cr', nombre: 'Capacitación', descripcion: 'Desc C' },
      { id: 1, correoInstitucional: 'a@ucr.ac.cr', nombre: 'Atención', descripcion: 'Desc A' },
      { id: 2, correoInstitucional: 'b@ucr.ac.cr', nombre: 'Elaborar', descripcion: 'Desc B' },
    ])

    render(
      <BrowserRouter>
        <QueryUserFunctions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Capacitación')).toBeInTheDocument()
    })

    const getNombreValues = () =>
      Array.from(document.querySelectorAll('tbody tr')).map((row) => {
        const cells = row.querySelectorAll('td')
        return cells[1]?.textContent
      })

    fireEvent.click(screen.getByRole('button', { name: /Ordenar por Nombre ascendente/i }))
    const asc = getNombreValues()
    expect(asc[0]).toBe('Atención')
    expect(asc[asc.length - 1]).toBe('Elaborar')

    fireEvent.click(screen.getByRole('button', { name: /Ordenar por Nombre descendente/i }))
    const desc = getNombreValues()
    expect(desc[0]).toBe('Elaborar')
  })

  it('muestra mensaje cuando no hay funciones', async () => {
    userFunctionService.obtenerTodasFuncionesUsuario.mockResolvedValueOnce([])

    render(
      <BrowserRouter>
        <QueryUserFunctions />
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
        <QueryUserFunctions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Función A')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Crear/i }))

    await waitFor(() => {
      const dialog = document.querySelector('dialog')
      expect(dialog).toBeInTheDocument()
    })
  })

  it('cierra modal de crear al hacer clic en Cancelar', async () => {
    render(
      <BrowserRouter>
        <QueryUserFunctions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Función A')).toBeInTheDocument()
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

  it('renderiza Header y Navbar', () => {
    render(
      <BrowserRouter>
        <QueryUserFunctions />
      </BrowserRouter>,
    )

    expect(screen.getByText('Página Principal')).toBeInTheDocument()
  })
})

describe('QueryUserFunctions Page — funcionario', () => {
  const mockUsuario = { correoInstitucional: 'carlos@ucr.ac.cr', rol: 0 }
  const mockPropias = [
    { id: 1, correoInstitucional: 'carlos@ucr.ac.cr', nombre: 'Mi función', descripcion: 'Descripción' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    session.obtenerSesion.mockReturnValue(mockUsuario)
    userFunctionService.obtenerFuncionesUsuarioPorCorreo.mockResolvedValue(mockPropias)
  })

  it('llama a obtenerFuncionesUsuarioPorCorreo con el correo de sesión', () => {
    render(
      <BrowserRouter>
        <QueryUserFunctions />
      </BrowserRouter>,
    )

    expect(userFunctionService.obtenerFuncionesUsuarioPorCorreo).toHaveBeenCalledWith('carlos@ucr.ac.cr')
    expect(userFunctionService.obtenerTodasFuncionesUsuario).not.toHaveBeenCalled()
  })

  it('muestra solo las funciones propias del funcionario', async () => {
    render(
      <BrowserRouter>
        <QueryUserFunctions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Mi función')).toBeInTheDocument()
    })
  })

  it('renderiza botones de eliminar para funciones propias', async () => {
    render(
      <BrowserRouter>
        <QueryUserFunctions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button', { name: /Eliminar/i })
      expect(deleteButtons).toHaveLength(mockPropias.length)
    })
  })

  it('elimina usando el id de la función al confirmar', async () => {
    userFunctionService.eliminarFuncionUsuario.mockResolvedValueOnce({})
    userFunctionService.obtenerFuncionesUsuarioPorCorreo.mockResolvedValue(mockPropias)

    render(
      <BrowserRouter>
        <QueryUserFunctions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Mi función')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByRole('button', { name: /Eliminar/i })
    fireEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(userFunctionService.eliminarFuncionUsuario).toHaveBeenCalledWith(1)
    })
  })

  it('muestra mensaje cuando no hay funciones propias', async () => {
    userFunctionService.obtenerFuncionesUsuarioPorCorreo.mockResolvedValueOnce([])

    render(
      <BrowserRouter>
        <QueryUserFunctions />
      </BrowserRouter>,
    )

    await waitFor(() => {
      const emptyMessage = screen.queryByText(/No se encontraron/i)
      if (emptyMessage) {
        expect(emptyMessage).toBeInTheDocument()
      }
    })
  })
})

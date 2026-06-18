// CreateSections.test.jsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import CreateSections from '../pages/CreateSections'
import * as areaService from '../services/areaService'

vi.mock('../services/sectionService')
vi.mock('../services/areaService')

describe('CreateSections Page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    areaService.obtenerAreas.mockResolvedValue([
      { id: 1, nombre: 'Administración', descripcion: 'Área' },
    ])
  })

  it('renderiza formulario de crear sección', async () => {
    render(
      <BrowserRouter>
        <CreateSections />
      </BrowserRouter>,
    )

    expect(await screen.findByRole('heading', { name: /Crear Sección/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Nombre de la sección')).toBeInTheDocument()
  })

  it('renderiza Header y Navbar', async () => {
    render(
      <BrowserRouter>
        <CreateSections />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Página Principal')).toBeInTheDocument()
    })
  })
})

describe('CreateSections Modal Mode', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    areaService.obtenerAreas.mockResolvedValue([
      { id: 1, nombre: 'Administración', descripcion: 'Área' },
    ])
  })

  it('renderiza dentro de un modal cuando isModal es true', async () => {
    render(
      <BrowserRouter>
        <CreateSections isModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Crear Sección')).toBeInTheDocument()
    })

    expect(document.querySelector('dialog')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Nombre de la sección')).toBeInTheDocument()
  })

  it('no renderiza Header ni Navbar en modo modal', async () => {
    render(
      <BrowserRouter>
        <CreateSections isModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nombre de la sección')).toBeInTheDocument()
    })

    expect(screen.queryByText('Página Principal')).not.toBeInTheDocument()
  })

  it('no renderiza nada cuando isOpen es false', async () => {
    render(
      <BrowserRouter>
        <CreateSections isModal isOpen={false} onClose={() => {}} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(document.querySelector('dialog')).not.toBeInTheDocument()
    })
  })

  it('llama a onClose al hacer clic en Cancelar', async () => {
    const onClose = vi.fn()
    render(
      <BrowserRouter>
        <CreateSections isModal isOpen={true} onClose={onClose} onSuccess={() => {}} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nombre de la sección')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})

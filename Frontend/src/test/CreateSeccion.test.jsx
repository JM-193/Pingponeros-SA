// CreateSeccion.test.jsx
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import CreateSeccion from '../pages/CreateSeccion'
import * as areaService from '../services/areaService'

vi.mock('../services/sectionService')
vi.mock('../services/areaService')

describe('CreateSeccion Page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    areaService.obtenerAreas.mockResolvedValue([
      { id: 1, nombre: 'Administración', descripcion: 'Área' },
    ])
  })

  it('renderiza formulario de crear sección', async () => {
    render(
      <BrowserRouter>
        <CreateSeccion />
      </BrowserRouter>,
    )

    expect(await screen.findByRole('heading', { name: /Crear Sección/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Nombre de la sección')).toBeInTheDocument()
  })

  it('renderiza Header y Navbar', async () => {
    render(
      <BrowserRouter>
        <CreateSeccion />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Página Principal')).toBeInTheDocument()
    })
  })
})

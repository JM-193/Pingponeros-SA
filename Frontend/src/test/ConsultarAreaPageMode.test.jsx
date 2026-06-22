// QueryAreas page-mode (ENTITY_FORMS_AS_MODAL = false)
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import QueryAreas from '../pages/QueryAreas'
import * as areaService from '../services/areaService'

vi.mock('../services/areaService')
vi.mock('../constants/uiMode', () => ({ ENTITY_FORMS_AS_MODAL: false }))

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

function renderQuery() {
  return render(
    <MemoryRouter initialEntries={['/organizacion/areas/consultar']}>
      <Routes>
        <Route path="/organizacion/areas/consultar" element={<QueryAreas />} />
        <Route path="*" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('QueryAreas modo página (sin modal)', () => {
  const mockAreas = [
    { id: 1, nombre: 'Administracion', descripcion: 'Area de administracion', estado: 1 },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    areaService.obtenerAreas.mockResolvedValue(mockAreas)
  })

  it('navega a la página de crear en lugar de abrir un modal', async () => {
    renderQuery()

    await waitFor(() => {
      expect(screen.getByText('Administracion')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Crear/i }))

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/organizacion/areas/crear')
    })
    expect(document.querySelector('dialog')).toBeNull()
  })

  it('navega a la página de editar al hacer clic en Editar', async () => {
    renderQuery()

    await waitFor(() => {
      expect(screen.getByText('Administracion')).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: /Editar/i })
    fireEvent.click(editButtons[0])

    await waitFor(() => {
      expect(screen.getByTestId('location').textContent).toContain('/organizacion/areas/editar/')
    })
    expect(document.querySelector('dialog')).toBeNull()
  })
})

// Reports.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Reports from '../pages/Reports'
import * as session from '../services/session'
import * as reportService from '../services/reportService'
import { notifyApiError } from '../utils/notify'

vi.mock('../services/session')
vi.mock('../utils/notify', () => ({ notifyApiError: vi.fn() }))
vi.mock('../services/reportService', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, obtenerReporteAdmin: vi.fn() }
})

const renderPage = () =>
  render(
    <BrowserRouter>
      <Reports />
    </BrowserRouter>,
  )

describe('Reports Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    session.obtenerSesion.mockReturnValue({ correoInstitucional: 'admin@ucr.ac.cr', rol: 1 })
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock')
    globalThis.URL.revokeObjectURL = vi.fn()
  })

  it('renderiza el título y los selectores', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: 'Reportes' })).toBeInTheDocument()
    expect(screen.getByLabelText(/Tipo de reporte/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Formato/i)).toBeInTheDocument()
  })

  it('el botón Generar está deshabilitado hasta elegir un tipo', () => {
    renderPage()

    expect(screen.getByRole('button', { name: /Generar Reporte/i })).toBeDisabled()
  })

  it('genera la vista previa (siempre PDF) y abre la previsualización', async () => {
    const blob = new Blob(['pdf'], { type: 'application/pdf' })
    reportService.obtenerReporteAdmin.mockResolvedValue(blob)

    renderPage()

    fireEvent.change(screen.getByLabelText(/Tipo de reporte/i), {
      target: { value: 'funcionarios' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Generar Reporte/i }))

    await waitFor(() =>
      expect(reportService.obtenerReporteAdmin).toHaveBeenCalledWith('funcionarios', 'pdf'),
    )
    await waitFor(() =>
      expect(screen.getByTitle('Vista previa del reporte')).toBeInTheDocument(),
    )
  })

  it('notifica el error cuando no hay datos para el reporte', async () => {
    reportService.obtenerReporteAdmin.mockRejectedValue(
      new Error('No se encontraron datos para el reporte seleccionado.'),
    )

    renderPage()

    fireEvent.change(screen.getByLabelText(/Tipo de reporte/i), {
      target: { value: 'declaraciones' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Generar Reporte/i }))

    await waitFor(() => expect(notifyApiError).toHaveBeenCalledTimes(1))
  })
})

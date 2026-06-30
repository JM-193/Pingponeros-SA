// ReportPreview.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ReportPreview from '../components/ReportPreview'

describe('ReportPreview', () => {
  const blob = new Blob(['pdf'], { type: 'application/pdf' })

  beforeEach(() => {
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock')
    globalThis.URL.revokeObjectURL = vi.fn()
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('no renderiza el visor cuando isOpen es false', () => {
    const { container } = render(
      <ReportPreview
        isOpen={false}
        onClose={() => {}}
        previewBlob={blob}
        downloadName="reporte.pdf"
        getDownloadBlob={() => blob}
      />,
    )

    expect(container.querySelector('iframe')).toBeNull()
  })

  it('muestra el visor (iframe) cuando hay un blob de vista previa', async () => {
    render(
      <ReportPreview
        isOpen={true}
        onClose={() => {}}
        previewBlob={blob}
        downloadName="reporte.pdf"
        getDownloadBlob={() => blob}
      />,
    )

    await waitFor(() =>
      expect(screen.getByTitle('Vista previa del reporte')).toBeInTheDocument(),
    )
    expect(globalThis.URL.createObjectURL).toHaveBeenCalledWith(blob)
  })

  it('muestra mensaje de carga cuando aún no hay blob', () => {
    render(
      <ReportPreview
        isOpen={true}
        onClose={() => {}}
        previewBlob={null}
        downloadName="reporte.pdf"
        getDownloadBlob={() => blob}
      />,
    )

    expect(screen.getByText('Generando previsualización...')).toBeInTheDocument()
  })

  it('obtiene el blob a descargar al pulsar Descargar', async () => {
    const getDownloadBlob = vi.fn().mockResolvedValue(blob)

    render(
      <ReportPreview
        isOpen={true}
        onClose={() => {}}
        previewBlob={blob}
        downloadName="reporte.pdf"
        getDownloadBlob={getDownloadBlob}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Descargar' }))

    await waitFor(() => expect(getDownloadBlob).toHaveBeenCalledTimes(1))
  })
})

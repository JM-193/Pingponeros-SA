import { useState } from 'react'
import PageLayout from '../components/PageLayout'
import FormButton from '../components/FormButton'
import FormSelect from '../components/FormSelect'
import ReportPreview from '../components/ReportPreview'
import {
  REPORTE_TIPO_OPTIONS,
  FORMATO_OPTIONS,
  FORMATOS,
  obtenerReporteAdmin,
} from '../services/reportService'
import { notifyApiError } from '../utils/notify'
import { COLORS } from '../constants/colors'

const cardStyle = {
  maxWidth: '640px',
  margin: '0 auto',
  backgroundColor: COLORS.inputBg,
  padding: '32px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
}

export default function Reports() {
  const [tipo, setTipo] = useState('')
  const [formato, setFormato] = useState(FORMATOS.PDF)
  const [generando, setGenerando] = useState(false)
  const [previewBlob, setPreviewBlob] = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const handleGenerar = async () => {
    if (!tipo) return
    setGenerando(true)
    try {
      // La previsualización es siempre PDF (visor nativo con desplazamiento y zoom).
      const blob = await obtenerReporteAdmin(tipo, FORMATOS.PDF)
      setPreviewBlob(blob)
      setPreviewOpen(true)
    } catch (err) {
      notifyApiError(err)
    } finally {
      setGenerando(false)
    }
  }

  // PDF: reutiliza el blob ya generado para la vista previa. Excel: nueva petición.
  const handleDescargar = async () => {
    if (formato === FORMATOS.PDF && previewBlob) return previewBlob
    return obtenerReporteAdmin(tipo, formato)
  }

  const extension = formato === FORMATOS.EXCEL ? 'xlsx' : 'pdf'

  return (
    <PageLayout>
      <h1
        style={{
          fontWeight: 900,
          fontSize: 'clamp(22px, 2.5vw, 34px)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          textAlign: 'center',
          margin: '0 0 6px',
          color: COLORS.labelColor,
        }}
      >
        Reportes
      </h1>
      <p style={{ textAlign: 'center', color: COLORS.textMuted, margin: '0 0 28px' }}>
        Seleccione el tipo de reporte y el formato para generarlo.
      </p>

      <div style={cardStyle}>
        <FormSelect
          label="Tipo de reporte"
          id="tipo-reporte"
          name="tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          options={REPORTE_TIPO_OPTIONS}
          required
          defaultLabel="Seleccione un tipo de reporte"
        />
        <FormSelect
          label="Formato"
          id="formato-reporte"
          name="formato"
          value={formato}
          onChange={(e) => setFormato(e.target.value)}
          options={FORMATO_OPTIONS}
          required
          defaultLabel="Seleccione un formato"
        />

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
          <FormButton
            label={generando ? 'Generando...' : 'Generar Reporte'}
            type="button"
            variant="primary"
            onClick={handleGenerar}
            disabled={generando || !tipo}
            width="auto"
          />
        </div>
      </div>

      <ReportPreview
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        previewBlob={previewBlob}
        downloadName={`reporte-${tipo}.${extension}`}
        getDownloadBlob={handleDescargar}
      />
    </PageLayout>
  )
}

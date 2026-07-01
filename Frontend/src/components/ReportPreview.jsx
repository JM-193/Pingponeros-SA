import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import Modal from './Modal'
import FormButton from './FormButton'
import { notifyApiError } from '../utils/notify'
import { COLORS } from '../constants/colors'

// Dispara la descarga de un Blob en el navegador con el nombre indicado.
function descargarBlob(blob, nombre) {
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombre
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  URL.revokeObjectURL(url)
}

/**
 * Pantalla de previsualización de reportes. Muestra siempre un PDF en el visor nativo del
 * navegador (desplazamiento vertical/horizontal y zoom) y permite descargar el archivo en el
 * formato elegido. La obtención del Blob a descargar la decide quien la usa: para PDF reutiliza el
 * de la vista previa; para Excel hace una nueva petición.
 */
export default function ReportPreview({ isOpen, onClose, previewBlob, downloadName, getDownloadBlob }) {
  const [objectUrl, setObjectUrl] = useState(null)
  const [descargando, setDescargando] = useState(false)

  useEffect(() => {
    if (!previewBlob) {
      setObjectUrl(null)
      return undefined
    }
    const url = URL.createObjectURL(previewBlob)
    setObjectUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [previewBlob])

  const handleDescargar = async () => {
    setDescargando(true)
    try {
      const blob = await getDownloadBlob()
      descargarBlob(blob, downloadName)
    } catch (err) {
      notifyApiError(err)
    } finally {
      setDescargando(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Previsualización del reporte"
      width="90%"
      maxWidth="1100px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {objectUrl ? (
          <iframe
            title="Vista previa del reporte"
            src={objectUrl}
            style={{
              width: '100%',
              height: '75vh',
              border: `1px solid ${COLORS.borderColor}`,
              borderRadius: '6px',
            }}
          />
        ) : (
          <p style={{ textAlign: 'center', color: COLORS.textSubtle, padding: '40px 0' }}>
            Generando previsualización...
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <FormButton label="Cerrar" type="button" variant="secondary" onClick={onClose} width="auto" />
          <FormButton
            label={descargando ? 'Descargando...' : 'Descargar'}
            type="button"
            variant="primary"
            onClick={handleDescargar}
            disabled={descargando || !previewBlob}
            width="auto"
          />
        </div>
      </div>
    </Modal>
  )
}

ReportPreview.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  previewBlob: PropTypes.instanceOf(Blob),
  downloadName: PropTypes.string.isRequired,
  getDownloadBlob: PropTypes.func.isRequired,
}

ReportPreview.defaultProps = {
  previewBlob: null,
}

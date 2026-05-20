import DepartamentoSeccionEditForm from '../components/DepartamentoSeccionEditForm'
import { obtenerSeccionPorNombre, actualizarSeccion } from '../services/seccionService'

export default function EditSeccion() {
  return (
    <DepartamentoSeccionEditForm
      entityType="seccion"
      fetchByName={obtenerSeccionPorNombre}
      updateEntity={actualizarSeccion}
    />
  )
}

import DepartamentoSeccionEditForm from '../components/DepartamentoSeccionEditForm'
import { obtenerSeccionPorNombre, actualizarSeccion } from '../services/sectionService'

export default function EditSections() {
  return (
    <DepartamentoSeccionEditForm
      entityType="seccion"
      fetchByName={obtenerSeccionPorNombre}
      updateEntity={actualizarSeccion}
    />
  )
}

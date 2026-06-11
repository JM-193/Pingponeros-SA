import DepartmentSectionEditForm from '../components/DepartmentSectionEditForm'
import { obtenerSeccionPorNombre, actualizarSeccion } from '../services/sectionService'

export default function EditSections() {
  return (
    <DepartmentSectionEditForm
      entityType="seccion"
      fetchByName={obtenerSeccionPorNombre}
      updateEntity={actualizarSeccion}
    />
  )
}

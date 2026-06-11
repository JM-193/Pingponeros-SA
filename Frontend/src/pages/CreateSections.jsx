import DepartmentSectionCreateForm from '../components/DepartmentSectionCreateForm'
import { crearSeccion } from '../services/sectionService'

export default function CreateSections() {
  return (
    <DepartmentSectionCreateForm
      entityType="seccion"
      createEntity={crearSeccion}
    />
  )
}

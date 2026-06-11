import DepartamentoSeccionCreateForm from '../components/DepartamentoSeccionCreateForm'
import { crearSeccion } from '../services/sectionService'

export default function CreateSections() {
  return (
    <DepartamentoSeccionCreateForm
      entityType="seccion"
      createEntity={crearSeccion}
    />
  )
}

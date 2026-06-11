import DepartamentoSeccionCreateForm from '../components/DepartamentoSeccionCreateForm'
import { crearSeccion } from '../services/sectionService'

export default function CreateSeccion() {
  return (
    <DepartamentoSeccionCreateForm
      entityType="seccion"
      createEntity={crearSeccion}
    />
  )
}

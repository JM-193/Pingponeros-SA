import DepartamentoSeccionCreateForm from '../components/DepartamentoSeccionCreateForm'
import { crearSeccion } from '../services/seccionService'

export default function CreateSeccion() {
  return (
    <DepartamentoSeccionCreateForm
      entityType="seccion"
      createEntity={crearSeccion}
    />
  )
}

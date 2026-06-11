import DepartamentoSeccionCreateForm from '../components/DepartamentoSeccionCreateForm'
import { crearDepartamento } from '../services/departmentService'

export default function CreateDepartamento() {
  return (
    <DepartamentoSeccionCreateForm
      entityType="departamento"
      createEntity={crearDepartamento}
    />
  )
}

import DepartamentoSeccionCreateForm from '../components/DepartamentoSeccionCreateForm'
import { crearDepartamento } from '../services/departmentService'

export default function CreateDepartments() {
  return (
    <DepartamentoSeccionCreateForm
      entityType="departamento"
      createEntity={crearDepartamento}
    />
  )
}

import DepartmentSectionCreateForm from '../components/DepartmentSectionCreateForm'
import { crearDepartamento } from '../services/departmentService'

export default function CreateDepartments() {
  return (
    <DepartmentSectionCreateForm
      entityType="departamento"
      createEntity={crearDepartamento}
    />
  )
}

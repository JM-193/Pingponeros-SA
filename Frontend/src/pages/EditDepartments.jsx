import DepartmentSectionEditForm from '../components/DepartmentSectionEditForm'
import { obtenerDepartamentoPorNombre, actualizarDepartamento } from '../services/departmentService'

export default function EditDepartments() {
  return (
    <DepartmentSectionEditForm
      entityType="departamento"
      fetchByName={obtenerDepartamentoPorNombre}
      updateEntity={actualizarDepartamento}
    />
  )
}

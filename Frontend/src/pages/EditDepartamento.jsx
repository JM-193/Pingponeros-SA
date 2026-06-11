import DepartamentoSeccionEditForm from '../components/DepartamentoSeccionEditForm'
import { obtenerDepartamentoPorNombre, actualizarDepartamento } from '../services/departmentService'

export default function EditDepartamento() {
  return (
    <DepartamentoSeccionEditForm
      entityType="departamento"
      fetchByName={obtenerDepartamentoPorNombre}
      updateEntity={actualizarDepartamento}
    />
  )
}

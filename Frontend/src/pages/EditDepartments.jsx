import PropTypes from 'prop-types'
import DepartmentSectionEditForm from '../components/DepartmentSectionEditForm'
import { obtenerDepartamentoPorNombre, actualizarDepartamento } from '../services/departmentService'

export default function EditDepartments({ isOpen, onSuccess, onClose, entityName }) {
  return (
    <DepartmentSectionEditForm
      entityType="departamento"
      fetchByName={obtenerDepartamentoPorNombre}
      updateEntity={actualizarDepartamento}
      isOpen={isOpen}
      onSuccess={onSuccess}
      onClose={onClose}
      entityName={entityName}
    />
  )
}

EditDepartments.propTypes = {
  isOpen: PropTypes.bool,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  entityName: PropTypes.string.isRequired,
}

EditDepartments.defaultProps = {
  isOpen: false,
}

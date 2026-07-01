import PropTypes from 'prop-types'
import DepartmentSectionCreateForm from '../components/DepartmentSectionCreateForm'
import { crearDepartamento } from '../services/departmentService'

export default function CreateDepartments({ isOpen, onSuccess, onClose }) {
  return (
    <DepartmentSectionCreateForm
      entityType="departamento"
      createEntity={crearDepartamento}
      isOpen={isOpen}
      onSuccess={onSuccess}
      onClose={onClose}
    />
  )
}

CreateDepartments.propTypes = {
  isOpen: PropTypes.bool,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}

CreateDepartments.defaultProps = {
  isOpen: false,
}

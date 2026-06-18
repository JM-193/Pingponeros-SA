import PropTypes from 'prop-types'
import DepartmentSectionCreateForm from '../components/DepartmentSectionCreateForm'
import { crearDepartamento } from '../services/departmentService'

export default function CreateDepartments({ isModal, isOpen, onSuccess, onClose }) {
  return (
    <DepartmentSectionCreateForm
      entityType="departamento"
      createEntity={crearDepartamento}
      isModal={isModal}
      isOpen={isOpen}
      onSuccess={onSuccess}
      onClose={onClose}
    />
  )
}

CreateDepartments.propTypes = {
  isModal: PropTypes.bool,
  isOpen: PropTypes.bool,
  onSuccess: PropTypes.func,
  onClose: PropTypes.func,
}

CreateDepartments.defaultProps = {
  isModal: false,
  isOpen: false,
  onSuccess: null,
  onClose: null,
}

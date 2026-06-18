import PropTypes from 'prop-types'
import DepartmentSectionEditForm from '../components/DepartmentSectionEditForm'
import { obtenerDepartamentoPorNombre, actualizarDepartamento } from '../services/departmentService'

export default function EditDepartments({ isModal, isOpen, onSuccess, onClose, entityName }) {
  return (
    <DepartmentSectionEditForm
      entityType="departamento"
      fetchByName={obtenerDepartamentoPorNombre}
      updateEntity={actualizarDepartamento}
      isModal={isModal}
      isOpen={isOpen}
      onSuccess={onSuccess}
      onClose={onClose}
      entityName={entityName}
    />
  )
}

EditDepartments.propTypes = {
  isModal: PropTypes.bool,
  isOpen: PropTypes.bool,
  onSuccess: PropTypes.func,
  onClose: PropTypes.func,
  entityName: PropTypes.string,
}

EditDepartments.defaultProps = {
  isModal: false,
  isOpen: false,
  onSuccess: null,
  onClose: null,
  entityName: null,
}

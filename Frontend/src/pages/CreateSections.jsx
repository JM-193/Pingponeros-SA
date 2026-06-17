import PropTypes from 'prop-types'
import DepartmentSectionCreateForm from '../components/DepartmentSectionCreateForm'
import { crearSeccion } from '../services/sectionService'

export default function CreateSections({ isModal, isOpen, onSuccess, onClose }) {
  return (
    <DepartmentSectionCreateForm
      entityType="seccion"
      createEntity={crearSeccion}
      isModal={isModal}
      isOpen={isOpen}
      onSuccess={onSuccess}
      onClose={onClose}
    />
  )
}

CreateSections.propTypes = {
  isModal: PropTypes.bool,
  isOpen: PropTypes.bool,
  onSuccess: PropTypes.func,
  onClose: PropTypes.func,
}

CreateSections.defaultProps = {
  isModal: false,
  isOpen: false,
  onSuccess: null,
  onClose: null,
}

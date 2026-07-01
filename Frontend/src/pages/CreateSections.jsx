import PropTypes from 'prop-types'
import DepartmentSectionCreateForm from '../components/DepartmentSectionCreateForm'
import { crearSeccion } from '../services/sectionService'

export default function CreateSections({ isOpen, onSuccess, onClose }) {
  return (
    <DepartmentSectionCreateForm
      entityType="seccion"
      createEntity={crearSeccion}
      isOpen={isOpen}
      onSuccess={onSuccess}
      onClose={onClose}
    />
  )
}

CreateSections.propTypes = {
  isOpen: PropTypes.bool,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}

CreateSections.defaultProps = {
  isOpen: false,
}

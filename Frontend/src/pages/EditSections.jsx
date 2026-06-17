import PropTypes from 'prop-types'
import DepartmentSectionEditForm from '../components/DepartmentSectionEditForm'
import { obtenerSeccionPorNombre, actualizarSeccion } from '../services/sectionService'

export default function EditSections({ isModal, isOpen, onSuccess, onClose, entityName }) {
  return (
    <DepartmentSectionEditForm
      entityType="seccion"
      fetchByName={obtenerSeccionPorNombre}
      updateEntity={actualizarSeccion}
      isModal={isModal}
      isOpen={isOpen}
      onSuccess={onSuccess}
      onClose={onClose}
      entityName={entityName}
    />
  )
}

EditSections.propTypes = {
  isModal: PropTypes.bool,
  isOpen: PropTypes.bool,
  onSuccess: PropTypes.func,
  onClose: PropTypes.func,
  entityName: PropTypes.string,
}

EditSections.defaultProps = {
  isModal: false,
  isOpen: false,
  onSuccess: null,
  onClose: null,
  entityName: null,
}

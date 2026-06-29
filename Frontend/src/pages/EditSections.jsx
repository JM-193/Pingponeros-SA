import PropTypes from 'prop-types'
import DepartmentSectionEditForm from '../components/DepartmentSectionEditForm'
import { obtenerSeccionPorNombre, actualizarSeccion } from '../services/sectionService'

export default function EditSections({ isOpen, onSuccess, onClose, entityName }) {
  return (
    <DepartmentSectionEditForm
      entityType="seccion"
      fetchByName={obtenerSeccionPorNombre}
      updateEntity={actualizarSeccion}
      isOpen={isOpen}
      onSuccess={onSuccess}
      onClose={onClose}
      entityName={entityName}
    />
  )
}

EditSections.propTypes = {
  isOpen: PropTypes.bool,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  entityName: PropTypes.string.isRequired,
}

EditSections.defaultProps = {
  isOpen: false,
}

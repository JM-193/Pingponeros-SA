import EntityListPage from '../components/EntityListPage'
import { obtenerPuestos, eliminarPuesto } from '../services/workPositionService'
import { ENTITY_FORMS_AS_MODAL } from '../constants/uiMode'
import CreateWorkPositions from './CreateWorkPositions'

export default function QueryWorkPositions() {
  const columns = [
    {
      key: 'nombre',
      label: 'Nombre',
      render: (puesto) => puesto.nombre,
      width: '35%',
    },
    {
      key: 'descripcion',
      label: 'Descripción',
      render: (puesto) => puesto.descripcion,
      width: '65%',
    },
  ]

  const matchesSearch = (puesto, term) => {
    if (!term.trim()) return true
    const lowerTerm = term.toLowerCase()
    return (
      puesto.nombre.toLowerCase().includes(lowerTerm) ||
      puesto.descripcion.toLowerCase().includes(lowerTerm)
    )
  }

  const formProps = ENTITY_FORMS_AS_MODAL
    ? {
        renderCreateModal: ({ isModal, isOpen, onClose, onSuccess }) => (
          <CreateWorkPositions isModal={isModal} isOpen={isOpen} onClose={onClose} onSuccess={onSuccess} />
        ),
      }
    : {
        createPath: '/organizacion/puestos-trabajo/crear',
      }

  return (
    <EntityListPage
      title="Puestos de Trabajo"
      entityLabel="puestos de trabajo"
      fetchItems={obtenerPuestos}
      columns={columns}
      matchesSearch={matchesSearch}
      getRowId={(puesto) => puesto.id}
      searchPlaceholder="Ingrese el nombre o descripción del puesto de trabajo"
      deleteItem={(puesto) => eliminarPuesto(puesto.nombre)}
      deleteConfirmMessage={(puesto) =>
        `¿Está seguro de que desea eliminar el puesto de trabajo "${puesto.nombre}"? Esta acción no se puede deshacer.`
      }
      {...formProps}
    />
  )
}

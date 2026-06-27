import EntityListPage from '../components/EntityListPage'
import { obtenerFunciones, eliminarFuncion } from '../services/functionService'
import { ENTITY_FORMS_AS_MODAL } from '../constants/uiMode'
import CreateFunctions from './CreateFunctions'

export default function QueryFunctions() {
  const columns = [
    {
      key: 'nombre',
      label: 'Nombre',
      render: (funcion) => funcion.nombre,
      width: '35%',
    },
    {
      key: 'descripcion',
      label: 'Descripción',
      render: (funcion) => funcion.descripcion,
      width: '65%',
    },
  ]

  const matchesSearch = (funcion, term) => {
    if (!term.trim()) return true
    const lowerTerm = term.toLowerCase()
    return (
      funcion.nombre.toLowerCase().includes(lowerTerm) ||
      funcion.descripcion.toLowerCase().includes(lowerTerm)
    )
  }

  const formProps = ENTITY_FORMS_AS_MODAL
    ? {
        renderCreateModal: ({ isModal, isOpen, onClose, onSuccess }) => (
          <CreateFunctions isModal={isModal} isOpen={isOpen} onClose={onClose} onSuccess={onSuccess} />
        ),
      }
    : {
        createPath: '/organizacion/funciones/crear',
      }

  return (
    <EntityListPage
      title="Funciones Oficiales"
      entityLabel="funciones oficiales"
      fetchItems={obtenerFunciones}
      columns={columns}
      matchesSearch={matchesSearch}
      getRowId={(funcion) => funcion.id}
      searchPlaceholder="Ingrese el nombre o descripción de la función oficial"
      deleteItem={(funcion) => eliminarFuncion(funcion.nombre)}
      deleteConfirmMessage={(funcion) =>
        `¿Está seguro de que desea eliminar la función oficial "${funcion.nombre}"? Esta acción no se puede deshacer.`
      }
      {...formProps}
    />
  )
}

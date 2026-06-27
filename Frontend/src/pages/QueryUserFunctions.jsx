import EntityListPage from '../components/EntityListPage'
import {
  obtenerTodasFuncionesUsuario,
  obtenerFuncionesUsuarioPorCorreo,
  eliminarFuncionUsuario,
} from '../services/userFunctionService'
import { obtenerSesion } from '../services/session'
import { ENTITY_FORMS_AS_MODAL } from '../constants/uiMode'
import CreateUserFunctions from './CreateUserFunctions'

export default function QueryUserFunctions() {
  const sesion = obtenerSesion()
  const esAdmin = sesion?.rol === 1

  const fetchItems = esAdmin
    ? () => obtenerTodasFuncionesUsuario()
    : () => obtenerFuncionesUsuarioPorCorreo(sesion?.correoInstitucional)

  const columns = [
    ...(esAdmin
      ? [
          {
            key: 'correoInstitucional',
            label: 'Usuario',
            render: (funcion) => funcion.correoInstitucional,
            width: '30%',
          },
        ]
      : []),
    {
      key: 'nombre',
      label: 'Nombre',
      render: (funcion) => funcion.nombre,
      width: esAdmin ? '25%' : '35%',
    },
    {
      key: 'descripcion',
      label: 'Descripción',
      render: (funcion) => funcion.descripcion,
      width: esAdmin ? '45%' : '65%',
    },
  ]

  const matchesSearch = (funcion, term) => {
    if (!term.trim()) return true
    const lowerTerm = term.toLowerCase()
    return (
      funcion.nombre.toLowerCase().includes(lowerTerm) ||
      funcion.descripcion.toLowerCase().includes(lowerTerm) ||
      (funcion.correoInstitucional?.toLowerCase().includes(lowerTerm) ?? false)
    )
  }

  const formProps = ENTITY_FORMS_AS_MODAL
    ? {
        renderCreateModal: ({ isModal, isOpen, onClose, onSuccess }) => (
          <CreateUserFunctions isModal={isModal} isOpen={isOpen} onClose={onClose} onSuccess={onSuccess} />
        ),
      }
    : {
        createPath: '/funciones/usuarios/crear',
      }

  return (
    <EntityListPage
      title="Funciones de Usuarios"
      entityLabel="funciones de usuarios"
      fetchItems={fetchItems}
      columns={columns}
      matchesSearch={matchesSearch}
      getRowId={(funcion) => funcion.id}
      searchPlaceholder="Ingrese el nombre o descripción de la función"
      deleteItem={(funcion) => eliminarFuncionUsuario(funcion.id)}
      deleteConfirmMessage={(funcion) =>
        `¿Está seguro de que desea eliminar la función "${funcion.nombre}"? Esta acción no se puede deshacer.`
      }
      {...formProps}
    />
  )
}

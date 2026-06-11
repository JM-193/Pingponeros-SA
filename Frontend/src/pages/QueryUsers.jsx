// QueryUsers.jsx

import EntityListPage from '../components/EntityListPage'
import { obtenerUsuarios } from '../services/userService'

export default function QueryUsers() {
  const columns = [
    {
      key: 'primerNombre',
      label: 'Nombre',
      render: (usuario) => {
        return [usuario.primerNombre, usuario.segundoNombre]
          .filter(Boolean)
          .join(' ')
      },
      width: '30%',
    },
    {
      key: 'primerApellido',
      label: 'Apellido',
      render: (usuario) => {
        return [usuario.primerApellido, usuario.segundoApellido]
          .filter(Boolean)
          .join(' ')
      },
      width: '30%',
    },
    {
      key: 'correoInstitucional',
      label: 'Correo',
      render: (usuario) => usuario.correoInstitucional,
      width: '30%',
    },
  ]

  const matchesSearch = (usuario, term) => {
    if (!term.trim()) return true
    const lowerTerm = term.toLowerCase()
    const fullName = [
      usuario.primerNombre,
      usuario.segundoNombre,
      usuario.primerApellido,
      usuario.segundoApellido,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return (
      fullName.includes(lowerTerm) ||
      usuario.correoInstitucional.toLowerCase().includes(lowerTerm)
    )
  }

  return (
    <EntityListPage
      title="Usuarios"
      entityLabel="usuarios"
      createPath="/usuarios/crear"
      editPath={(usuario) => `/usuarios/editar/${encodeURIComponent(usuario.correoInstitucional)}`}
      fetchItems={obtenerUsuarios}
      columns={columns}
      matchesSearch={matchesSearch}
      getRowId={(usuario) => usuario.correoInstitucional}
      isRowInactive={(usuario) => usuario.estado === 0}
      searchPlaceholder="Ingrese el nombre, apellidos o correo del usuario"
    />
  )
}

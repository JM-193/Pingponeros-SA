import EntityListPage from '../components/EntityListPage'
import { obtenerAreas, eliminarArea } from '../services/areaService'
import { formatStatusLabel } from '../utils/organizationOptions'

export default function ConsultarArea() {
  const columns = [
    {
      key: 'nombre',
      label: 'Nombre',
      render: (area) => area.nombre,
    },
    {
      key: 'descripcion',
      label: 'Descripción',
      render: (area) => area.descripcion,
    },
    {
      key: 'estado',
      label: 'Estado',
      align: 'center',
      render: (area) => formatStatusLabel(area.estado),
    },
  ]

  const matchesSearch = (area, term) => {
    if (!term.trim()) return true
    const lowerTerm = term.toLowerCase()
    return (
      area.nombre.toLowerCase().includes(lowerTerm) ||
      area.descripcion.toLowerCase().includes(lowerTerm)
    )
  }

  return (
    <EntityListPage
      title="Áreas"
      entityLabel="áreas"
      entityLabelSingular="el área"
      createPath="/organizacion/areas/crear"
      editPath={(area) => `/organizacion/areas/editar/${encodeURIComponent(area.nombre)}`}
      fetchItems={obtenerAreas}
      deactivateItem={eliminarArea}
      columns={columns}
      matchesSearch={matchesSearch}
      getRowId={(area) => area.id}
      searchPlaceholder="Ingrese el nombre o descripción del área"
    />
  )
}

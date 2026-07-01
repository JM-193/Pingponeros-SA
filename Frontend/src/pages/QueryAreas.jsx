import EntityListPage from '../components/EntityListPage'
import { obtenerAreas } from '../services/areaService'
import { formatStatusLabel } from '../utils/organizationOptions'
import CreateAreas from './CreateAreas'
import EditAreas from './EditAreas'

export default function QueryAreas() {
  const columns = [
    {
      key: 'nombre',
      label: 'Nombre',
      render: (area) => area.nombre,
      width: '40%',
    },
    {
      key: 'descripcion',
      label: 'Descripción',
      render: (area) => area.descripcion,
      width: '40%',
    },
    {
      key: 'estado',
      label: 'Estado',
      align: 'center',
      render: (area) => formatStatusLabel(area.estado),
      width: '10%',
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
      fetchItems={obtenerAreas}
      columns={columns}
      matchesSearch={matchesSearch}
      getRowId={(area) => area.id}
      searchPlaceholder="Ingrese el nombre o descripción del área"
      renderCreateModal={({ isOpen, onClose, onSuccess }) => (
        <CreateAreas isOpen={isOpen} onClose={onClose} onSuccess={onSuccess} />
      )}
      renderEditModal={({ isOpen, onClose, onSuccess, item }) =>
        item && <EditAreas isOpen={isOpen} entityName={item.nombre} onClose={onClose} onSuccess={onSuccess} />}
    />
  )
}

import EntityListPage from '../components/EntityListPage'
import { obtenerClasesOcupacionales, eliminarClaseOcupacional } from '../services/occupationalClassService'
import CreateOccupationalClasses from './CreateOccupationalClasses'

export default function QueryOccupationalClasses() {
  const columns = [
    {
      key: 'codigo',
      label: 'Código',
      render: (clase) => clase.codigo,
      width: '20%',
    },
    {
      key: 'nombre',
      label: 'Nombre',
      render: (clase) => clase.nombre,
      width: '80%',
    },
  ]

  const matchesSearch = (clase, term) => {
    if (!term.trim()) return true
    const lowerTerm = term.toLowerCase()
    return (
      String(clase.codigo).includes(lowerTerm) ||
      clase.nombre.toLowerCase().includes(lowerTerm)
    )
  }

  return (
    <EntityListPage
      title="Clases Ocupacionales"
      entityLabel="clases ocupacionales"
      fetchItems={obtenerClasesOcupacionales}
      columns={columns}
      matchesSearch={matchesSearch}
      getRowId={(clase) => clase.idClaseOcupacional}
      searchPlaceholder="Ingrese el código o nombre de la clase ocupacional"
      deleteItem={(clase) => eliminarClaseOcupacional(clase.idClaseOcupacional)}
      deleteConfirmMessage={(clase) =>
        `¿Está seguro de que desea eliminar la clase ocupacional "${clase.nombre}"? Esta acción no se puede deshacer.`
      }
      renderCreateModal={({ isOpen, onClose, onSuccess }) => (
        <CreateOccupationalClasses isOpen={isOpen} onClose={onClose} onSuccess={onSuccess} />
      )}
    />
  )
}

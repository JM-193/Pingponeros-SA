import { useCallback } from 'react'
import EntityListPage from '../components/EntityListPage'
import { obtenerDepartamentos } from '../services/departmentService'
import { obtenerAreas } from '../services/areaService'
import { buildNameMap, formatStatusLabel, resolveOptionValueKey } from '../utils/organizationOptions'
import CreateDepartments from './CreateDepartments'
import EditDepartments from './EditDepartments'

export default function QueryDepartments() {
  const fetchItems = useCallback(async () => {
    const [departamentos, areas] = await Promise.all([
      obtenerDepartamentos(),
      obtenerAreas(),
    ])

    const areaValueKey = resolveOptionValueKey(areas, ['id', 'idArea'])
    const areaMap = buildNameMap(areas, { valueKey: areaValueKey, labelPrefix: 'Área de ' })

    return departamentos.map((departamento) => {
      const areaId = departamento.idArea ?? departamento.areaId ?? departamento[areaValueKey]
      const areaLabel = areaId ? (areaMap.get(String(areaId)) ?? 'Sin asignación') : 'Sin asignación'

      return { ...departamento, areaLabel }
    })
  }, [])

  const columns = [
    {
      key: 'nombre',
      label: 'Nombre',
      render: (departamento) => departamento.nombre,
      width: '20%',
    },
    {
      key: 'descripcion',
      label: 'Descripción',
      render: (departamento) => departamento.descripcion,
      width: '40%',
    },
    {
      key: 'areaLabel',
      label: 'Área',
      render: (departamento) => departamento.areaLabel,
      width: '20%',
    },
    {
      key: 'estado',
      label: 'Estado',
      align: 'center',
      render: (departamento) => formatStatusLabel(departamento.estado),
      width: '10%',
    },
  ]

  const matchesSearch = (departamento, term) => {
    if (!term.trim()) return true
    const lowerTerm = term.toLowerCase()
    return (
      departamento.nombre.toLowerCase().includes(lowerTerm) ||
      departamento.descripcion.toLowerCase().includes(lowerTerm) ||
      departamento.areaLabel?.toLowerCase().includes(lowerTerm)
    )
  }

  return (
    <EntityListPage
      title="Departamentos"
      entityLabel="departamentos"
      fetchItems={fetchItems}
      columns={columns}
      matchesSearch={matchesSearch}
      getRowId={(departamento) => departamento.id ?? departamento.idDepartamento}
      searchPlaceholder="Ingrese el nombre, descripción o área del departamento"
      renderCreateModal={({ isOpen, onClose, onSuccess }) => (
        <CreateDepartments isOpen={isOpen} onClose={onClose} onSuccess={onSuccess} />
      )}
      renderEditModal={({ isOpen, onClose, onSuccess, item }) =>
        item && <EditDepartments isOpen={isOpen} entityName={item.nombre} onClose={onClose} onSuccess={onSuccess} />}
    />
  )
}

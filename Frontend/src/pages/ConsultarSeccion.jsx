import { useCallback } from 'react'
import EntityListPage from '../components/EntityListPage'
import { obtenerSecciones, eliminarSeccion } from '../services/seccionService'
import { obtenerAreas } from '../services/areaService'
import { buildNameMap, formatStatusLabel, resolveOptionValueKey } from '../utils/organizationOptions'

export default function ConsultarSeccion() {
  const fetchItems = useCallback(async () => {
    const [secciones, areas] = await Promise.all([
      obtenerSecciones(),
      obtenerAreas(),
    ])

    const areaValueKey = resolveOptionValueKey(areas, ['id', 'idArea'])
    const areaMap = buildNameMap(areas, { valueKey: areaValueKey, labelPrefix: 'Área de ' })

    return secciones.map((seccion) => {
      const areaId = seccion.idArea ?? seccion.areaId ?? seccion[areaValueKey]
      const areaLabel = areaMap.get(String(areaId)) ?? 'Área no disponible'

      return { ...seccion, areaLabel }
    })
  }, [])

  const columns = [
    {
      key: 'nombre',
      label: 'Nombre',
      render: (seccion) => seccion.nombre,
    },
    {
      key: 'descripcion',
      label: 'Descripción',
      render: (seccion) => seccion.descripcion,
    },
    {
      key: 'areaLabel',
      label: 'Área',
      render: (seccion) => seccion.areaLabel,
    },
    {
      key: 'estado',
      label: 'Estado',
      align: 'center',
      render: (seccion) => formatStatusLabel(seccion.estado),
    },
  ]

  const matchesSearch = (seccion, term) => {
    if (!term.trim()) return true
    const lowerTerm = term.toLowerCase()
    return (
      seccion.nombre.toLowerCase().includes(lowerTerm) ||
      seccion.descripcion.toLowerCase().includes(lowerTerm) ||
      seccion.areaLabel?.toLowerCase().includes(lowerTerm)
    )
  }

  return (
    <EntityListPage
      title="Secciones"
      entityLabel="secciones"
      entityLabelSingular="la sección"
      createPath="/organizacion/secciones/crear"
      editPath={(seccion) => `/organizacion/secciones/editar/${encodeURIComponent(seccion.nombre)}`}
      fetchItems={fetchItems}
      deactivateItem={eliminarSeccion}
      columns={columns}
      matchesSearch={matchesSearch}
      getRowId={(seccion) => seccion.id ?? seccion.idSeccion}
      searchPlaceholder="Ingrese el nombre, descripción o área de la sección"
    />
  )
}

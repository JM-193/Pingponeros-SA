// QueryPositions.jsx
import { useCallback } from 'react'
import EntityListPage from '../components/EntityListPage'
import { obtenerPlazas } from '../services/positionService'
import { obtenerUnidades } from '../services/unitService'
import { obtenerDepartamentos } from '../services/departmentService'
import { obtenerSecciones } from '../services/sectionService'
import { obtenerAreas } from '../services/areaService'
import { buildNameMap, resolveOptionValueKey } from '../utils/organizationOptions'

export default function QueryPositions() {
  const fetchItems = useCallback(async () => {
    const [plazas, unidades, departamentos, secciones, areas] = await Promise.all([
      obtenerPlazas(),
      obtenerUnidades(),
      obtenerDepartamentos(),
      obtenerSecciones(),
      obtenerAreas(),
    ])

    const unidadKey = resolveOptionValueKey(unidades, ['id', 'idUnidad'])
    const departamentoKey = resolveOptionValueKey(departamentos, ['id', 'idDepartamento'])
    const seccionKey = resolveOptionValueKey(secciones, ['id', 'idSeccion'])
    const areaKey = resolveOptionValueKey(areas, ['id', 'idArea'])

    const unidadMap = buildNameMap(unidades, { valueKey: unidadKey, labelPrefix: 'Unidad de ' })
    const departamentoMap = buildNameMap(departamentos, { valueKey: departamentoKey, labelPrefix: 'Departamento de ' })
    const seccionMap = buildNameMap(secciones, { valueKey: seccionKey, labelPrefix: 'Sección de ' })
    const areaMap = buildNameMap(areas, { valueKey: areaKey, labelPrefix: 'Área de ' })

    return plazas.map((plaza) => {
      const areaId = plaza.idArea ?? plaza.areaId ?? plaza[areaKey]
      const departamentoId = plaza.idDepartamento ?? plaza.departamentoId ?? plaza[departamentoKey]
      const seccionId = plaza.idSeccion ?? plaza.seccionId ?? plaza[seccionKey]
      const unidadId = plaza.idUnidad ?? plaza.unidadId ?? plaza[unidadKey]

      const areaLabel = areaId ? (areaMap.get(String(areaId)) ?? 'Sin asignación') : 'Sin asignación'
      let dependenciaLabel = 'Sin asignación'

      if (departamentoId) {
        dependenciaLabel = departamentoMap.get(String(departamentoId)) ?? 'Sin asignación'
      }

      if (seccionId) {
        dependenciaLabel = seccionMap.get(String(seccionId)) ?? 'Sin asignación'
      }

      const unidadLabel = unidadId ? (unidadMap.get(String(unidadId)) ?? 'Sin asignación') : 'Sin asignación'

      return { ...plaza, unidadLabel, dependenciaLabel, areaLabel, }
    })
  }, [])

  const columns = [
    {
      key: 'numeroPlaza',
      label: 'Número de Plaza',
      render: (plaza) => plaza.numeroPlaza,
      width: '20%',
    },
    {
      key: 'unidadLabel',
      label: 'Unidad',
      render: (plaza) => plaza.unidadLabel,
      width: '25%',
    },
    {
      key: 'dependenciaLabel',
      label: 'Departamento/Sección',
      render: (plaza) => plaza.dependenciaLabel,
      width: '25%',
    },
    {
      key: 'areaLabel',
      label: 'Área',
      render: (plaza) => plaza.areaLabel,
      width: '20%',
    },
  ]

  const matchesSearch = (plaza, term) => {
    if (!term.trim()) return true
    const lowerTerm = term.toLowerCase()
    return (
      String(plaza.numeroPlaza).includes(lowerTerm) ||
      plaza.unidadLabel?.toLowerCase().includes(lowerTerm) ||
      plaza.departamentoLabel?.toLowerCase().includes(lowerTerm) ||
      plaza.seccionLabel?.toLowerCase().includes(lowerTerm) ||
      plaza.areaLabel?.toLowerCase().includes(lowerTerm)
    )
  }

  return (
    <EntityListPage
      title="Plazas"
      entityLabel="plazas"
      createPath="/organizacion/plazas/crear"
      editPath={(plaza) => `/organizacion/plazas/editar/${plaza.numeroPlaza}`}
      fetchItems={fetchItems}
      columns={columns}
      matchesSearch={matchesSearch}
      getRowId={(plaza) => plaza.numeroPlaza}
      searchPlaceholder="Ingrese el número de plaza, unidad, departamento, sección o área"
    />
  )
}

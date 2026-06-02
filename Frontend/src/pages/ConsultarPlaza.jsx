// ConsultarPlaza.jsx
import { useCallback } from 'react'
import EntityListPage from '../components/EntityListPage'
import { obtenerPlazas } from '../services/plazaService'
import { obtenerUnidades } from '../services/unidadService'
import { obtenerDepartamentos } from '../services/departamentoService'
import { obtenerSecciones } from '../services/seccionService'
import { obtenerAreas } from '../services/areaService'
import { buildNameMap, resolveOptionValueKey } from '../utils/organizationOptions'

export default function ConsultarPlaza() {
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

    return plazas.map((plaza) => ({
      ...plaza,
      unidadLabel:       plaza.idUnidad       ? (unidadMap.get(String(plaza.idUnidad))             ?? 'Sin asignación') : 'Sin asignación',
      departamentoLabel: plaza.idDepartamento ? (departamentoMap.get(String(plaza.idDepartamento)) ?? 'Sin asignación') : 'Sin asignación',
      seccionLabel:      plaza.idSeccion       ? (seccionMap.get(String(plaza.idSeccion))           ?? 'Sin asignación') : 'Sin asignación',
      areaLabel:         plaza.idArea          ? (areaMap.get(String(plaza.idArea))                 ?? 'Sin asignación') : 'Sin asignación',
    }))
  }, [])

  const columns = [
    {
      key: 'numeroPlaza',
      label: 'Número de Plaza',
      render: (plaza) => plaza.numeroPlaza,
    },
    {
      key: 'unidadLabel',
      label: 'Unidad',
      render: (plaza) => plaza.unidadLabel,
    },
    {
      key: 'departamentoLabel',
      label: 'Departamento',
      render: (plaza) => plaza.departamentoLabel,
    },
    {
      key: 'seccionLabel',
      label: 'Sección',
      render: (plaza) => plaza.seccionLabel,
    },
    {
      key: 'areaLabel',
      label: 'Área',
      render: (plaza) => plaza.areaLabel,
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

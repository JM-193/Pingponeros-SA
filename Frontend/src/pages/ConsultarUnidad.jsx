import { useCallback } from 'react'
import EntityListPage from '../components/EntityListPage'
import { obtenerUnidades } from '../services/unidadService'
import { obtenerAreas } from '../services/areaService'
import { obtenerDepartamentos } from '../services/departamentoService'
import { obtenerSecciones } from '../services/seccionService'
import { buildNameMap, formatStatusLabel, resolveOptionValueKey } from '../utils/organizationOptions'

export default function ConsultarUnidad() {
  const fetchItems = useCallback(async () => {
    const [unidades, areas, departamentos, secciones] = await Promise.all([
      obtenerUnidades(),
      obtenerAreas(),
      obtenerDepartamentos(),
      obtenerSecciones(),
    ])

    const areaValueKey = resolveOptionValueKey(areas, ['id', 'idArea'])
    const departamentoValueKey = resolveOptionValueKey(departamentos, ['id', 'idDepartamento'])
    const seccionValueKey = resolveOptionValueKey(secciones, ['id', 'idSeccion'])

    const areaMap = buildNameMap(areas, { valueKey: areaValueKey, labelPrefix: 'Área de ' })
    const departamentoMap = buildNameMap(departamentos, { valueKey: departamentoValueKey, labelPrefix: 'Departamento de ' })
    const seccionMap = buildNameMap(secciones, { valueKey: seccionValueKey, labelPrefix: 'Sección de ' })

    return unidades.map((unidad) => {
      const areaId = unidad.idArea ?? unidad.areaId ?? unidad[areaValueKey]
      const departamentoId = unidad.idDepartamento ?? unidad.departamentoId ?? unidad[departamentoValueKey]
      const seccionId = unidad.idSeccion ?? unidad.seccionId

      const areaLabel = areaId ? (areaMap.get(String(areaId)) ?? 'Sin asignación') : 'Sin asignación'
      let dependenciaLabel = 'Sin asignación'

      if (departamentoId) {
        dependenciaLabel = departamentoMap.get(String(departamentoId)) ?? 'Sin asignación'
      }

      if (seccionId) {
        dependenciaLabel = seccionMap.get(String(seccionId)) ?? 'Sin asignación'
      }

      return { ...unidad, areaLabel, dependenciaLabel }
    })
  }, [])

  const columns = [
    {
      key: 'nombre',
      label: 'Nombre',
      render: (unidad) => unidad.nombre,
      width: '20%',
    },
    {
      key: 'descripcion',
      label: 'Descripción',
      render: (unidad) => unidad.descripcion,
      width: '30%',
    },
    {
      key: 'areaLabel',
      label: 'Área',
      render: (unidad) => unidad.areaLabel,
      width: '15%',
    },
    {
      key: 'dependenciaLabel',
      label: 'Departamento/Sección',
      render: (unidad) => unidad.dependenciaLabel,
      width: '15%',
    },
    {
      key: 'estado',
      label: 'Estado',
      align: 'center',
      render: (unidad) => formatStatusLabel(unidad.estado),
      width: '10%',
    },
  ]

  const matchesSearch = (unidad, term) => {
    if (!term.trim()) return true
    const lowerTerm = term.toLowerCase()
    return (
      unidad.nombre.toLowerCase().includes(lowerTerm) ||
      unidad.descripcion.toLowerCase().includes(lowerTerm) ||
      unidad.areaLabel?.toLowerCase().includes(lowerTerm) ||
      unidad.dependenciaLabel?.toLowerCase().includes(lowerTerm)
    )
  }

  return (
    <EntityListPage
      title="Unidades"
      entityLabel="unidades"
      createPath="/organizacion/unidades/crear"
      editPath={(unidad) => `/organizacion/unidades/editar/${encodeURIComponent(unidad.nombre)}`}
      fetchItems={fetchItems}
      columns={columns}
      matchesSearch={matchesSearch}
      getRowId={(unidad) => unidad.id ?? unidad.idUnidad}
      searchPlaceholder="Ingrese el nombre, descripción, área o dependencia de la unidad"
    />
  )
}

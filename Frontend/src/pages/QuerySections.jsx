import { useCallback } from 'react'
import EntityListPage from '../components/EntityListPage'
import { obtenerSecciones } from '../services/sectionService'
import { obtenerAreas } from '../services/areaService'
import { buildNameMap, formatStatusLabel, resolveOptionValueKey } from '../utils/organizationOptions'
import { ENTITY_FORMS_AS_MODAL } from '../constants/uiMode'
import CreateSections from './CreateSections'
import EditSections from './EditSections'

export default function QuerySections() {
  const fetchItems = useCallback(async () => {
    const [secciones, areas] = await Promise.all([
      obtenerSecciones(),
      obtenerAreas(),
    ])

    const areaValueKey = resolveOptionValueKey(areas, ['id', 'idArea'])
    const areaMap = buildNameMap(areas, { valueKey: areaValueKey, labelPrefix: 'Área de ' })

    return secciones.map((seccion) => {
      const areaId = seccion.idArea ?? seccion.areaId ?? seccion[areaValueKey]
      const areaLabel = areaId ? (areaMap.get(String(areaId)) ?? 'Sin asignación') : 'Sin asignación'

      return { ...seccion, areaLabel }
    })
  }, [])

  const columns = [
    {
      key: 'nombre',
      label: 'Nombre',
      render: (seccion) => seccion.nombre,
      width: '20%',
    },
    {
      key: 'descripcion',
      label: 'Descripción',
      render: (seccion) => seccion.descripcion,
      width: '40%',
    },
    {
      key: 'areaLabel',
      label: 'Área',
      render: (seccion) => seccion.areaLabel,
      width: '20%',
    },
    {
      key: 'estado',
      label: 'Estado',
      align: 'center',
      render: (seccion) => formatStatusLabel(seccion.estado),
      width: '10%',
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

  const formProps = ENTITY_FORMS_AS_MODAL
    ? {
        renderCreateModal: ({ isModal, isOpen, onClose, onSuccess }) => (
          <CreateSections isModal={isModal} isOpen={isOpen} onClose={onClose} onSuccess={onSuccess} />
        ),
        renderEditModal: ({ isModal, isOpen, onClose, onSuccess, item }) =>
          item && <EditSections isModal={isModal} isOpen={isOpen} entityName={item.nombre} onClose={onClose} onSuccess={onSuccess} />,
      }
    : {
        createPath: '/organizacion/secciones/crear',
        editPath: (seccion) => `/organizacion/secciones/editar/${encodeURIComponent(seccion.nombre)}`,
      }

  return (
    <EntityListPage
      title="Secciones"
      entityLabel="secciones"
      fetchItems={fetchItems}
      columns={columns}
      matchesSearch={matchesSearch}
      getRowId={(seccion) => seccion.id ?? seccion.idSeccion}
      searchPlaceholder="Ingrese el nombre, descripción o área de la sección"
      {...formProps}
    />
  )
}

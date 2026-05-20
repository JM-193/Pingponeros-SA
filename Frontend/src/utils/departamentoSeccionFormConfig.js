export const DEPARTAMENTO_SECCION_INITIAL_FORM_DATA = {
  idArea: '',
  nombre: '',
  descripcion: '',
  estado: 1,
}

const DEPARTAMENTO_SECCION_FORM_CONFIG = {
  departamento: {
    titleCreate: 'Crear Departamento',
    titleEdit: 'Editar Departamento',
    namePrefix: 'Departamento de',
    namePlaceholder: 'Nombre del departamento',
    descriptionPlaceholder: 'Ingrese la descripci\u00f3n del departamento',
    entityLabel: 'departamento',
    nameArticle: 'del',
    listPath: '/organizacion/departamentos/consultar',
    successCreateMessage: 'Departamento creado correctamente',
    successEditMessage: 'Departamento actualizado correctamente',
    loadingEditLabel: 'Cargando departamento...',
  },
  seccion: {
    titleCreate: 'Crear Secci\u00f3n',
    titleEdit: 'Editar Secci\u00f3n',
    namePrefix: 'Secci\u00f3n de',
    namePlaceholder: 'Nombre de la secci\u00f3n',
    descriptionPlaceholder: 'Ingrese la descripci\u00f3n de la secci\u00f3n',
    entityLabel: 'secci\u00f3n',
    nameArticle: 'de la',
    listPath: '/organizacion/secciones/consultar',
    successCreateMessage: 'Secci\u00f3n creada correctamente',
    successEditMessage: 'Secci\u00f3n actualizada correctamente',
    loadingEditLabel: 'Cargando secci\u00f3n...',
  },
}

export function getDepartamentoSeccionConfig(entityType) {
  const config = DEPARTAMENTO_SECCION_FORM_CONFIG[entityType]
  if (!config) {
    throw new Error(`Tipo de entidad no soportado: ${entityType}`)
  }
  return config
}

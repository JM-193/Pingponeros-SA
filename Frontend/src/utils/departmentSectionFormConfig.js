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
    nameLabel: 'Nombre del Departamento',
    descriptionLabel: 'Descripción del Departamento',
    descriptionPlaceholder: 'Ingrese la descripción del departamento',
    entityLabel: 'departamento',
    nameArticle: 'del',
    listPath: '/organizacion/departamentos/consultar',
    successCreateMessage: 'Departamento creado correctamente',
    successEditMessage: 'Departamento actualizado correctamente',
    loadingEditLabel: 'Cargando departamento...',
  },
  seccion: {
    titleCreate: 'Crear Sección',
    titleEdit: 'Editar Sección',
    namePrefix: 'Sección de',
    namePlaceholder: 'Nombre de la sección',
    nameLabel: 'Nombre de la Sección',
    descriptionLabel: 'Descripción de la Sección',
    descriptionPlaceholder: 'Ingrese la descripción de la sección',
    entityLabel: 'sección',
    nameArticle: 'de la',
    listPath: '/organizacion/secciones/consultar',
    successCreateMessage: 'Sección creada correctamente',
    successEditMessage: 'Sección actualizada correctamente',
    loadingEditLabel: 'Cargando sección...',
  },
}

export function getDepartamentoSeccionConfig(entityType) {
  const config = DEPARTAMENTO_SECCION_FORM_CONFIG[entityType]
  if (!config) {
    throw new Error(`Tipo de entidad no soportado: ${entityType}`)
  }
  return config
}

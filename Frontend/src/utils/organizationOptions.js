export function buildLabeledOptions(items, { valueKey = 'id', labelPrefix = '' } = {}) {
  return items.map((item) => ({
    value: String(item[valueKey]),
    label: `${labelPrefix}${item.nombre}`,
  }))
}

export function buildNameMap(items, { valueKey = 'id', labelPrefix = '' } = {}) {
  const map = new Map()
  items.forEach((item) => {
    map.set(String(item[valueKey]), `${labelPrefix}${item.nombre}`)
  })
  return map
}

export function resolveOptionValueKey(items, candidateKeys = ['id']) {
  if (!Array.isArray(items) || items.length === 0) return candidateKeys[0] ?? 'id'
  const sample = items[0]
  const found = candidateKeys.find((key) => Object.hasOwn(sample, key))
  return found ?? candidateKeys[0] ?? 'id'
}

export function formatStatusLabel(estado) {
  return estado === 1 ? 'Activo' : 'Inactivo'
}

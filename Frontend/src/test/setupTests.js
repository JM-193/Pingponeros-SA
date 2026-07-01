import '@testing-library/jest-dom/vitest'
// vite-node (vitest 3.x) no soporta la transformación JSX OXC de Vite 8, por lo que el JSX
// se compila con el runtime clásico (React.createElement). Se expone React como global
// para que todos los archivos de prueba funcionen sin necesitar un import explícito.
import React from 'react'
globalThis.React = React

// react-toastify y sweetalert2 tocan APIs del DOM/timers que jsdom no implementa
// en su totalidad; se mockean globalmente para que las pruebas no dependan de su render real.
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    warn: vi.fn(),
    dismiss: vi.fn(),
  },
  ToastContainer: () => null,
}))

vi.mock('sweetalert2', () => {
  const fire = vi.fn(() => Promise.resolve({ isConfirmed: true }))
  return { default: { mixin: () => ({ fire }), fire } }
})

// react-select renderiza un combobox enriquecido (input de búsqueda + menú en portal)
// que no encaja con jsdom ni con las interacciones nativas de las pruebas. Se mockea con
// un <select> nativo que respeta el contrato de props del componente (value como objeto
// { value, label } y onChange recibiendo la opción seleccionada), de modo que las pruebas
// puedan seguir usando fireEvent.change/getByRole('combobox') como con el <select> previo.
vi.mock('react-select', () => ({
  default: ({
    options = [],
    value,
    onChange,
    inputId,
    name,
    isDisabled,
    placeholder,
    required,
    'aria-invalid': ariaInvalid,
    'aria-label': ariaLabel,
  }) =>
    React.createElement(
      'select',
      {
        id: inputId,
        name,
        disabled: isDisabled,
        required,
        'aria-invalid': ariaInvalid,
        'aria-label': ariaLabel,
        value: value ? value.value : '',
        onChange: (event) => {
          const selected = options.find((option) => String(option.value) === event.target.value)
          onChange(selected || null, { action: selected ? 'select-option' : 'clear' })
        },
      },
      [
        React.createElement('option', { key: '__placeholder__', value: '' }, placeholder),
        ...options.map((option) =>
          React.createElement('option', { key: option.value, value: option.value }, option.label),
        ),
      ],
    ),
}))

if (typeof globalThis.matchMedia !== 'function') {
  Object.defineProperty(globalThis, 'matchMedia', {
    writable: true,
    value: (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}

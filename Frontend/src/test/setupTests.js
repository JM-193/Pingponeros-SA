import '@testing-library/jest-dom/vitest'
// vite-node (vitest 3.x) does not support Vite 8's OXC JSX transform, so JSX
// is compiled with the classic runtime (React.createElement). Make React global
// so all test files work without needing an explicit import.
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

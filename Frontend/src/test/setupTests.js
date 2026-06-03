import '@testing-library/jest-dom/vitest'
// vite-node (vitest 3.x) does not support Vite 8's OXC JSX transform, so JSX
// is compiled with the classic runtime (React.createElement). Make React global
// so all test files work without needing an explicit import.
import React from 'react'
globalThis.React = React

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

import { render, screen, fireEvent } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import EntityResultsTable from '../components/EntityResultsTable'

const columns = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'codigo', label: 'Codigo', align: 'right' },
]

const rows = [
  { id: 1, nombre: 'Area Administrativa', codigo: 'ADM-01' },
  { id: 2, nombre: 'Area Financiera', codigo: 'FIN-02' },
]

const defaultProps = {
  columns,
  rows,
  getRowId: (row) => row.id,
}

function mockMatchMedia(matches) {
  Object.defineProperty(globalThis, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

afterEach(() => {
  mockMatchMedia(false)
  vi.clearAllMocks()
})

describe('EntityResultsTable', () => {
  it('renderiza una tabla en escritorio', () => {
    mockMatchMedia(false)

    render(<EntityResultsTable {...defaultProps} />)

    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Nombre' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Area Administrativa' })).toBeInTheDocument()
    expect(screen.queryAllByText('Nombre')).toHaveLength(1)
  })

  it('renderiza tarjetas en móvil', () => {
    mockMatchMedia(true)

    render(<EntityResultsTable {...defaultProps} />)

    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.getAllByText('Nombre')).toHaveLength(rows.length)
    expect(screen.getByText('Area Administrativa')).toBeInTheDocument()
    expect(screen.getByText('FIN-02')).toBeInTheDocument()
  })

  it('mantiene la acción de editar en móvil', () => {
    mockMatchMedia(true)
    const onEdit = vi.fn()

    render(<EntityResultsTable {...defaultProps} onEdit={onEdit} />)

    const editButtons = screen.getAllByRole('button', { name: 'Editar' })
    expect(editButtons).toHaveLength(rows.length)

    fireEvent.click(editButtons[0])
    expect(onEdit).toHaveBeenCalledWith(rows[0])
  })

  it('permite ordenar columnas en escritorio', () => {
    mockMatchMedia(false)
    const onSort = vi.fn()

    render(
      <EntityResultsTable
        {...defaultProps}
        sortConfig={{ key: 'nombre', direction: 'asc' }}
        onSort={onSort}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Ordenar por Nombre descendente' }))
    expect(onSort).toHaveBeenCalledWith('nombre')
  })
})

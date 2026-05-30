// PaginationControls.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import PaginationControls from '../components/PaginationControls'

describe('PaginationControls', () => {
  it('no renderiza nada cuando totalPages es 1', () => {
    const { container } = render(
      <PaginationControls currentPage={1} totalPages={1} handlePageChange={vi.fn()} />,
    )

    expect(container.firstChild).toBeNull()
  })

  it('no renderiza nada cuando totalPages es 0', () => {
    const { container } = render(
      <PaginationControls currentPage={1} totalPages={0} handlePageChange={vi.fn()} />,
    )

    expect(container.firstChild).toBeNull()
  })

  it('renderiza botones Anterior, Siguiente y páginas', () => {
    render(
      <PaginationControls currentPage={1} totalPages={3} handlePageChange={vi.fn()} />,
    )

    expect(screen.getByRole('button', { name: 'Anterior' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument()
  })

  it('deshabilita botón Anterior en la primera página', () => {
    render(
      <PaginationControls currentPage={1} totalPages={3} handlePageChange={vi.fn()} />,
    )

    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()
  })

  it('deshabilita botón Siguiente en la última página', () => {
    render(
      <PaginationControls currentPage={3} totalPages={3} handlePageChange={vi.fn()} />,
    )

    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled()
  })

  it('llama a handlePageChange con página anterior al hacer clic en Anterior', () => {
    const handlePageChange = vi.fn()
    render(
      <PaginationControls currentPage={2} totalPages={3} handlePageChange={handlePageChange} />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Anterior' }))

    expect(handlePageChange).toHaveBeenCalledWith(1)
  })

  it('llama a handlePageChange con página siguiente al hacer clic en Siguiente', () => {
    const handlePageChange = vi.fn()
    render(
      <PaginationControls currentPage={2} totalPages={3} handlePageChange={handlePageChange} />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))

    expect(handlePageChange).toHaveBeenCalledWith(3)
  })

  it('llama a handlePageChange con el número de página al hacer clic en un botón de página', () => {
    const handlePageChange = vi.fn()
    render(
      <PaginationControls currentPage={1} totalPages={3} handlePageChange={handlePageChange} />,
    )

    fireEvent.click(screen.getByRole('button', { name: '2' }))

    expect(handlePageChange).toHaveBeenCalledWith(2)
  })
})

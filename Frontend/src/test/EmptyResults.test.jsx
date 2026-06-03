// EmptyResults.test.jsx
import { render, screen } from '@testing-library/react'
import EmptyResults from '../components/EmptyResults'

describe('EmptyResults', () => {
  it('muestra mensaje sin término de búsqueda', () => {
    render(<EmptyResults entityLabel="áreas" />)

    expect(screen.getByText('No se encontraron áreas disponibles.')).toBeInTheDocument()
  })

  it('muestra mensaje con término de búsqueda', () => {
    render(<EmptyResults entityLabel="áreas" searchTerm="administración" />)

    expect(
      screen.getByText('No se encontraron áreas que coincidan con "administración"'),
    ).toBeInTheDocument()
  })

  it('trata searchTerm vacío como sin término de búsqueda', () => {
    render(<EmptyResults entityLabel="departamentos" searchTerm="" />)

    expect(screen.getByText('No se encontraron departamentos disponibles.')).toBeInTheDocument()
  })

  it('trata searchTerm de solo espacios como sin término de búsqueda', () => {
    render(<EmptyResults entityLabel="secciones" searchTerm="   " />)

    expect(screen.getByText('No se encontraron secciones disponibles.')).toBeInTheDocument()
  })
})

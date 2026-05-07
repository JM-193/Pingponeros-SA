// StatusMessage.test.jsx
import { render, screen } from '@testing-library/react'
import StatusMessage from '../components/StatusMessage'

describe('StatusMessage', () => {
  it('renderiza el mensaje de éxito con el Ã­cono correcto', () => {
    render(<StatusMessage variant="success" message="Operación exitosa" />)

    expect(screen.getByText('Operación exitosa')).toBeInTheDocument()
    expect(screen.getByText('\u2713')).toBeInTheDocument()
  })

  it('renderiza el mensaje de error con el Ã­cono correcto', () => {
    render(<StatusMessage variant="error" message="Ocurrió un error" />)

    expect(screen.getByText('Ocurrió un error')).toBeInTheDocument()
    expect(screen.getByText('\u26a0')).toBeInTheDocument()
  })

  it('renderiza contenido hijo cuando se proporciona', () => {
    render(
      <StatusMessage variant="success" message="Éxito">
        <span>Detalle adicional</span>
      </StatusMessage>,
    )

    expect(screen.getByText('Detalle adicional')).toBeInTheDocument()
  })

  it('no renderiza contenido hijo cuando no se proporciona', () => {
    render(<StatusMessage variant="success" message="Éxito" />)

    expect(screen.queryByText('Detalle adicional')).not.toBeInTheDocument()
  })
})


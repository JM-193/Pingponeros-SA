// App.test.jsx
import { render, screen } from '@testing-library/react'
import App from '../App'
import * as sessionService from '../services/session'

vi.mock('../services/session')

describe('App', () => {
  it('renderiza sin errores y muestra la página de Login en la ruta raíz', () => {
    sessionService.obtenerSesion.mockReturnValue(null)

    render(<App />)

    expect(screen.getByLabelText('Correo Institucional')).toBeInTheDocument()
  })
})

// StateToggle.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import StateToggle from '../components/StateToggle'

describe('StateToggle', () => {
  const defaultProps = {
    currentState: 1,
    onStateChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza la etiqueta "Estado actual:"', () => {
    render(<StateToggle {...defaultProps} />)

    expect(screen.getByText('Estado actual:')).toBeInTheDocument()
  })

  it('renderiza los botones "Activo" e "Inactivo"', () => {
    render(<StateToggle {...defaultProps} />)

    expect(screen.getByRole('button', { name: 'Activo' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Inactivo' })).toBeInTheDocument()
  })

  it('renderiza el grupo de botones con role="radiogroup"', () => {
    render(<StateToggle {...defaultProps} />)

    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
  })

  it('el radiogroup tiene aria-label="Estado del área"', () => {
    render(<StateToggle {...defaultProps} />)

    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-label', 'Estado del área')
  })

  it('todos los botones tienen type="button"', () => {
    render(<StateToggle {...defaultProps} />)

    screen.getAllByRole('button').forEach((btn) => {
      expect(btn).toHaveAttribute('type', 'button')
    })
  })

  it('llama a onStateChange con 1 al hacer clic en "Activo"', () => {
    const onStateChange = vi.fn()
    render(<StateToggle currentState={0} onStateChange={onStateChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Activo' }))

    expect(onStateChange).toHaveBeenCalledTimes(1)
    expect(onStateChange).toHaveBeenCalledWith(1)
  })

  it('llama a onStateChange con 0 al hacer clic en "Inactivo"', () => {
    const onStateChange = vi.fn()
    render(<StateToggle currentState={1} onStateChange={onStateChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Inactivo' }))

    expect(onStateChange).toHaveBeenCalledTimes(1)
    expect(onStateChange).toHaveBeenCalledWith(0)
  })

  it('no llama a onStateChange cuando está deshabilitado', () => {
    const onStateChange = vi.fn()
    render(<StateToggle currentState={1} onStateChange={onStateChange} disabled />)

    fireEvent.click(screen.getByRole('button', { name: 'Inactivo' }))

    expect(onStateChange).not.toHaveBeenCalled()
  })

  it('los botones están deshabilitados cuando disabled es true', () => {
    render(<StateToggle {...defaultProps} disabled />)

    screen.getAllByRole('button').forEach((btn) => {
      expect(btn).toBeDisabled()
    })
  })

  it('los botones no están deshabilitados por defecto', () => {
    render(<StateToggle {...defaultProps} />)

    screen.getAllByRole('button').forEach((btn) => {
      expect(btn).not.toBeDisabled()
    })
  })

  it('el botón activo tiene fondo blanco cuando currentState es 1', () => {
    render(<StateToggle currentState={1} onStateChange={vi.fn()} />)

    const activoBtn = screen.getByRole('button', { name: 'Activo' })
    expect(activoBtn).toHaveStyle({ backgroundColor: '#fff' })
  })

  it('el botón activo tiene fondo blanco cuando currentState es 0', () => {
    render(<StateToggle currentState={0} onStateChange={vi.fn()} />)

    const inactivoBtn = screen.getByRole('button', { name: 'Inactivo' })
    expect(inactivoBtn).toHaveStyle({ backgroundColor: '#fff' })
  })

  it('el botón inactivo (no seleccionado) no tiene fondo blanco', () => {
    render(<StateToggle currentState={1} onStateChange={vi.fn()} />)

    const inactivoBtn = screen.getByRole('button', { name: 'Inactivo' })
    expect(inactivoBtn).not.toHaveStyle({ backgroundColor: '#fff' })
  })

  it('aplica opacity 0.5 en botones cuando disabled es true', () => {
    render(<StateToggle {...defaultProps} disabled />)

    screen.getAllByRole('button').forEach((btn) => {
      expect(btn).toHaveStyle({ opacity: 0.5 })
    })
  })

  it('aplica opacity 1 en botones cuando no está deshabilitado', () => {
    render(<StateToggle {...defaultProps} />)

    screen.getAllByRole('button').forEach((btn) => {
      expect(btn).toHaveStyle({ opacity: 1 })
    })
  })

  it('cambia el fondo al pasar el mouse sobre un botón no activo', () => {
    render(<StateToggle currentState={1} onStateChange={vi.fn()} />)

    const inactivoBtn = screen.getByRole('button', { name: 'Inactivo' })
    fireEvent.mouseEnter(inactivoBtn)

    expect(inactivoBtn).toHaveStyle({ backgroundColor: 'rgba(255, 255, 255, 0.5)' })
  })

  it('no cambia el fondo al pasar el mouse sobre un botón no activo cuando está deshabilitado', () => {
    render(<StateToggle currentState={1} onStateChange={vi.fn()} disabled />)

    const inactivoBtn = screen.getByRole('button', { name: 'Inactivo' })
    fireEvent.mouseEnter(inactivoBtn)

    expect(inactivoBtn).not.toHaveStyle({ backgroundColor: 'rgba(255, 255, 255, 0.5)' })
  })

  it('restaura el fondo sin el hover al salir el mouse del botón no activo', () => {
    render(<StateToggle currentState={1} onStateChange={vi.fn()} />)

    const inactivoBtn = screen.getByRole('button', { name: 'Inactivo' })
    fireEvent.mouseEnter(inactivoBtn)
    fireEvent.mouseLeave(inactivoBtn)

    expect(inactivoBtn).not.toHaveStyle({ backgroundColor: 'rgba(255, 255, 255, 0.5)' })
  })

  it('no cambia el fondo al salir el mouse del botón activo', () => {
    render(<StateToggle currentState={1} onStateChange={vi.fn()} />)

    const activoBtn = screen.getByRole('button', { name: 'Activo' })
    fireEvent.mouseLeave(activoBtn)

    expect(activoBtn).toHaveStyle({ backgroundColor: '#fff' })
  })

  it('el primer botón tiene border-radius redondeado a la izquierda', () => {
    render(<StateToggle {...defaultProps} />)

    const activoBtn = screen.getByRole('button', { name: 'Activo' })
    expect(activoBtn).toHaveStyle({ borderRadius: '6px 0 0 6px' })
  })

  it('el último botón tiene border-radius redondeado a la derecha', () => {
    render(<StateToggle {...defaultProps} />)

    const inactivoBtn = screen.getByRole('button', { name: 'Inactivo' })
    expect(inactivoBtn).toHaveStyle({ borderRadius: '0 6px 6px 0' })
  })
})

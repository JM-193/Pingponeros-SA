import { COLORS } from '../constants/colors'

// Determina el color del borde del control según su estado.
const getControlBorderColor = (error, isFocused) => {
  if (error) return COLORS.danger
  if (isFocused) return COLORS.primaryBtn
  return COLORS.borderColor
}

// Determina el color de fondo de una opción según su estado.
const getOptionBackgroundColor = (isSelected, isFocused) => {
  if (isSelected) return COLORS.primaryBtn
  if (isFocused) return COLORS.surfaceHover
  return COLORS.inputBg
}

// Determina el box-shadow del control: solo visible al enfocar, con el color
// correspondiente al estado de error.
const getControlBoxShadow = (error, isFocused) => {
  if (!isFocused) return 'none'
  return `0 0 0 1px ${error ? COLORS.danger : COLORS.primaryBtn}`
}

// Estilos compartidos para los componentes react-select de la aplicación.
// Replican la apariencia de los <select> nativos previos (borde, radio, fuente,
// relleno) y aseguran que el menú se muestre por encima de los modales mediante
// un portal al body.
export const buildSelectStyles = ({ error = false } = {}) => ({
  control: (base, state) => ({
    ...base,
    minHeight: '42px',
    fontSize: '14px',
    borderRadius: '4px',
    backgroundColor: state.isDisabled ? COLORS.disabledBg : COLORS.inputBg,
    borderColor: getControlBorderColor(error, state.isFocused),
    borderWidth: error ? '2px' : '1px',
    boxShadow: getControlBoxShadow(error, state.isFocused),
    opacity: state.isDisabled ? 0.7 : 1,
    '&:hover': {
      borderColor: error ? COLORS.danger : COLORS.primaryBtn,
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '2px 10px',
  }),
  placeholder: (base) => ({
    ...base,
    color: COLORS.textSubtle,
  }),
  singleValue: (base, state) => ({
    ...base,
    color: state.isDisabled ? COLORS.disabledColor : COLORS.black,
  }),
  input: (base) => ({
    ...base,
    color: COLORS.black,
  }),
  menu: (base) => ({
    ...base,
    fontSize: '14px',
    zIndex: 30,
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,
    fontSize: '14px',
    backgroundColor: getOptionBackgroundColor(state.isSelected, state.isFocused),
    color: state.isSelected ? COLORS.white : COLORS.black,
    cursor: 'pointer',
  }),
})

// Tema base de react-select alineado con la paleta de la aplicación.
export const selectTheme = (theme) => ({
  ...theme,
  colors: {
    ...theme.colors,
    primary: COLORS.primaryBtn,
    primary25: COLORS.surfaceHover,
    primary50: COLORS.surfaceMuted,
    danger: COLORS.danger,
  },
})

// Renderiza el menú dentro de un portal al body para evitar recortes dentro de
// modales con overflow oculto. Seguro durante SSR/pruebas (document existe en jsdom).
export const menuPortalTarget = typeof document === 'undefined' ? undefined : document.body

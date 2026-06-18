import { Link as RouterLink, matchPath, useLocation } from 'react-router-dom'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import MuiLink from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { COLORS } from '../constants/colors'
import { useMediaQuery } from '../hooks/useMediaQuery'

const BREADCRUMB_MAP = [
  {
    pattern: '/home',
    crumbs: [{ label: 'Inicio' }],
  },
  {
    pattern: '/cambiar-contrasena',
    crumbs: [
      { label: 'Inicio', to: '/home' },
      { label: 'Cambiar Contraseña' },
    ],
  },
  {
    pattern: '/usuarios/consultar',
    crumbs: [
      { label: 'Inicio', to: '/home' },
      { label: 'Usuarios' },
      { label: 'Consultar' },
    ],
  },
  {
    pattern: '/usuarios/crear',
    crumbs: [
      { label: 'Inicio', to: '/home' },
      { label: 'Usuarios' },
      { label: 'Crear' },
    ],
  },
  {
    pattern: '/usuarios/editar/:correo',
    crumbs: [
      { label: 'Inicio', to: '/home' },
      { label: 'Usuarios', to: '/usuarios/consultar' },
      { label: 'Editar' },
    ],
  },
  {
    pattern: '/organizacion/areas/consultar',
    crumbs: [
      { label: 'Inicio', to: '/home' },
      { label: 'Organización' },
      { label: 'Áreas' },
      { label: 'Consultar' },
    ],
  },
  {
    pattern: '/organizacion/areas/crear',
    crumbs: [
      { label: 'Inicio', to: '/home' },
      { label: 'Organización' },
      { label: 'Áreas', to: '/organizacion/areas/consultar' },
      { label: 'Crear' },
    ],
  },
  {
    pattern: '/organizacion/areas/editar/:nombre',
    crumbs: [
      { label: 'Inicio', to: '/home' },
      { label: 'Organización' },
      { label: 'Áreas', to: '/organizacion/areas/consultar' },
      { label: 'Editar' },
    ],
  },
  {
    pattern: '/organizacion/departamentos/consultar',
    crumbs: [
      { label: 'Inicio', to: '/home' },
      { label: 'Organización' },
      { label: 'Departamentos' },
      { label: 'Consultar' },
    ],
  },
  {
    pattern: '/organizacion/departamentos/crear',
    crumbs: [
      { label: 'Inicio', to: '/home' },
      { label: 'Organización' },
      { label: 'Departamentos', to: '/organizacion/departamentos/consultar' },
      { label: 'Crear' },
    ],
  },
  {
    pattern: '/organizacion/departamentos/editar/:nombre',
    crumbs: [
      { label: 'Inicio', to: '/home' },
      { label: 'Organización' },
      { label: 'Departamentos', to: '/organizacion/departamentos/consultar' },
      { label: 'Editar' },
    ],
  },
  {
    pattern: '/organizacion/secciones/consultar',
    crumbs: [
      { label: 'Inicio', to: '/home' },
      { label: 'Organización' },
      { label: 'Secciones' },
      { label: 'Consultar' },
    ],
  },
  {
    pattern: '/organizacion/secciones/crear',
    crumbs: [
      { label: 'Inicio', to: '/home' },
      { label: 'Organización' },
      { label: 'Secciones', to: '/organizacion/secciones/consultar' },
      { label: 'Crear' },
    ],
  },
  {
    pattern: '/organizacion/secciones/editar/:nombre',
    crumbs: [
      { label: 'Inicio', to: '/home' },
      { label: 'Organización' },
      { label: 'Secciones', to: '/organizacion/secciones/consultar' },
      { label: 'Editar' },
    ],
  },
  {
    pattern: '/organizacion/unidades/consultar',
    crumbs: [
      { label: 'Inicio', to: '/home' },
      { label: 'Organización' },
      { label: 'Unidades' },
      { label: 'Consultar' },
    ],
  },
  {
    pattern: '/organizacion/unidades/crear',
    crumbs: [
      { label: 'Inicio', to: '/home' },
      { label: 'Organización' },
      { label: 'Unidades', to: '/organizacion/unidades/consultar' },
      { label: 'Crear' },
    ],
  },
  {
    pattern: '/organizacion/unidades/editar/:nombre',
    crumbs: [
      { label: 'Inicio', to: '/home' },
      { label: 'Organización' },
      { label: 'Unidades', to: '/organizacion/unidades/consultar' },
      { label: 'Editar' },
    ],
  },
  {
    pattern: '/organizacion/plazas/consultar',
    crumbs: [
      { label: 'Inicio', to: '/home' },
      { label: 'Organización' },
      { label: 'Plazas' },
      { label: 'Consultar' },
    ],
  },
  {
    pattern: '/organizacion/plazas/crear',
    crumbs: [
      { label: 'Inicio', to: '/home' },
      { label: 'Organización' },
      { label: 'Plazas', to: '/organizacion/plazas/consultar' },
      { label: 'Crear' },
    ],
  },
  {
    pattern: '/organizacion/plazas/editar/:numeroPlaza',
    crumbs: [
      { label: 'Inicio', to: '/home' },
      { label: 'Organización' },
      { label: 'Plazas', to: '/organizacion/plazas/consultar' },
      { label: 'Editar' },
    ],
  },
]

export default function AppBreadcrumbs() {
  const location = useLocation()
  const isMobile = useMediaQuery('(max-width: 768px)')

  const matched = BREADCRUMB_MAP.find(({ pattern }) =>
    matchPath({ path: pattern, end: true }, location.pathname)
  )

  if (!matched || matched.crumbs.length <= 1) return null

  const { crumbs } = matched

  return (
    <div
      style={{
        backgroundColor: '#f7f7f7',
        borderBottom: `1px solid ${COLORS.borderLight}`,
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: isMobile ? '6px 16px' : '6px 40px',
          boxSizing: 'border-box',
        }}
      >
        <Breadcrumbs
          aria-label="breadcrumb"
          maxItems={isMobile ? 2 : undefined}
          itemsBeforeCollapse={isMobile ? 1 : undefined}
          itemsAfterCollapse={isMobile ? 1 : undefined}
          sx={{ fontSize: '13px' }}
        >
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1

            if (isLast) {
              return (
                <Typography
                  key={crumb.label}
                  sx={{ fontSize: '13px', color: COLORS.textDark, fontWeight: 600 }}
                >
                  {crumb.label}
                </Typography>
              )
            }

            if (crumb.to) {
              return (
                <MuiLink
                  key={crumb.label}
                  component={RouterLink}
                  to={crumb.to}
                  underline="hover"
                  sx={{ fontSize: '13px', color: COLORS.primaryBtn }}
                >
                  {crumb.label}
                </MuiLink>
              )
            }

            return (
              <Typography
                key={crumb.label}
                sx={{ fontSize: '13px', color: COLORS.textMuted }}
              >
                {crumb.label}
              </Typography>
            )
          })}
        </Breadcrumbs>
      </div>
    </div>
  )
}

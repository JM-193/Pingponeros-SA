import { Link as RouterLink, matchPath, useLocation } from 'react-router-dom'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import MuiLink from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { COLORS } from '../constants/colors'
import { useMediaQuery } from '../hooks/useMediaQuery'

const HOME = { label: 'Inicio', to: '/home' }
const ORGANIZATION = { label: 'Organización' }

const USERS = { label: 'Usuarios' }

const AREAS = {
  label: 'Áreas',
  to: '/organizacion/areas/consultar',
}

const DEPARTMENTS = {
  label: 'Departamentos',
  to: '/organizacion/departamentos/consultar',
}

const SECTIONS = {
  label: 'Secciones',
  to: '/organizacion/secciones/consultar',
}

const UNITS = {
  label: 'Unidades',
  to: '/organizacion/unidades/consultar',
}

const POSITIONS = {
  label: 'Plazas',
  to: '/organizacion/plazas/consultar',
}

const BREADCRUMB_MAP = [
  {
    pattern: '/home',
    crumbs: [{ label: 'Inicio' }],
  },

  {
    pattern: '/cambiar-contrasena',
    crumbs: [
      HOME,
      { label: 'Cambiar Contraseña' },
    ],
  },

  {
    pattern: '/usuarios/consultar',
    crumbs: [
      HOME,
      USERS,
      { label: 'Consultar' },
    ],
  },
  {
    pattern: '/usuarios/crear',
    crumbs: [
      HOME,
      USERS,
      { label: 'Crear' },
    ],
  },
  {
    pattern: '/usuarios/editar/:correo',
    crumbs: [
      HOME,
      { ...USERS, to: '/usuarios/consultar' },
      { label: 'Editar' },
    ],
  },

  {
    pattern: '/organizacion/areas/consultar',
    crumbs: [
      HOME,
      ORGANIZATION,
      { label: 'Áreas' },
      { label: 'Consultar' },
    ],
  },
  {
    pattern: '/organizacion/areas/crear',
    crumbs: [
      HOME,
      ORGANIZATION,
      AREAS,
      { label: 'Crear' },
    ],
  },
  {
    pattern: '/organizacion/areas/editar/:nombre',
    crumbs: [
      HOME,
      ORGANIZATION,
      AREAS,
      { label: 'Editar' },
    ],
  },

  {
    pattern: '/organizacion/departamentos/consultar',
    crumbs: [
      HOME,
      ORGANIZATION,
      { label: 'Departamentos' },
      { label: 'Consultar' },
    ],
  },
  {
    pattern: '/organizacion/departamentos/crear',
    crumbs: [
      HOME,
      ORGANIZATION,
      DEPARTMENTS,
      { label: 'Crear' },
    ],
  },
  {
    pattern: '/organizacion/departamentos/editar/:nombre',
    crumbs: [
      HOME,
      ORGANIZATION,
      DEPARTMENTS,
      { label: 'Editar' },
    ],
  },

  {
    pattern: '/organizacion/secciones/consultar',
    crumbs: [
      HOME,
      ORGANIZATION,
      { label: 'Secciones' },
      { label: 'Consultar' },
    ],
  },
  {
    pattern: '/organizacion/secciones/crear',
    crumbs: [
      HOME,
      ORGANIZATION,
      SECTIONS,
      { label: 'Crear' },
    ],
  },
  {
    pattern: '/organizacion/secciones/editar/:nombre',
    crumbs: [
      HOME,
      ORGANIZATION,
      SECTIONS,
      { label: 'Editar' },
    ],
  },

  {
    pattern: '/organizacion/unidades/consultar',
    crumbs: [
      HOME,
      ORGANIZATION,
      { label: 'Unidades' },
      { label: 'Consultar' },
    ],
  },
  {
    pattern: '/organizacion/unidades/crear',
    crumbs: [
      HOME,
      ORGANIZATION,
      UNITS,
      { label: 'Crear' },
    ],
  },
  {
    pattern: '/organizacion/unidades/editar/:nombre',
    crumbs: [
      HOME,
      ORGANIZATION,
      UNITS,
      { label: 'Editar' },
    ],
  },

  {
    pattern: '/organizacion/plazas/consultar',
    crumbs: [
      HOME,
      ORGANIZATION,
      { label: 'Plazas' },
      { label: 'Consultar' },
    ],
  },
  {
    pattern: '/organizacion/plazas/crear',
    crumbs: [
      HOME,
      ORGANIZATION,
      POSITIONS,
      { label: 'Crear' },
    ],
  },
  {
    pattern: '/organizacion/plazas/editar/:numeroPlaza',
    crumbs: [
      HOME,
      ORGANIZATION,
      POSITIONS,
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

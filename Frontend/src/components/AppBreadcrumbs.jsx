import { Link as RouterLink, matchPath, useLocation } from 'react-router-dom'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import MuiLink from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { COLORS } from '../constants/colors'
import { useMediaQuery } from '../hooks/useMediaQuery'

const HOME = { label: 'Inicio', to: '/home' }
const ORGANIZATION = { label: 'Organización' }

const BREADCRUMB_MAP = [
  {
    pattern: '/home',
    crumbs: [{ label: 'Inicio' }],
  },

  {
    pattern: '/dashboard',
    crumbs: [
      HOME,
      { label: 'Dashboard' },
    ],
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
      { label: 'Usuarios' },
      { label: 'Consultar' },
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
    pattern: '/organizacion/departamentos/consultar',
    crumbs: [
      HOME,
      ORGANIZATION,
      { label: 'Departamentos' },
      { label: 'Consultar' },
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
    pattern: '/organizacion/unidades/consultar',
    crumbs: [
      HOME,
      ORGANIZATION,
      { label: 'Unidades' },
      { label: 'Consultar' },
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
    pattern: '/reportes',
    crumbs: [
      HOME,
      { label: 'Reportes' },
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
        marginBottom: '16px',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '6px 0px',
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

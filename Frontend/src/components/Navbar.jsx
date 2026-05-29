import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiKey, FiLogOut } from 'react-icons/fi'
import { cerrarSesion, obtenerSesion } from '../services/session'
import { COLORS } from '../constants/colors'

const NAV_ITEMS = [
  { label: 'P\u00e1gina Principal', path: '/home', activeOn: '/home' },
  {
    label: 'Usuarios',
    activeOn: '/usuarios',
    submenu: [
      { label: 'Crear usuario', path: '/usuarios/crear' },
      /*{ label: 'Asignar N° de plaza', path: '/usuarios/asignar-plaza' },
      { label: 'Consultar usuario', path: '/usuarios/consultar' },*/
    ],
  },
  {
    label: 'Organización',
    activeOn: '/organizacion',
    submenu: [
      {
        label: 'Áreas',
        path: '/organizacion/areas/consultar',
      },
      {
        label: 'Departamentos',
        path: '/organizacion/departamentos/consultar',
      },
      {
        label: 'Secciones',
        path: '/organizacion/secciones/consultar',
      },
      {
        label: 'Unidades',
        path: '/organizacion/unidades/consultar',
      },
    ],
  },
  /*{
    label: 'Consultas',
    activeOn: '/consultas',
    submenu: [
      { label: 'Diagnostico de carga', path: '/organizacion/consultas/diagnostico' },
      { label: 'Consultas adicionales', path: '/organizacion/consultas/adicionales' },
    ],
  },*/
  /*{
    label: 'Funciones',
    activeOn: '/funciones',
    submenu: [
      { label: 'Crear', path: '/organizacion/funciones/crear' },
      { label: 'Consultar', path: '/organizacion/funciones/consultar' },
      { label: 'Modificar', path: '/organizacion/funciones/modificar' },
      { label: 'Eliminar', path: '/organizacion/funciones/eliminar' },
    ],
  },*/
]

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const sesion = obtenerSesion()
  const [menuOpen, setMenuOpen] = useState(false)
  const [openMenus, setOpenMenus] = useState({})
  const closeTimerRef = useRef(null)
  const profileMenuButtonRef = useRef(null)
  const profileMenuRef = useRef(null)
  const nombreCompleto = [
    sesion?.primerNombre,
    sesion?.segundoNombre,
    sesion?.primerApellido,
    sesion?.segundoApellido,
  ]
    .filter(Boolean)
    .join(' ')

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!menuOpen) return
      const target = event.target
      if (profileMenuButtonRef.current?.contains(target)) return
      if (profileMenuRef.current?.contains(target)) return
      setMenuOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [menuOpen])

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  const scheduleCloseAll = () => {
    clearCloseTimer()
    closeTimerRef.current = setTimeout(() => {
      setOpenMenus({})
    }, 150)
  }

  const isTargetWithinMenu = (target, attribute, menuId) => {
    if (!target || typeof target.closest !== 'function') return false
    return Boolean(target.closest(`[${attribute}="${menuId}"]`))
  }

  const toggleSubmenu = (menuId) => {
    clearCloseTimer()
    setOpenMenus((prev) => {
      if (prev[menuId]) {
        const newState = { ...prev }
        delete newState[menuId]
        return newState
      }
      return { [menuId]: true }
    })
  }

  const handleNavClick = (path) => {
    if (path) {
      clearCloseTimer()
      navigate(path)
      setOpenMenus({})
    }
  }

  const handleMenuButtonKeyDown = (e, menuId, hasSubmenu, isOpen, path) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (hasSubmenu) toggleSubmenu(menuId)
      else handleNavClick(path)
      return
    }
    if (e.key === 'ArrowDown' && hasSubmenu && !isOpen) {
      e.preventDefault()
      toggleSubmenu(menuId)
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      setOpenMenus({})
    }
  }

  const getMenuButtonProps = ({ menuId, hasSubmenu, isOpen, path }) => ({
    type: 'button',
    'aria-haspopup': hasSubmenu ? 'true' : undefined,
    'aria-expanded': hasSubmenu ? isOpen : undefined,
    'aria-controls': hasSubmenu ? `${menuId}-menu` : undefined,
    onClick: (e) => {
      e.preventDefault()
      if (hasSubmenu) toggleSubmenu(menuId)
      else handleNavClick(path)
    },
    onKeyDown: (e) =>
      handleMenuButtonKeyDown(e, menuId, hasSubmenu, isOpen, path),
    onFocus: () => hasSubmenu && !isOpen && toggleSubmenu(menuId),
  })

  const topLevelButtonBaseStyle = {
    fontSize: '13px',
    fontWeight: 600,
    color: COLORS.white,
    border: 'none',
    borderRadius: 0,
    padding: '14px 20px',
    margin: 0,
    cursor: 'pointer',
    transition: 'background-color 0.15s',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    lineHeight: 1,
    whiteSpace: 'nowrap',
    height: '100%',
    width: '100%',
  }

  // Render submenu arrow icon
  const renderArrow = (isOpen, rotation = '180deg') => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{
        transform: isOpen ? `rotate(${rotation})` : 'rotate(0deg)',
        transition: 'transform 0.2s',
      }}
    >
      <path d="M7 10l5 5 5-5z" />
    </svg>
  )

  // Main navbar level item (level 0)
  const renderNavbarItem = (item, menuId, isActive, hasSubmenu, isOpen) => {
    let buttonBgColor = 'transparent'
    if (isOpen) buttonBgColor = COLORS.submenuBg
    if (isActive) buttonBgColor = COLORS.primaryBtn

    return (
      <div
        key={menuId}
        style={{ position: 'relative', display: 'flex', alignItems: 'stretch' }}
        data-menu-root={menuId}
      >
        <button
          {...getMenuButtonProps({ menuId, hasSubmenu, isOpen, path: item.path })}
          style={{
            ...topLevelButtonBaseStyle,
            backgroundColor: buttonBgColor,
          }}
        onMouseEnter={(e) => {
          clearCloseTimer()
          if (hasSubmenu && !isOpen) toggleSubmenu(menuId)
          if (!isActive && !isOpen) e.currentTarget.style.backgroundColor = 'rgba(0,174,239,0.25)'
        }}
        onMouseLeave={(e) => {
          if (hasSubmenu) {
            const isInRoot = isTargetWithinMenu(e.relatedTarget, 'data-menu-root', menuId)
            if (!isInRoot) scheduleCloseAll()
          }
          if (!isActive && !isOpen) e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        {item.label}
        {hasSubmenu && renderArrow(isOpen)}
      </button>

        {hasSubmenu && isOpen && (
          <div
            id={`${menuId}-menu`}
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: COLORS.submenuBg,
              borderRadius: '0 0 6px 6px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              minWidth: '100%',
              zIndex: 100,
              overflow: 'visible',
              marginTop: '-1px',
              padding: '6px 0',
            }}
          >
            {renderMenuItems(item.submenu, 1, menuId)}
          </div>
        )}
      </div>
    )
  }

  // First submenu level item (level 1)
  const renderSubmenuLevel1Item = (item, menuId, rootMenuId) => (
    <div key={menuId} style={{ position: 'relative' }}>
      <button
        {...getMenuButtonProps({
          menuId,
          hasSubmenu: false,
          isOpen: false,
          path: item.path,
        })}
        style={{
          ...topLevelButtonBaseStyle,
          backgroundColor: 'transparent',
        }}
        onMouseEnter={(e) => {
          clearCloseTimer()
          e.currentTarget.style.backgroundColor = COLORS.primaryBtn
        }}
        onMouseLeave={(e) => {
          const isInRoot = isTargetWithinMenu(e.relatedTarget, 'data-menu-root', rootMenuId)
          if (!isInRoot) {
            scheduleCloseAll()
          }
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        <span>{item.label}</span>
      </button>
    </div>
  )

  // Main render function
  const renderMenuItems = (items, level = 0, parentId = '') => {
    return items.map((item, index) => {
      const menuId = `${parentId ? parentId + '-' : ''}${index}`
      const rootMenuId = menuId.split('-')[0]
      const isActive = item.activeOn === location.pathname
      const hasSubmenu = level === 0 && item.submenu && item.submenu.length > 0
      const isOpen = hasSubmenu ? openMenus[menuId] : false

      if (level === 0) {
        return renderNavbarItem(item, menuId, isActive, hasSubmenu, isOpen)
      }

      return renderSubmenuLevel1Item(item, menuId, rootMenuId)
    })
  }

  return (
    <nav
      style={{
        backgroundColor: COLORS.navBg,
        padding: '0 24px',
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 0,
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, alignItems: 'stretch' }}>
        {renderMenuItems(NAV_ITEMS)}
      </div>

      <button
        ref={profileMenuButtonRef}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          padding: 0,
        }}
        onClick={() => setMenuOpen(!menuOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setMenuOpen(!menuOpen)
          }
        }}
        aria-label="User menu"
        aria-haspopup="true"
        aria-expanded={menuOpen}
      >
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.2)',
            border: '2px solid rgba(255,255,255,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={COLORS.white}>
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
          </svg>
        </div>
        <svg width="24" height="24" viewBox="0 0 24 24" fill={COLORS.white}>
          <path d="M7 10l5 5 5-5z" />
        </svg>

        {menuOpen && (
          <div
            ref={profileMenuRef}
            style={{
              position: 'absolute',
              top: '52px',
              right: 0,
              backgroundColor: COLORS.white,
              borderRadius: '6px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              minWidth: '240px',
              zIndex: 100,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '14px 16px',
                borderBottom: '1px solid #eee',
                backgroundColor: COLORS.white,
              }}
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  border: '1px solid rgba(0,0,0,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={COLORS.textDark}>
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              </div>
              <div style={{display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: COLORS.textDark,
                  lineHeight: 1.2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {nombreCompleto || 'Mi Perfil'}
                </span>
                <span style={{
                  fontSize: '12px',
                  color: COLORS.textDark,
                  opacity: 0.8,
                  lineHeight: 1.2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {sesion?.correoInstitucional ?? 'correo no disponible'}
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate('/cambiar-contrasena')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '12px 16px',
                textAlign: 'left',
                border: 'none',
                background: 'none',
                fontSize: '13px',
                color: COLORS.headerBg,
                cursor: 'pointer',
              }}
            >
              <FiKey size={16} />
              <span>Cambiar Contraseña</span>
            </button>
            <button
              onClick={() => { cerrarSesion(); navigate('/') }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '12px 16px',
                textAlign: 'left',
                border: 'none',
                borderTop: '1px solid #fff',
                background: 'none',
                fontSize: '13px',
                color: COLORS.danger,
                cursor: 'pointer',
              }}
            >
              <FiLogOut size={16} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        )}
      </button>
    </nav>
  )
}

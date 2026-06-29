import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiKey, FiLogOut, FiMenu, FiX } from 'react-icons/fi'
import PropTypes from 'prop-types'
import { cerrarSesion, obtenerSesion } from '../services/session'
import { COLORS } from '../constants/colors'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { notifyInfo } from '../utils/notify'

const NAV_ITEMS = [
  {
    label: 'Página Principal',
    path: '/home',
    activeOn: '/home'
  },
  {
    label: 'Declaraciones',
    path: '/declaraciones',
    activeOn: '/declaraciones'
  },
  /*{
    label: 'Consultas',
    activeOn: '/consultas',
    submenu: [
      { label: 'Diagnostico de carga', path: '/organizacion/consultas/diagnostico' },
      { label: 'Consultas adicionales', path: '/organizacion/consultas/adicionales' },
    ],
  },*/
  {
    label: 'Usuarios',
    path: '/usuarios/consultar',
    activeOn: '/usuarios/consultar',
    roles: [1],
  },
  {
    label: 'Plazas',
    path: '/plazas/consultar',
    activeOn: '/plazas/consultar',
    roles: [1],
  },
  {
    label: 'Organización',
    activeOn: '/organizacion',
    roles: [1],
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
  {
    label: 'Puestos de trabajo',
    path: '/puestos-trabajo/consultar',
    activeOn: '/puestos-trabajo/consultar',
    roles: [1],
  },
  {
    label: 'Funciones',
    activeOn: '/funciones',
    submenu: [
      { label: 'Oficiales', path: '/funciones/oficiales/consultar', roles: [1] },
      { label: 'Usuarios', path: '/funciones/usuarios/consultar' },
    ],
  },
]

const filterNavItems = (items, sesion) =>
  items.reduce((filtered, item) => {
    if (
      item.roles &&
      !item.roles.includes(sesion?.rol)
    ) {
      return filtered
    }

    const newItem = {
      ...item,
      submenu: item.submenu
        ? filterNavItems(item.submenu, sesion)
        : undefined,
    }

    if (newItem.submenu?.length === 0) {
      delete newItem.submenu
    }

    filtered.push(newItem)

    return filtered
  }, [])

const buildNombreCompleto = (sesion) =>
  [
    sesion?.primerNombre,
    sesion?.segundoNombre,
    sesion?.primerApellido,
    sesion?.segundoApellido,
  ]
    .filter(Boolean)
    .join(' ')

const getTopLevelButtonBgColor = (isActive, isOpen) => {
  if (isActive) return COLORS.primaryBtn
  if (isOpen) return COLORS.submenuBg
  return 'transparent'
}

const isTargetWithinMenu = (target, attribute, menuId) => {
  if (!target || typeof target.closest !== 'function') return false
  return Boolean(target.closest(`[${attribute}="${menuId}"]`))
}

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

const navItemPropType = PropTypes.shape({
  activeOn: PropTypes.string,
  label: PropTypes.string.isRequired,
  path: PropTypes.string,
  submenu: PropTypes.array,
})

const menuButtonBaseStylePropType = PropTypes.shape({
  padding: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
})

const handleMenuButtonKeyDown = ({
  event,
  handleNavClick,
  hasSubmenu,
  isOpen,
  menuId,
  path,
  setOpenMenus,
  toggleSubmenu,
}) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    if (hasSubmenu) toggleSubmenu(menuId)
    else handleNavClick(path)
    return
  }
  if (event.key === 'ArrowDown' && hasSubmenu && !isOpen) {
    event.preventDefault()
    toggleSubmenu(menuId)
    return
  }
  if (event.key === 'Escape') {
    event.preventDefault()
    setOpenMenus({})
  }
}

const getNavbarMenuButtonProps = ({
  handleNavClick,
  hasSubmenu,
  isMobile,
  isOpen,
  menuId,
  path,
  setOpenMenus,
  toggleSubmenu,
}) => ({
  type: 'button',
  'aria-haspopup': hasSubmenu ? 'true' : undefined,
  'aria-expanded': hasSubmenu ? isOpen : undefined,
  'aria-controls': hasSubmenu ? `${menuId}-menu` : undefined,
  onClick: (e) => {
    e.preventDefault()
    if (hasSubmenu) toggleSubmenu(menuId)
    else handleNavClick(path)
  },
  onKeyDown: (event) =>
    handleMenuButtonKeyDown({
      event,
      handleNavClick,
      hasSubmenu,
      isOpen,
      menuId,
      path,
      setOpenMenus,
      toggleSubmenu,
    }),
  onFocus: () => !isMobile && hasSubmenu && !isOpen && toggleSubmenu(menuId),
})

function NavbarMenu({
  items,
  clearCloseTimer,
  getMenuButtonProps,
  isMobile,
  locationPath,
  openMenus,
  scheduleCloseAll,
  toggleSubmenu,
  topLevelButtonBaseStyle,
}) {
  const renderMenuItems = (items, level = 0, parentId = '') => {
    return items.map((item, index) => {
      const menuId = `${parentId ? parentId + '-' : ''}${index}`
      const rootMenuId = menuId.split('-')[0]
      const isActive = item.activeOn === locationPath
      const hasSubmenu = level === 0 && item.submenu && item.submenu.length > 0
      const isOpen = hasSubmenu ? openMenus[menuId] : false

      if (level === 0) {
        return (
          <NavbarMenuItem
            key={menuId}
            item={item}
            menuId={menuId}
            isActive={isActive}
            hasSubmenu={hasSubmenu}
            isOpen={isOpen}
            isMobile={isMobile}
            topLevelButtonBaseStyle={topLevelButtonBaseStyle}
            getMenuButtonProps={getMenuButtonProps}
            clearCloseTimer={clearCloseTimer}
            scheduleCloseAll={scheduleCloseAll}
            renderMenuItems={renderMenuItems}
            toggleSubmenu={toggleSubmenu}
          />
        )
      }

      return (
        <NavbarSubmenuItem
          key={menuId}
          item={item}
          menuId={menuId}
          rootMenuId={rootMenuId}
          isMobile={isMobile}
          topLevelButtonBaseStyle={topLevelButtonBaseStyle}
          getMenuButtonProps={getMenuButtonProps}
          clearCloseTimer={clearCloseTimer}
          scheduleCloseAll={scheduleCloseAll}
        />
      )
    })
  }

  return renderMenuItems(items)
}

NavbarMenu.propTypes = {
  items: PropTypes.arrayOf(navItemPropType).isRequired,
  clearCloseTimer: PropTypes.func.isRequired,
  getMenuButtonProps: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired,
  locationPath: PropTypes.string.isRequired,
  openMenus: PropTypes.objectOf(PropTypes.bool).isRequired,
  scheduleCloseAll: PropTypes.func.isRequired,
  toggleSubmenu: PropTypes.func.isRequired,
  topLevelButtonBaseStyle: menuButtonBaseStylePropType.isRequired,
}

function NavbarMenuItem({
  item,
  menuId,
  isActive,
  hasSubmenu,
  isOpen,
  isMobile,
  topLevelButtonBaseStyle,
  getMenuButtonProps,
  clearCloseTimer,
  scheduleCloseAll,
  renderMenuItems,
  toggleSubmenu,
}) {
  const buttonBgColor = getTopLevelButtonBgColor(isActive, isOpen)

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'stretch',
        flexDirection: isMobile ? 'column' : 'row',
        width: isMobile ? '100%' : 'auto',
      }}
      data-menu-root={menuId}
    >
      <button
        {...getMenuButtonProps({ menuId, hasSubmenu, isOpen, path: item.path })}
        style={{
          ...topLevelButtonBaseStyle,
          backgroundColor: buttonBgColor,
          borderTop: isMobile ? '1px solid rgba(255,255,255,0.35)' : 'none',
          minHeight: isMobile ? '56px' : 'auto',
        }}
        onMouseEnter={(e) => {
          if (isMobile) return
          clearCloseTimer()
          if (hasSubmenu && !isOpen) toggleSubmenu(menuId)
          if (!isActive && !isOpen) e.currentTarget.style.backgroundColor = 'rgba(0,174,239,0.25)'
        }}
        onMouseLeave={(e) => {
          if (isMobile) return
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
            position: isMobile ? 'static' : 'absolute',
            top: isMobile ? 'auto' : '100%',
            left: isMobile ? 'auto' : '50%',
            transform: isMobile ? 'none' : 'translateX(-50%)',
            backgroundColor: COLORS.submenuBg,
            borderRadius: isMobile ? 0 : '0 0 6px 6px',
            boxShadow: isMobile ? 'none' : '0 4px 16px rgba(0,0,0,0.15)',
            minWidth: isMobile ? 'auto' : '100%',
            width: isMobile ? '100%' : 'auto',
            zIndex: 100,
            overflow: 'visible',
            marginTop: isMobile ? 0 : '-1px',
            padding: '6px 0',
          }}
        >
          {renderMenuItems(item.submenu, 1, menuId)}
        </div>
      )}
    </div>
  )
}

NavbarMenuItem.propTypes = {
  clearCloseTimer: PropTypes.func.isRequired,
  getMenuButtonProps: PropTypes.func.isRequired,
  hasSubmenu: PropTypes.bool.isRequired,
  isActive: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool.isRequired,
  isOpen: PropTypes.bool.isRequired,
  item: navItemPropType.isRequired,
  menuId: PropTypes.string.isRequired,
  renderMenuItems: PropTypes.func.isRequired,
  scheduleCloseAll: PropTypes.func.isRequired,
  toggleSubmenu: PropTypes.func.isRequired,
  topLevelButtonBaseStyle: menuButtonBaseStylePropType.isRequired,
}

function NavbarSubmenuItem({
  item,
  menuId,
  rootMenuId,
  isMobile,
  topLevelButtonBaseStyle,
  getMenuButtonProps,
  clearCloseTimer,
  scheduleCloseAll,
}) {
  return (
    <div style={{ position: 'relative' }}>
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
          justifyContent: 'flex-start',
          padding: isMobile ? '14px 24px' : topLevelButtonBaseStyle.padding,
          minHeight: isMobile ? '48px' : 'auto',
        }}
        onMouseEnter={(e) => {
          if (isMobile) return
          clearCloseTimer()
          e.currentTarget.style.backgroundColor = COLORS.primaryBtn
        }}
        onMouseLeave={(e) => {
          if (isMobile) return
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
}

NavbarSubmenuItem.propTypes = {
  clearCloseTimer: PropTypes.func.isRequired,
  getMenuButtonProps: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired,
  item: navItemPropType.isRequired,
  menuId: PropTypes.string.isRequired,
  rootMenuId: PropTypes.string.isRequired,
  scheduleCloseAll: PropTypes.func.isRequired,
  topLevelButtonBaseStyle: menuButtonBaseStylePropType.isRequired,  
}

function buildToggleMenuState(prev, menuId) {
  if (!prev[menuId]) return { [menuId]: true }
  return Object.fromEntries(Object.entries(prev).filter(([key]) => key !== menuId))
}


function ProfileDropdown({
  isMobile,
  menuOpen,
  onToggle,
  onKeyDown,
  buttonRef,
  dropdownRef,
  nombreCompleto,
  sesion,
  navigate,
}) {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        order: isMobile ? 1 : 0,
        minHeight: isMobile ? '50px' : 'auto',
      }}
    >
      <button
        ref={buttonRef}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          padding: isMobile ? 0 : '0 0 0 12px',
        }}
        onClick={onToggle}
        onKeyDown={onKeyDown}
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
      </button>

      {menuOpen && (
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: isMobile ? '48px' : '52px',
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
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: COLORS.textDark,
                  lineHeight: 1.2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {nombreCompleto || 'Mi Perfil'}
              </span>
              <span
                style={{
                  fontSize: '12px',
                  color: COLORS.textDark,
                  opacity: 0.8,
                  lineHeight: 1.2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
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
            onClick={() => {
              cerrarSesion()
              notifyInfo('Sesión cerrada.')
              navigate('/')
            }}
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
    </div>
  )
}

ProfileDropdown.propTypes = {
  buttonRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }).isRequired,
  dropdownRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }).isRequired,
  isMobile: PropTypes.bool.isRequired,
  menuOpen: PropTypes.bool.isRequired,
  navigate: PropTypes.func.isRequired,
  nombreCompleto: PropTypes.string,
  onKeyDown: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
  sesion: PropTypes.shape({
    correoInstitucional: PropTypes.string,
  }),
}

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const sesion = obtenerSesion()
  const visibleNavItems = filterNavItems(NAV_ITEMS, sesion)
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openMenus, setOpenMenus] = useState({})
  const closeTimerRef = useRef(null)
  const profileMenuButtonRef = useRef(null)
  const profileMenuRef = useRef(null)
  const nombreCompleto = buildNombreCompleto(sesion)

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

  const toggleSubmenu = (menuId) => {
    clearCloseTimer()
    setOpenMenus((prev) => buildToggleMenuState(prev, menuId))
  }

  const handleNavClick = (path) => {
    if (path) {
      clearCloseTimer()
      navigate(path)
      setOpenMenus({})
      setMobileMenuOpen(false)
    }
  }

  const handleMobileMenuToggle = () => {
    clearCloseTimer()
    if (mobileMenuOpen) setOpenMenus({})
    setMobileMenuOpen(!mobileMenuOpen)
    setMenuOpen(false)
  }

  const handleProfileKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setMenuOpen(!menuOpen)
    }
  }

  const getMenuButtonProps = (options) =>
    getNavbarMenuButtonProps({
      ...options,
      handleNavClick,
      isMobile,
      setOpenMenus,
      toggleSubmenu,
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
    justifyContent: isMobile ? 'center' : 'flex-start',
    gap: '6px',
    lineHeight: 1,
    whiteSpace: 'nowrap',
    height: '100%',
    width: '100%',
  }

  return (
    <nav
      style={{
        backgroundColor: COLORS.navBg,
        padding: isMobile ? '0 16px' : '0 24px',
        display: 'flex',
        alignItems: isMobile ? 'center' : 'stretch',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 0,
        minHeight: isMobile ? '50px' : 'auto',
      }}
    >
      {isMobile && (
        <button
          type="button"
          onClick={handleMobileMenuToggle}
          style={{
            width: '40px',
            height: '40px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            borderRadius: '4px',
            background: 'transparent',
            color: COLORS.white,
            cursor: 'pointer',
            order: 0,
          }}
          aria-label={mobileMenuOpen ? 'Cerrar menú principal' : 'Abrir menú principal'}
          aria-controls="main-navigation-menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
        </button>
      )}

      <div
        id="main-navigation-menu"
        style={{
          display: isMobile && !mobileMenuOpen ? 'none' : 'flex',
          flexWrap: isMobile ? 'nowrap' : 'wrap',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 0,
          alignItems: 'stretch',
          order: isMobile ? 2 : 0,
          width: isMobile ? 'calc(100% + 32px)' : 'auto',
          margin: isMobile ? '0 -16px' : 0,
        }}
      >
        <NavbarMenu
          items={visibleNavItems}
          clearCloseTimer={clearCloseTimer}
          getMenuButtonProps={getMenuButtonProps}
          isMobile={isMobile}
          locationPath={location.pathname}
          openMenus={openMenus}
          scheduleCloseAll={scheduleCloseAll}
          toggleSubmenu={toggleSubmenu}
          topLevelButtonBaseStyle={topLevelButtonBaseStyle}
        />
      </div>

      <ProfileDropdown
        isMobile={isMobile}
        menuOpen={menuOpen}
        onToggle={() => setMenuOpen(!menuOpen)}
        onKeyDown={handleProfileKeyDown}
        buttonRef={profileMenuButtonRef}
        dropdownRef={profileMenuRef}
        nombreCompleto={nombreCompleto}
        sesion={sesion}
        navigate={navigate}
      />
    </nav>
  )
}

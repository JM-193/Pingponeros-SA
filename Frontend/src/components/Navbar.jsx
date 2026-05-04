import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const COLORS = {
  navBg: '#1D4F91',
  submenuBg: '#002948',
  navBtn: '#00AEEF',
}

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
        activeOn: '/organizacion/areas',
        submenu: [
          { label: 'Crear', path: '/organizacion/areas/crear' },
          { label: 'Consultar', path: '/organizacion/areas/consultar' },
          { label: 'Modificar', path: '/organizacion/areas/modificar' },
          { label: 'Eliminar', path: '/organizacion/areas/eliminar' },
        ],
      },
      /*{
        label: 'Departamentos',
        activeOn: '/organizacion/departamentos',
        submenu: [
          { label: 'Crear', path: '/organizacion/departamentos/crear' },
          { label: 'Consultar', path: '/organizacion/departamentos/consultar' },
          { label: 'Modificar', path: '/organizacion/departamentos/modificar' },
          { label: 'Eliminar', path: '/organizacion/departamentos/eliminar' },
        ],
      },*/
      /*{
        label: 'Secciones',
        activeOn: '/organizacion/secciones',
        submenu: [
          { label: 'Crear', path: '/organizacion/secciones/crear' },
          { label: 'Consultar', path: '/organizacion/secciones/consultar' },
          { label: 'Modificar', path: '/organizacion/secciones/modificar' },
          { label: 'Eliminar', path: '/organizacion/secciones/eliminar' },
        ],
      },*/
      /*{
        label: 'Unidades',
        activeOn: '/organizacion/unidades',
        submenu: [
          { label: 'Crear', path: '/organizacion/unidades/crear' },
          { label: 'Consultar', path: '/organizacion/unidades/consultar' },
          { label: 'Modificar', path: '/organizacion/unidades/modificar' },
          { label: 'Eliminar', path: '/organizacion/unidades/eliminar' },
        ],
      },*/
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
  const [menuOpen, setMenuOpen] = useState(false)
  const [openMenus, setOpenMenus] = useState({})

  const toggleSubmenu = (menuId) => {
    setOpenMenus((prev) => {
      if (prev[menuId]) {
        // If already open, close it
        const newState = { ...prev }
        delete newState[menuId]
        return newState
      } else {
        // If not open, close only siblings at the same level
        const newState = { ...prev }
        
        // Get the level and parent of the current menu
        const parts = menuId.split('-')
        const currentLevel = parts.length - 1
        
        // If level 2 or higher, keep parents open
        if (currentLevel >= 1) {
          // Build the parent ID
          const parentId = parts.slice(0, -1).join('-')
          
          // Close only siblings at the same parent level
          Object.keys(newState).forEach((key) => {
            const keyParts = key.split('-')
            const keyLevel = keyParts.length - 1
            
            // If it's a sibling (same level and parent), close it
            if (keyLevel === currentLevel) {
              const keyParent = keyParts.slice(0, -1).join('-')
              if (keyParent === parentId) {
                delete newState[key]
              }
            }
          })
          
          // Ensure all parents are open
          for (let i = 0; i < currentLevel; i++) {
            const ancestorId = parts.slice(0, i + 1).join('-')
            newState[ancestorId] = true
          }
        } else {
          // If level 0, close all other level 0
          Object.keys(newState).forEach((key) => {
            const keyParts = key.split('-')
            if (keyParts.length === 1) {
              delete newState[key]
            }
          })
        }
        
        newState[menuId] = true
        return newState
      }
    })
  }

  const handleNavClick = (path) => {
    if (path) {
      navigate(path)
      setOpenMenus({})
    }
  }

  const renderMenuItems = (items, level = 0, parentId = '') => {
    return items.map((item, index) => {
      const menuId = `${parentId ? parentId + '-' : ''}${index}`
      const isActive = item.activeOn === location.pathname
      const hasSubmenu = item.submenu && item.submenu.length > 0
      const isOpen = openMenus[menuId]

      if (level === 0) {
        // Main navbar level
        return (
          <div 
            key={menuId} 
            style={{ position: 'relative' }}
            onMouseEnter={() => {
              if (hasSubmenu) {
                toggleSubmenu(menuId)
              }
            }}
            onMouseLeave={() => {
              if (hasSubmenu) {
                setOpenMenus({})
              }
            }}
          >
            <button
              onClick={(e) => {
                e.preventDefault()
                if (!hasSubmenu) {
                  handleNavClick(item.path)
                }
              }}
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#fff',
                backgroundColor:
                  isActive? COLORS.navBtn : isOpen? COLORS.submenuBg : 'transparent',
                border: isActive || isOpen ? 'none' : '1px solid rgba(255,255,255,0.35)',
                borderRadius: '20px',
                padding: '7px 18px',
                cursor: 'pointer',
                transition: 'background-color 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              onMouseEnter={(e) => {
                if (!isActive && !isOpen) {
                  e.currentTarget.style.backgroundColor = 'rgba(0,174,239,0.25)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive && !isOpen) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
            >
              {item.label}
              {hasSubmenu && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}
                >
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              )}
            </button>

            {hasSubmenu && isOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  backgroundColor: COLORS.submenuBg,
                  borderRadius: '6px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  minWidth: '220px',
                  zIndex: 100,
                  overflow: 'visible',
                  marginTop: '4px',
                }}
              >
                {renderMenuItems(item.submenu, level + 1, menuId)}
              </div>
            )}
          </div>
        )
      } else if (level === 1) {
        // First submenu level
        return (
          <div 
            key={menuId} 
            style={{ position: 'relative' }}
            onMouseEnter={() => {
              if (hasSubmenu) {
                toggleSubmenu(menuId)
              }
            }}
            onMouseLeave={() => {
              if (hasSubmenu) {
                const newState = { ...openMenus }
                delete newState[menuId]
                setOpenMenus(newState)
              }
            }}
          >
            <button
              onClick={(e) => {
                e.preventDefault()
                if (!hasSubmenu) {
                  handleNavClick(item.path)
                }
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                textAlign: 'left',
                border: 'none',
                background: 'none',
                fontSize: '13px',
                color: '#fff',
                cursor: 'pointer',
                borderBottom: '1px solid #eee',
                transition: 'background-color 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.navBtn
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <span>{item.label}</span>
              {hasSubmenu && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  style={{
                    transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}
                >
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              )}
            </button>

            {hasSubmenu && isOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '100%',
                  backgroundColor: COLORS.submenuBg,
                  borderRadius: '6px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  minWidth: '200px',
                  zIndex: 101,
                  overflow: 'visible',
                  marginLeft: '4px',
                }}
              >
                {renderMenuItems(item.submenu, level + 1, menuId)}
              </div>
            )}
          </div>
        )
      } else {
        // Level 2+ submenu (no more nesting)
        return (
          <button
            key={menuId}
            onClick={() => handleNavClick(item.path)}
            style={{
              display: 'block',
              width: '100%',
              padding: '12px 16px',
              textAlign: 'left',
              border: 'none',
              background: 'none',
              fontSize: '13px',
              color: '#fff',
              cursor: 'pointer',
              borderBottom: '1px solid #eee',
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.navBtn
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            {item.label}
          </button>
        )
      }
    })
  }

  return (
    <nav
      style={{
        backgroundColor: COLORS.navBg,
        padding: '8px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {renderMenuItems(NAV_ITEMS)}
      </div>

      <button
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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
          </svg>
        </div>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
          <path d="M7 10l5 5 5-5z" />
        </svg>

        {menuOpen && (
          <div
            style={{
              position: 'absolute',
              top: '42px',
              right: 0,
              backgroundColor: '#fff',
              borderRadius: '6px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              minWidth: '160px',
              zIndex: 100,
              overflow: 'hidden',
            }}
          >
            <button
              style={{
                display: 'block',
                width: '100%',
                padding: '12px 16px',
                textAlign: 'left',
                border: 'none',
                background: 'none',
                fontSize: '13px',
                color: '#333',
                cursor: 'pointer',
              }}
            >
              Mi Perfil
            </button>
            <button
              onClick={() => navigate('/')}
              style={{
                display: 'block',
                width: '100%',
                padding: '12px 16px',
                textAlign: 'left',
                border: 'none',
                borderTop: '1px solid #eee',
                background: 'none',
                fontSize: '13px',
                color: '#d10f0f',
                cursor: 'pointer',
              }}
            >
              Cerrar Sesión
            </button>
          </div>
        )}
      </button>
    </nav>
  )
}

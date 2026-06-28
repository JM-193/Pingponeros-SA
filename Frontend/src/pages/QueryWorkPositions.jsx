import { useState } from 'react'
import { FaListUl } from 'react-icons/fa'
import EntityListPage from '../components/EntityListPage'
import Modal from '../components/Modal'
import WorkPositionFunctionsSection from '../components/WorkPositionFunctionsSection'
import { obtenerPuestos, eliminarPuesto } from '../services/workPositionService'
import { ENTITY_FORMS_AS_MODAL } from '../constants/uiMode'
import { COLORS } from '../constants/colors'
import CreateWorkPositions from './CreateWorkPositions'

export default function QueryWorkPositions() {
  const [functionsModalPuesto, setFunctionsModalPuesto] = useState(null)

  const columns = [
    {
      key: 'nombre',
      label: 'Nombre',
      render: (puesto) => puesto.nombre,
      width: '35%',
    },
    {
      key: 'descripcion',
      label: 'Descripción',
      render: (puesto) => puesto.descripcion,
      width: '65%',
    },
  ]

  const matchesSearch = (puesto, term) => {
    if (!term.trim()) return true
    const lowerTerm = term.toLowerCase()
    return (
      puesto.nombre.toLowerCase().includes(lowerTerm) ||
      puesto.descripcion.toLowerCase().includes(lowerTerm)
    )
  }

  const formProps = ENTITY_FORMS_AS_MODAL
    ? {
        renderCreateModal: ({ isModal, isOpen, onClose, onSuccess }) => (
          <CreateWorkPositions isModal={isModal} isOpen={isOpen} onClose={onClose} onSuccess={onSuccess} />
        ),
      }
    : {
        createPath: '/organizacion/puestos-trabajo/crear',
      }

  const extraRowActions = (puesto) => (
    <button
      type="button"
      onClick={() => setFunctionsModalPuesto(puesto)}
      aria-label={`Gestionar funciones de ${puesto.nombre}`}
      title="Gestionar funciones"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 12px',
        backgroundColor: COLORS.secondaryBtn,
        color: COLORS.white,
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 600,
        gap: '6px',
        transition: 'background-color 0.2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.secondaryBtnHover)}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.secondaryBtn)}
    >
      <FaListUl size={14} aria-hidden="true" focusable="false" />
    </button>
  )

  return (
    <>
      <EntityListPage
        title="Puestos de Trabajo"
        entityLabel="puestos de trabajo"
        fetchItems={obtenerPuestos}
        columns={columns}
        matchesSearch={matchesSearch}
        getRowId={(puesto) => puesto.id}
        searchPlaceholder="Ingrese el nombre o descripción del puesto de trabajo"
        deleteItem={(puesto) => eliminarPuesto(puesto.nombre)}
        deleteConfirmMessage={(puesto) =>
          `¿Está seguro de que desea eliminar el puesto de trabajo "${puesto.nombre}"? Esta acción no se puede deshacer.`
        }
        extraRowActions={extraRowActions}
        {...formProps}
      />

      <Modal
        isOpen={Boolean(functionsModalPuesto)}
        title={functionsModalPuesto ? `Funciones — ${functionsModalPuesto.nombre}` : ''}
        onClose={() => setFunctionsModalPuesto(null)}
        maxWidth="780px"
      >
        {functionsModalPuesto && (
          <WorkPositionFunctionsSection
            puesto={functionsModalPuesto}
            onClose={() => setFunctionsModalPuesto(null)}
          />
        )}
      </Modal>
    </>
  )
}

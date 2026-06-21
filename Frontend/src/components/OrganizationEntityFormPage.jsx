import PropTypes from 'prop-types'
import FormContainer from './FormContainer'
import FormButton from './FormButton'
import PageLayout from './PageLayout'

export default function OrganizationEntityFormPage({
  title,
  subtitle,
  onSubmit,
  onCancel,
  isBusy,
  primaryLabel,
  primaryLoadingLabel,
  extraActions,
  children,
}) {
  return (
    <PageLayout>
      <FormContainer
        onSubmit={onSubmit}
        title={title}
        subtitle={subtitle}
        requiredNote
      >
        {children}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <FormButton
            label="Regresar"
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isBusy}
          />
          {extraActions}
          <FormButton
            label={isBusy ? primaryLoadingLabel : primaryLabel}
            type="submit"
            variant="primary"
            disabled={isBusy}
          />
        </div>
      </FormContainer>
    </PageLayout>
  )
}

OrganizationEntityFormPage.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isBusy: PropTypes.bool,
  primaryLabel: PropTypes.string.isRequired,
  primaryLoadingLabel: PropTypes.string,
  extraActions: PropTypes.node,
  children: PropTypes.node.isRequired,
}

OrganizationEntityFormPage.defaultProps = {
  subtitle: '',
  isBusy: false,
  primaryLoadingLabel: 'Guardando...',
  extraActions: null,
}

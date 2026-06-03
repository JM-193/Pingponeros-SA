import PropTypes from 'prop-types'
import FormContainer from './FormContainer'
import FormButton from './FormButton'
import StatusMessage from './StatusMessage'
import PageLayout from './PageLayout'

export default function OrganizationEntityFormPage({
  title,
  subtitle,
  onSubmit,
  onCancel,
  isBusy,
  successMsg,
  errorMsg,
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

        {successMsg && (
          <StatusMessage
            variant="success"
            message={successMsg}
            style={{ marginBottom: '20px' }}
          />
        )}
        {errorMsg && (
          <StatusMessage
            variant="error"
            message={errorMsg}
            style={{ marginBottom: '20px' }}
          />
        )}

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
  successMsg: PropTypes.string,
  errorMsg: PropTypes.string,
  primaryLabel: PropTypes.string.isRequired,
  primaryLoadingLabel: PropTypes.string,
  extraActions: PropTypes.node,
  children: PropTypes.node.isRequired,
}

OrganizationEntityFormPage.defaultProps = {
  subtitle: '',
  isBusy: false,
  successMsg: '',
  errorMsg: '',
  primaryLoadingLabel: 'Guardando...',
  extraActions: null,
}

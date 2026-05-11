import PropTypes from 'prop-types'
import Header from './Header'
import Footer from './Footer'
import { COLORS } from '../constants/colors'

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: COLORS.bodyBg,
  },
  main: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 16px',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    textAlign: 'center',
  },
}

export default function AuthLayout({ children }) {
  return (
    <div style={styles.page}>
      <Header />
      <main style={styles.main}>
        <div style={styles.card}>{children}</div>
      </main>
      <Footer />
    </div>
  )
}

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
}

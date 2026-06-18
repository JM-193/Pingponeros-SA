import PropTypes from 'prop-types'
import Header from './Header'
import Navbar from './Navbar'
import AppBreadcrumbs from './AppBreadcrumbs'
import Footer from './Footer'
import { COLORS } from '../constants/colors'

export default function PageLayout({ children, mainStyle }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: COLORS.bodyBg,
      }}
    >
      <Header />
      <Navbar />
      <AppBreadcrumbs />
      <main
        style={{
          flex: 1,
          padding: '40px 40px 60px',
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
          ...mainStyle,
        }}
      >
        {children}
      </main>
      <Footer />
    </div>
  )
}

PageLayout.propTypes = {
  children: PropTypes.node.isRequired,
  mainStyle: PropTypes.object,
}

PageLayout.defaultProps = {
  mainStyle: {},
}

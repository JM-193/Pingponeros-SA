import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import AppRouter from './router/index'

export default function App() {
  return (
    <>
      <AppRouter />
      <ToastContainer position="bottom-right" autoClose={4000} newestOnTop pauseOnFocusLoss={false} />
    </>
  )
}

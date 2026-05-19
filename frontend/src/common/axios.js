import axios from 'axios'
import { Notify } from 'quasar'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.msg
      || error.message
      || 'Error de conexión con el servidor'

    if (error.response?.status === 401) {
      Notify.create({
        type: 'warning',
        message: 'Sesión expirada. Por favor inicie sesión nuevamente.',
        position: 'top',
        timeout: 5000
      })
    } else if (error.response?.status >= 500) {
      Notify.create({
        type: 'negative',
        message: `Error del servidor: ${message}`,
        position: 'top',
        timeout: 5000
      })
    } else {
      Notify.create({
        type: 'negative',
        message,
        position: 'top',
        timeout: 4000
      })
    }

    return Promise.reject(error)
  }
)

export default api

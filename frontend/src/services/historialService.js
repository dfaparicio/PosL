import { get } from '@/services/api'

export function obtenerHistorialDiario(fecha) {
  return get(`/historial/diario/${fecha}`)
}

export function obtenerHistorialCompleto(params) {
  return get('/historial/completo', params)
}

export function obtenerDashboardData() {
  return get('/historial/dashboard')
}

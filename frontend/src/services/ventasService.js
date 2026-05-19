import { get, post } from '@/services/api'

export function crearVenta(data) {
  return post('/ventas', data)
}

export function obtenerVentas(params) {
  return get('/ventas', params)
}

export function obtenerVentaPorId(id) {
  return get(`/ventas/${id}`)
}

export function obtenerVentasRecientes() {
  return get('/ventas/recientes')
}

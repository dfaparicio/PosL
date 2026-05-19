import { get, post } from '@/services/api'

export function abrirCaja(data) {
  return post('/caja/abrir', data)
}

export function cerrarCaja(data) {
  return post('/caja/cerrar', data)
}

export function agregarMovimiento(data) {
  return post('/caja/movimiento', data)
}

export function obtenerCajaActual() {
  return get('/caja/actual')
}

export function obtenerHistorialCaja(params) {
  return get('/caja/historial', params)
}

import { computed } from 'vue'
import { useHistorialStore } from '@/store/historialStore'

export function useHistorial() {
  const store = useHistorialStore()

  function filtrarPorFecha(fecha) {
    return store.cargarHistorialDiario(fecha)
  }

  function filtrarPorMetodoPago(metodo) {
    const historial = store.historialDiario
    if (!historial?.ventas) return []
    return historial.ventas.filter(v => v.metodoPago === metodo)
  }

  return {
    historialDiario: computed(() => store.historialDiario),
    dashboardData: computed(() => store.dashboardData),
    timelineCaja: computed(() => store.timelineCaja),
    cargarHistorialDiario: store.cargarHistorialDiario,
    cargarDashboardData: store.cargarDashboardData,
    filtrarPorFecha,
    filtrarPorMetodoPago
  }
}

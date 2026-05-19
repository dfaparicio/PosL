import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  obtenerHistorialDiario,
  obtenerDashboardData
} from '@/services/historialService'

export const useHistorialStore = defineStore('historial', () => {
  const historialDiario = ref(null)
  const dashboardData = ref(null)

  const timelineCaja = computed(() => {
    if (!dashboardData.value?.timeline) return []
    return dashboardData.value.timeline.map(item => ({
      ...item,
      color: item.tipo === 'ingreso' ? 'green' : 'red',
      icon: item.tipo === 'ingreso' ? 'arrow_upward' : 'arrow_downward'
    }))
  })

  async function cargarHistorialDiario(fecha) {
    try {
      const res = await obtenerHistorialDiario(fecha)
      historialDiario.value = res.data
      return res
    } catch {
      historialDiario.value = null
    }
  }

  async function cargarDashboardData() {
    try {
      const res = await obtenerDashboardData()
      dashboardData.value = res.data
      return res
    } catch {
      dashboardData.value = null
    }
  }

  return {
    historialDiario,
    dashboardData,
    timelineCaja,
    cargarHistorialDiario,
    cargarDashboardData
  }
}, {
  persist: true
})

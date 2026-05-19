import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  abrirCaja as abrirCajaApi,
  cerrarCaja as cerrarCajaApi,
  agregarMovimiento as agregarMovimientoApi,
  obtenerCajaActual
} from '@/services/cajaService'
import { getTodayISO } from '@/common/format'

export const useCajaStore = defineStore('caja', () => {
  const cajaActual = ref(null)
  const movimientos = ref([])
  const cajaAbierta = ref(false)
  const fechaApertura = ref(null)
  const loading = ref(false)

  const cajaEsperada = computed(() => {
    if (!cajaActual.value) return 0
    if (cajaActual.value.efectivoEsperado != null) return cajaActual.value.efectivoEsperado
    let total = cajaActual.value.montoInicial || 0
    total += (cajaActual.value.ventasEfectivo || 0)
    movimientos.value.forEach(m => {
      if (m.tipo === 'ingreso') total += m.valor
      else total -= m.valor
    })
    return total
  })

  async function cargarEstadoCaja() {
    loading.value = true
    try {
      const res = await obtenerCajaActual()
      if (res && res.data) {
        cajaActual.value = res.data
        cajaAbierta.value = res.data.abierta === true
        fechaApertura.value = res.data.fechaApertura || null
        movimientos.value = res.data.movimientos || []
      }
    } catch {
      cajaActual.value = null
      cajaAbierta.value = false
      movimientos.value = []
    } finally {
      loading.value = false
    }
  }

  async function abrirCaja(data) {
    const res = await abrirCajaApi(data)
    cajaActual.value = res.data.caja
    cajaAbierta.value = true
    fechaApertura.value = getTodayISO()
    movimientos.value = []
    return res
  }

  async function cerrarCaja(data) {
    const res = await cerrarCajaApi(data)
    cajaAbierta.value = false
    cajaActual.value = res.data.caja
    return res
  }

  async function agregarMovimiento(data) {
    const res = await agregarMovimientoApi(data)
    movimientos.value.unshift(res.data.movimiento)
    cajaActual.value = res.data.caja
    return res
  }

  return {
    cajaActual,
    movimientos,
    cajaAbierta,
    fechaApertura,
    cajaEsperada,
    loading,
    cargarEstadoCaja,
    abrirCaja,
    cerrarCaja,
    agregarMovimiento
  }
}, {
  persist: true
})

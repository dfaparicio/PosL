import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  crearVenta as crearVentaApi,
  obtenerVentas,
  obtenerVentasRecientes
} from '@/services/ventasService'

export const useVentasStore = defineStore('ventas', () => {
  const ventas          = ref([])
  const ventasRecientes = ref([])
  const loading         = ref(false)
  const filtros         = ref({ fechaInicio: null, fechaFin: null, metodoPago: null, busqueda: '' })

  // Solo las ventas de hoy
  const ventasHoy = computed(() => {
    const hoy = new Date().toISOString().split('T')[0]
    return ventas.value.filter(v => v.fecha === hoy)
  })

  // Total dinero vendido hoy
  const totalVentasDia = computed(() =>
    ventasHoy.value.reduce((s, v) => s + (v.total || 0), 0)
  )

  // Totales por método de pago — hoy
  const ventasPorMetodoPagoHoy = computed(() => {
    const res = { efectivo: 0, transferencia: 0, tarjeta: 0 }
    ventasHoy.value.forEach(v => {
      if (res[v.metodoPago] !== undefined) res[v.metodoPago] += v.total || 0
    })
    return res
  })

  // Totales por método de pago — histórico (para estadísticas)
  const ventasPorMetodoPago = computed(() => {
    const res = { efectivo: 0, transferencia: 0, tarjeta: 0 }
    ventas.value.forEach(v => {
      if (res[v.metodoPago] !== undefined) res[v.metodoPago] += v.total || 0
    })
    return res
  })

  // Artículos vendidos hoy
  const productosVendidosHoy = computed(() =>
    ventasHoy.value.reduce((s, v) => s + (v.cantidadTotal || 0), 0)
  )

  // Artículos vendidos histórico (para estadísticas)
  const productosVendidos = computed(() =>
    ventas.value.reduce((s, v) => s + (v.cantidadTotal || 0), 0)
  )

  async function crearVenta(data) {
    // data = { items, metodoPago, observacion }
    const res = await crearVentaApi(data)
    ventas.value.unshift(res.data)
    return res
  }

  async function cargarVentas(params = {}) {
    loading.value = true
    try {
      const res = await obtenerVentas(params)
      ventas.value = res.data || []
    } catch {
      ventas.value = []
    } finally {
      loading.value = false
    }
  }

  async function cargarVentasRecientes() {
    try {
      const res = await obtenerVentasRecientes()
      ventasRecientes.value = res.data || []
    } catch {
      ventasRecientes.value = []
    }
  }

  return {
    ventas,
    ventasHoy,
    ventasRecientes,
    filtros,
    loading,
    totalVentasDia,
    ventasPorMetodoPago,
    ventasPorMetodoPagoHoy,
    productosVendidos,
    productosVendidosHoy,
    crearVenta,
    cargarVentas,
    cargarVentasRecientes
  }
}, { persist: true })

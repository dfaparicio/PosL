import { computed } from 'vue'
import { useVentasStore } from '@/store/ventasStore'

export function useVentas() {
  const store = useVentasStore()

  const resumenVentas = computed(() => ({
    totalVentasDia: store.totalVentasDia,
    ventasPorMetodoPago: store.ventasPorMetodoPago,
    productosVendidos: store.productosVendidos
  }))

  async function crearVenta(data) {
    return store.crearVenta(data)
  }

  async function cargarVentas(params) {
    return store.cargarVentas(params)
  }

  function calcularTotal(precio, cantidad, descuento = 0) {
    return (precio * cantidad) - descuento
  }

  return {
    resumenVentas,
    ventas: computed(() => store.ventas),
    ventasRecientes: computed(() => store.ventasRecientes),
    crearVenta,
    cargarVentas,
    cargarVentasRecientes: store.cargarVentasRecientes,
    calcularTotal
  }
}

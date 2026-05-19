import { computed } from 'vue'
import { useCajaStore } from '@/store/cajaStore'
import { formatCurrency } from '@/common/format'

export function useCaja() {
  const store = useCajaStore()

  const cajaAbierta = computed(() => store.cajaAbierta)
  const cajaEsperada = computed(() => store.cajaEsperada)
  const movimientos = computed(() => store.movimientos)

  async function abrirCaja(data) {
    return store.abrirCaja(data)
  }

  async function cerrarCaja(data) {
    return store.cerrarCaja(data)
  }

  async function agregarMovimiento(data) {
    return store.agregarMovimiento(data)
  }

  function formatearMovimiento(movimiento) {
    return {
      ...movimiento,
      valorFormateado: formatCurrency(movimiento.valor || 0),
      esIngreso: movimiento.tipo === 'ingreso'
    }
  }

  return {
    cajaAbierta,
    cajaEsperada,
    movimientos,
    abrirCaja,
    cerrarCaja,
    agregarMovimiento,
    formatearMovimiento,
    cargarEstadoCaja: store.cargarEstadoCaja
  }
}

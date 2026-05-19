import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCajaStore = defineStore('caja', () => {
  const cajaActual            = ref(null)
  const movimientos           = ref([])       // sesión actual
  const historialMovimientos  = ref([])       // todos los movimientos históricos
  const cajaAbierta           = ref(false)
  const fechaApertura         = ref(null)
  const loading               = ref(false)

  const cajaEsperada = computed(() => {
    if (!cajaActual.value) return 0
    if (cajaActual.value.efectivoEsperado != null) return cajaActual.value.efectivoEsperado
    let total = cajaActual.value.montoInicial || 0
    total += cajaActual.value.ventasEfectivo || 0
    movimientos.value.forEach(m => {
      if (m.tipo === 'ingreso') total += m.valor
      else total -= m.valor
    })
    return total
  })

  /* ─── No-op: datos ya en localStorage via persist ─── */
  function cargarEstadoCaja() {}

  /* ─── Abrir caja ─── */
  async function abrirCaja(data) {
    if (cajaAbierta.value)
      throw new Error('Ya existe una caja abierta. Ciérrela antes de abrir una nueva.')

    const ahora = new Date().toISOString()
    cajaActual.value = {
      montoInicial:        parseFloat(data.montoInicial) || 0,
      observacionApertura: data.observacion || '',
      ventasEfectivo:      0,
      ingresos:            0,
      retiros:             0,
      abierta:             true,
      fechaApertura:       ahora,
      dineroReal:          null,
      diferencia:          null,
      observacionesCierre: null,
      fechaCierre:         null
    }
    cajaAbierta.value  = true
    fechaApertura.value = ahora
    movimientos.value  = []
  }

  /* ─── Cerrar caja ─── */
  async function cerrarCaja(data) {
    if (!cajaAbierta.value || !cajaActual.value)
      throw new Error('No hay una caja abierta para cerrar.')

    const efectivoEsperado =
      cajaActual.value.montoInicial +
      cajaActual.value.ventasEfectivo +
      cajaActual.value.ingresos -
      cajaActual.value.retiros

    const dineroReal = parseFloat(data.dineroReal)
    cajaActual.value.dineroReal          = dineroReal
    cajaActual.value.diferencia          = dineroReal - efectivoEsperado
    cajaActual.value.observacionesCierre = data.observaciones || ''
    cajaActual.value.fechaCierre         = new Date().toISOString()
    cajaActual.value.abierta             = false
    cajaAbierta.value                    = false
  }

  /* ─── Agregar movimiento ─── */
  async function agregarMovimiento(data) {
    if (!cajaAbierta.value || !cajaActual.value)
      throw new Error('No hay una caja abierta. Abra la caja primero.')

    const movimiento = {
      id:          Date.now().toString(36) + Math.random().toString(36).substring(2, 9),
      tipo:        data.tipo,
      valor:       parseFloat(data.valor),
      motivo:      data.motivo,
      observacion: data.observacion || '',
      fecha:       new Date().toISOString()
    }

    movimientos.value.unshift(movimiento)
    historialMovimientos.value.unshift(movimiento)

    if (data.tipo === 'ingreso') cajaActual.value.ingresos += movimiento.valor
    else                        cajaActual.value.retiros  += movimiento.valor
  }

  /* ─── Sumar venta en efectivo a la sesión ─── */
  function agregarVentaEfectivo(monto) {
    if (cajaActual.value && cajaAbierta.value)
      cajaActual.value.ventasEfectivo += monto
  }

  return {
    cajaActual,
    movimientos,
    historialMovimientos,
    cajaAbierta,
    fechaApertura,
    cajaEsperada,
    loading,
    cargarEstadoCaja,
    abrirCaja,
    cerrarCaja,
    agregarMovimiento,
    agregarVentaEfectivo
  }
}, { persist: true })

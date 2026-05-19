import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useVentasStore = defineStore('ventas', () => {
  const ventas  = ref([])
  const loading = ref(false)
  const filtros = ref({ fechaInicio: null, fechaFin: null, metodoPago: null, busqueda: '' })

  /* ─── Hoy ─── */
  const ventasHoy = computed(() => {
    const hoy = new Date().toISOString().split('T')[0]
    return ventas.value.filter(v => v.fecha === hoy)
  })

  /* ─── Últimas (dashboard) ─── */
  const ventasRecientes = computed(() => [...ventas.value].slice(0, 15))

  /* ─── Totales hoy ─── */
  const totalVentasDia = computed(() =>
    ventasHoy.value.reduce((s, v) => s + (v.total || 0), 0)
  )

  const ventasPorMetodoPagoHoy = computed(() => {
    const res = { efectivo: 0, transferencia: 0, tarjeta: 0 }
    ventasHoy.value.forEach(v => {
      if (res[v.metodoPago] !== undefined) res[v.metodoPago] += v.total || 0
    })
    return res
  })

  const productosVendidosHoy = computed(() =>
    ventasHoy.value.reduce((s, v) => s + (v.cantidadTotal || 0), 0)
  )

  /* ─── Totales histórico (estadísticas) ─── */
  const ventasPorMetodoPago = computed(() => {
    const res = { efectivo: 0, transferencia: 0, tarjeta: 0 }
    ventas.value.forEach(v => {
      if (res[v.metodoPago] !== undefined) res[v.metodoPago] += v.total || 0
    })
    return res
  })

  const productosVendidos = computed(() =>
    ventas.value.reduce((s, v) => s + (v.cantidadTotal || 0), 0)
  )

  /* ─── Crear venta (lógica local, sin backend) ─── */
  async function crearVenta(data) {
    const { useCajaStore } = await import('./cajaStore')
    const cajaStore = useCajaStore()

    const { items, metodoPago, observacion } = data

    if (!Array.isArray(items) || items.length === 0)
      throw new Error('Debe incluir al menos un ítem en la venta.')

    if (metodoPago === 'efectivo' && !cajaStore.cajaAbierta)
      throw new Error('Debe abrir la caja antes de registrar ventas en efectivo.')

    const processedItems = items.map(item => {
      const precio    = parseFloat(item.precio)    || 0
      const cantidad  = parseInt(item.cantidad)    || 1
      const descuento = parseFloat(item.descuento) || 0

      if (descuento > precio * cantidad * 0.2)
        throw new Error(`El descuento en "${item.categoria}" supera el 20% del subtotal.`)

      return {
        categoria:   item.categoria,
        referencia:  item.referencia  || '',
        precio,
        cantidad,
        descuento,
        subtotal:    Math.max(0, precio * cantidad - descuento),
        esPromocion: Boolean(item.esPromocion)
      }
    })

    const total         = processedItems.reduce((s, i) => s + i.subtotal, 0)
    const cantidadTotal = processedItems.reduce((s, i) => s + i.cantidad, 0)

    const venta = {
      id:           Date.now().toString(36) + Math.random().toString(36).substring(2, 9),
      fecha:        new Date().toISOString().split('T')[0],
      hora:         new Date().toTimeString().slice(0, 5),
      metodoPago,
      observacion:  observacion || 'N/A',
      items:        processedItems,
      total,
      cantidadTotal,
      esPromocion:  processedItems.some(i => i.esPromocion)
    }

    ventas.value.unshift(venta)

    if (metodoPago === 'efectivo') cajaStore.agregarVentaEfectivo(total)

    return venta
  }

  /* ─── No-ops: datos ya en localStorage via persist ─── */
  function cargarVentas() {}
  function cargarVentasRecientes() {}

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

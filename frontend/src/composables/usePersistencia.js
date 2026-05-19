import { useVentasStore } from '@/store/ventasStore'
import { useCajaStore } from '@/store/cajaStore'
import { useConfiguracionStore } from '@/store/configuracionStore'
import { getTodayISO } from '@/common/format'

export function usePersistencia() {
  function guardarDato(key, value) {
    try {
      const data = JSON.stringify(value)
      localStorage.setItem(`procuentas_${key}`, data)
      return true
    } catch {
      return false
    }
  }

  function obtenerDato(key) {
    try {
      const data = localStorage.getItem(`procuentas_${key}`)
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  }

  function eliminarDato(key) {
    localStorage.removeItem(`procuentas_${key}`)
  }

  function exportarDatos() {
    const ventasStore = useVentasStore()
    const cajaStore = useCajaStore()
    const configStore = useConfiguracionStore()

    const datos = {
      version: '1.0.0',
      fechaExportacion: new Date().toISOString(),
      ventas: ventasStore.ventas,
      cajaActual: cajaStore.cajaActual,
      movimientos: cajaStore.movimientos,
      cajaAbierta: cajaStore.cajaAbierta,
      fechaApertura: cajaStore.fechaApertura,
      configuracion: {
        negocioNombre: configStore.negocioNombre,
        moneda: configStore.moneda,
        alertaStockBajo: configStore.alertaStockBajo,
        stockBajoLimite: configStore.stockBajoLimite,
        porcentajeMaxDescuento: configStore.porcentajeMaxDescuento
      }
    }

    const json = JSON.stringify(datos, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `procuentas_backup_${getTodayISO()}.json`
    a.click()
    URL.revokeObjectURL(url)

    return datos
  }

  function importarDatos(jsonData) {
    try {
      const datos = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData

      if (datos.ventas) {
        const ventasStore = useVentasStore()
        ventasStore.ventas = datos.ventas
      }

      if (datos.movimientos || datos.cajaActual) {
        const cajaStore = useCajaStore()
        if (datos.cajaActual) cajaStore.cajaActual = datos.cajaActual
        if (datos.movimientos) cajaStore.movimientos = datos.movimientos
        if (datos.cajaAbierta !== undefined) cajaStore.cajaAbierta = datos.cajaAbierta
        if (datos.fechaApertura) cajaStore.fechaApertura = datos.fechaApertura
      }

      if (datos.configuracion) {
        const configStore = useConfiguracionStore()
        if (datos.configuracion.negocioNombre) configStore.negocioNombre = datos.configuracion.negocioNombre
        if (datos.configuracion.moneda) configStore.moneda = datos.configuracion.moneda
        if (datos.configuracion.alertaStockBajo !== undefined) configStore.alertaStockBajo = datos.configuracion.alertaStockBajo
        if (datos.configuracion.stockBajoLimite) configStore.stockBajoLimite = datos.configuracion.stockBajoLimite
        if (datos.configuracion.porcentajeMaxDescuento) configStore.porcentajeMaxDescuento = datos.configuracion.porcentajeMaxDescuento
      }

      return { success: true }
    } catch (e) {
      return { success: false, error: e.message }
    }
  }

  function hacerBackup() {
    return exportarDatos()
  }

  return {
    guardarDato,
    obtenerDato,
    eliminarDato,
    exportarDatos,
    importarDatos,
    hacerBackup
  }
}

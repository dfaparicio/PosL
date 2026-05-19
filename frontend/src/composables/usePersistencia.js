import { useVentasStore } from '@/store/ventasStore'
import { useCajaStore } from '@/store/cajaStore'
import { useConfiguracionStore } from '@/store/configuracionStore'
import { getTodayISO } from '@/common/format'

export function usePersistencia() {
  function exportarDatos() {
    const ventasStore = useVentasStore()
    const cajaStore   = useCajaStore()
    const configStore = useConfiguracionStore()

    const datos = {
      version:             '1.1.0',
      fechaExportacion:    new Date().toISOString(),
      ventas:              ventasStore.ventas,
      cajaActual:          cajaStore.cajaActual,
      movimientos:         cajaStore.movimientos,
      historialMovimientos: cajaStore.historialMovimientos,
      cajaAbierta:         cajaStore.cajaAbierta,
      fechaApertura:       cajaStore.fechaApertura,
      configuracion: {
        negocioNombre:          configStore.negocioNombre,
        moneda:                 configStore.moneda,
        alertaStockBajo:        configStore.alertaStockBajo,
        stockBajoLimite:        configStore.stockBajoLimite,
        porcentajeMaxDescuento: configStore.porcentajeMaxDescuento
      }
    }

    const json = JSON.stringify(datos, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
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

      if (datos.cajaActual !== undefined || datos.movimientos || datos.historialMovimientos) {
        const cajaStore = useCajaStore()
        if (datos.cajaActual          !== undefined) cajaStore.cajaActual           = datos.cajaActual
        if (datos.movimientos)                       cajaStore.movimientos           = datos.movimientos
        if (datos.historialMovimientos)              cajaStore.historialMovimientos  = datos.historialMovimientos
        if (datos.cajaAbierta         !== undefined) cajaStore.cajaAbierta           = datos.cajaAbierta
        if (datos.fechaApertura)                     cajaStore.fechaApertura         = datos.fechaApertura
      }

      if (datos.configuracion) {
        const configStore = useConfiguracionStore()
        const c = datos.configuracion
        if (c.negocioNombre)                        configStore.negocioNombre          = c.negocioNombre
        if (c.moneda)                               configStore.moneda                 = c.moneda
        if (c.alertaStockBajo         !== undefined) configStore.alertaStockBajo       = c.alertaStockBajo
        if (c.stockBajoLimite)                      configStore.stockBajoLimite        = c.stockBajoLimite
        if (c.porcentajeMaxDescuento)               configStore.porcentajeMaxDescuento = c.porcentajeMaxDescuento
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
    exportarDatos,
    importarDatos,
    hacerBackup
  }
}

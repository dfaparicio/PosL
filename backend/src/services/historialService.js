import { cajaService } from './cajaService.js';
import { ventasService } from './ventasService.js';

const safeDate = (d) => {
  if (!d) return null;
  const s = String(d).substring(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
};

const obtenerHistorialDiario = async (fecha) => {
  const fechaStr = safeDate(fecha);
  if (!fechaStr) {
    const error = new Error('Formato de fecha inválido. Use YYYY-MM-DD.');
    error.status = 400;
    throw error;
  }

  const [estadoCaja, historialCaja, todasLasVentas] = await Promise.all([
    cajaService.obtenerEstadoCaja(),
    cajaService.obtenerHistorial(),
    ventasService.obtenerTodasLasVentas()
  ]);

  const ventasDelDia       = todasLasVentas.filter(v => safeDate(v.fecha) === fechaStr);
  const movimientosDelDia  = historialCaja
    .filter(e => e.tipo === 'movimiento' && e.movimiento && safeDate(e.movimiento.fecha) === fechaStr)
    .map(e => e.movimiento);

  const totalVentas    = ventasDelDia.reduce((sum, v) => sum + (v.total || 0), 0);
  const efectivo       = ventasDelDia.filter(v => v.metodoPago === 'efectivo').reduce((sum, v) => sum + (v.total || 0), 0);
  const transferencias = ventasDelDia.filter(v => v.metodoPago === 'transferencia').reduce((sum, v) => sum + (v.total || 0), 0);
  const tarjeta        = ventasDelDia.filter(v => v.metodoPago === 'tarjeta').reduce((sum, v) => sum + (v.total || 0), 0);
  const productosVendidos = ventasDelDia.reduce((sum, v) => sum + (v.cantidadTotal || 0), 0);

  return {
    fecha: fechaStr,
    estadoCaja,
    ventas:           [...ventasDelDia].reverse(),
    totalVentas,
    efectivo,
    transferencias,
    tarjeta,
    productosVendidos,
    movimientos:      movimientosDelDia,
    cantidadVentas:   ventasDelDia.length
  };
};

const obtenerHistorialCompleto = async (filtros = {}) => {
  const { fechaDesde, fechaHasta } = filtros;

  const [todasLasVentas, historialCaja] = await Promise.all([
    ventasService.obtenerTodasLasVentas(),
    cajaService.obtenerHistorial()
  ]);

  let movimientosFiltrados = historialCaja
    .filter(e => e.tipo === 'movimiento')
    .map(e => e.movimiento);

  let ventasFiltradas = todasLasVentas.filter(v => safeDate(v.fecha) !== null);

  if (fechaDesde) {
    ventasFiltradas      = ventasFiltradas.filter(v => safeDate(v.fecha) >= fechaDesde);
    movimientosFiltrados = movimientosFiltrados.filter(m => m.fecha && safeDate(m.fecha) >= fechaDesde);
  }
  if (fechaHasta) {
    ventasFiltradas      = ventasFiltradas.filter(v => safeDate(v.fecha) <= fechaHasta);
    movimientosFiltrados = movimientosFiltrados.filter(m => m.fecha && safeDate(m.fecha) <= fechaHasta);
  }

  const ventasPorDia = {};
  ventasFiltradas.forEach(v => {
    const dia = safeDate(v.fecha);
    if (dia) {
      if (!ventasPorDia[dia]) ventasPorDia[dia] = [];
      ventasPorDia[dia].push(v);
    }
  });

  return {
    ventas:       ventasFiltradas,
    movimientos:  movimientosFiltrados,
    ventasPorDia,
    totalVentas:  ventasFiltradas.length
  };
};

const obtenerDashboardData = async () => {
  const [estadoCaja, todasLasVentas, historialCaja] = await Promise.all([
    cajaService.obtenerEstadoCaja(),
    ventasService.obtenerTodasLasVentas(),
    cajaService.obtenerHistorial()
  ]);

  const hoy       = safeDate(new Date().toISOString());
  const ventasHoy = todasLasVentas.filter(v => safeDate(v.fecha) === hoy);

  const ventasTotalesDia  = ventasHoy.reduce((sum, v) => sum + (v.total || 0), 0);
  const efectivo          = ventasHoy.filter(v => v.metodoPago === 'efectivo').reduce((sum, v) => sum + (v.total || 0), 0);
  const transferencias    = ventasHoy.filter(v => v.metodoPago === 'transferencia').reduce((sum, v) => sum + (v.total || 0), 0);
  const tarjeta           = ventasHoy.filter(v => v.metodoPago === 'tarjeta').reduce((sum, v) => sum + (v.total || 0), 0);
  const productosVendidos = ventasHoy.reduce((sum, v) => sum + (v.cantidadTotal || 0), 0);

  const timeline = [];

  if (estadoCaja?.abierta) {
    timeline.push({
      tipo:   'caja_abierta',
      fecha:  estadoCaja.fechaApertura,
      detalle: `Caja abierta con $${(estadoCaja.montoInicial || 0).toFixed(2)}`
    });
  }

  ventasHoy.forEach(v => {
    const descripcion = (v.items || []).map(i => i.categoria).join(', ');
    timeline.push({
      tipo:   'venta',
      fecha:  `${v.fecha}T${v.hora}:00`,
      detalle: `Venta: ${descripcion} ×${v.cantidadTotal} - $${(v.total || 0).toFixed(2)} (${v.metodoPago})`
    });
  });

  historialCaja.forEach(e => {
    if (e.tipo === 'movimiento' && e.movimiento && safeDate(e.movimiento.fecha) === hoy) {
      timeline.push({
        tipo:   'movimiento_caja',
        fecha:  e.movimiento.fecha,
        detalle: `${e.movimiento.tipo === 'ingreso' ? 'Ingreso' : 'Retiro'}: $${(e.movimiento.valor || 0).toFixed(2)} - ${e.movimiento.motivo}`
      });
    }
  });

  timeline.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  return {
    cajaActual:        estadoCaja,
    ventasTotalesDia,
    efectivo,
    transferencias,
    tarjeta,
    productosVendidos,
    cantidadVentasHoy: ventasHoy.length,
    timeline
  };
};

export const historialService = {
  obtenerHistorialDiario,
  obtenerHistorialCompleto,
  obtenerDashboardData
};

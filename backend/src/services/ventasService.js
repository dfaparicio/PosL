import { Venta } from '../models/Venta.js';
import { cajaService } from './cajaService.js';

const crearVenta = async (data) => {
  const { items, metodoPago, observacion } = data;

  if (!Array.isArray(items) || items.length === 0) {
    const error = new Error('Debe incluir al menos un ítem en la venta.');
    error.status = 400;
    throw error;
  }

  if (metodoPago === 'efectivo') {
    const estado = await cajaService.obtenerEstadoCaja();
    if (!estado || !estado.abierta) {
      const error = new Error('Debe abrir la caja antes de registrar ventas en efectivo.');
      error.status = 400;
      throw error;
    }
  }

  const processedItems = items.map((item) => {
    const precio    = parseFloat(item.precio)    || 0;
    const cantidad  = parseInt(item.cantidad)    || 1;
    const descuento = parseFloat(item.descuento) || 0;

    if (descuento > precio * cantidad * 0.2) {
      const error = new Error(`El descuento en "${item.categoria}" supera el 20% del subtotal.`);
      error.status = 400;
      throw error;
    }

    return {
      categoria:   item.categoria,
      referencia:  item.referencia  || '',
      precio,
      cantidad,
      descuento,
      subtotal:    Math.max(0, precio * cantidad - descuento),
      esPromocion: Boolean(item.esPromocion)
    };
  });

  const total         = processedItems.reduce((s, i) => s + i.subtotal, 0);
  const cantidadTotal = processedItems.reduce((s, i) => s + i.cantidad, 0);

  const venta = await Venta.create({
    id:           Date.now().toString(36) + Math.random().toString(36).substring(2, 9),
    fecha:        new Date().toISOString().split('T')[0],
    hora:         new Date().toTimeString().slice(0, 5),
    metodoPago,
    observacion:  observacion || 'N/A',
    items:        processedItems,
    total,
    cantidadTotal,
    esPromocion:  processedItems.some(i => i.esPromocion)
  });

  if (metodoPago === 'efectivo') {
    await cajaService.agregarVentaEfectivo(total);
  }

  return venta.toObject();
};

const obtenerVentas = async (filtros = {}) => {
  const { fecha, metodoPago } = filtros;
  const query = {};
  if (fecha)      query.fecha      = fecha;
  if (metodoPago) query.metodoPago = metodoPago;
  return Venta.find(query).sort({ fecha: -1, hora: -1 }).lean();
};

const obtenerVentaPorId = async (id) => {
  const venta = await Venta.findOne({ id }).lean();
  if (!venta) {
    const error = new Error('Venta no encontrada.');
    error.status = 404;
    throw error;
  }
  return venta;
};

const obtenerVentasRecientes = async () =>
  Venta.find().sort({ createdAt: -1 }).limit(15).lean();

const obtenerTodasLasVentas = async () =>
  Venta.find().sort({ fecha: -1, hora: -1 }).lean();

const resetear = async () => Venta.deleteMany({});

export const ventasService = {
  crearVenta,
  obtenerVentas,
  obtenerVentaPorId,
  obtenerVentasRecientes,
  obtenerTodasLasVentas,
  resetear
};

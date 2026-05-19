import { ventasService } from '../services/ventasService.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

const crearVenta = asyncHandler(async (req, res) => {
  const venta = await ventasService.crearVenta(req.body);
  res.status(201).json({ data: venta });
});

const obtenerVentas = asyncHandler(async (req, res) => {
  const { fecha, metodoPago } = req.query;
  const filtros = {};
  if (fecha)      filtros.fecha      = fecha;
  if (metodoPago) filtros.metodoPago = metodoPago;
  const ventas = await ventasService.obtenerVentas(filtros);
  res.status(200).json({ data: ventas });
});

const obtenerVentaPorId = asyncHandler(async (req, res) => {
  const venta = await ventasService.obtenerVentaPorId(req.params.id);
  res.status(200).json({ data: venta });
});

const obtenerVentasRecientes = asyncHandler(async (req, res) => {
  const ventas = await ventasService.obtenerVentasRecientes();
  res.status(200).json({ data: ventas });
});

export const ventasCtrl = {
  crearVenta,
  obtenerVentas,
  obtenerVentaPorId,
  obtenerVentasRecientes
};

import { historialService } from '../services/historialService.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

const obtenerHistorialDiario = asyncHandler(async (req, res) => {
  const { fecha } = req.params;
  const data = await historialService.obtenerHistorialDiario(fecha);
  res.status(200).json({ data });
});

const obtenerHistorialCompleto = asyncHandler(async (req, res) => {
  const { fechaDesde, fechaHasta } = req.query;
  const filtros = {};
  if (fechaDesde) filtros.fechaDesde = fechaDesde;
  if (fechaHasta) filtros.fechaHasta = fechaHasta;
  const data = await historialService.obtenerHistorialCompleto(filtros);
  res.status(200).json({ data });
});

const obtenerDashboardData = asyncHandler(async (req, res) => {
  const data = await historialService.obtenerDashboardData();
  res.status(200).json({ data });
});

export const historialCtrl = {
  obtenerHistorialDiario,
  obtenerHistorialCompleto,
  obtenerDashboardData
};

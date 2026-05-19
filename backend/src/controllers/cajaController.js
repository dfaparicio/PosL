import { cajaService } from '../services/cajaService.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

const abrirCaja = asyncHandler(async (req, res) => {
  const { montoInicial, observacion } = req.body;
  const resultado = await cajaService.abrirCaja(montoInicial, observacion);
  res.status(201).json({ data: resultado });
});

const cerrarCaja = asyncHandler(async (req, res) => {
  const { dineroReal, observaciones } = req.body;
  const resultado = await cajaService.cerrarCaja(dineroReal, observaciones);
  res.status(200).json({ data: resultado });
});

const agregarMovimiento = asyncHandler(async (req, res) => {
  const { tipo, valor, motivo, observacion } = req.body;
  const resultado = await cajaService.agregarMovimiento(tipo, valor, motivo, observacion);
  res.status(201).json({ data: resultado });
});

const obtenerCajaActual = asyncHandler(async (req, res) => {
  const estado = await cajaService.obtenerEstadoCaja();
  res.status(200).json({ data: estado });
});

const obtenerHistorialCaja = asyncHandler(async (req, res) => {
  const historial = await cajaService.obtenerHistorial();
  res.status(200).json({ data: historial });
});

export const cajaCtrl = {
  abrirCaja,
  cerrarCaja,
  agregarMovimiento,
  obtenerCajaActual,
  obtenerHistorialCaja
};

import { CajaSession } from '../models/CajaSession.js';

const abrirCaja = async (montoInicial, observacion) => {
  const abierta = await CajaSession.findOne({ abierta: true });
  if (abierta) {
    const error = new Error('Ya existe una caja abierta. Ciérrela antes de abrir una nueva.');
    error.status = 400;
    throw error;
  }

  const session = await CajaSession.create({
    montoInicial:        parseFloat(montoInicial) || 0,
    observacionApertura: observacion || '',
    fechaApertura:       new Date().toISOString()
  });

  return {
    caja:   session.toObject(),
    evento: { tipo: 'apertura', montoInicial: session.montoInicial, fecha: session.fechaApertura }
  };
};

const cerrarCaja = async (dineroReal, observaciones) => {
  const session = await CajaSession.findOne({ abierta: true });
  if (!session) {
    const error = new Error('No hay una caja abierta para cerrar.');
    error.status = 400;
    throw error;
  }

  const efectivoEsperado =
    session.montoInicial + session.ventasEfectivo + session.ingresos - session.retiros;
  const diferencia = parseFloat(dineroReal) - efectivoEsperado;

  session.dineroReal          = parseFloat(dineroReal);
  session.diferencia          = diferencia;
  session.observacionesCierre = observaciones || '';
  session.fechaCierre         = new Date().toISOString();
  session.abierta             = false;
  await session.save();

  return {
    caja:   session.toObject(),
    evento: { tipo: 'cierre', diferencia, fecha: session.fechaCierre }
  };
};

const agregarMovimiento = async (tipo, valor, motivo, observacion) => {
  const session = await CajaSession.findOne({ abierta: true });
  if (!session) {
    const error = new Error('No hay una caja abierta. Abra la caja primero.');
    error.status = 400;
    throw error;
  }

  if (tipo !== 'ingreso' && tipo !== 'retiro') {
    const error = new Error('El tipo de movimiento debe ser "ingreso" o "retiro".');
    error.status = 400;
    throw error;
  }

  if (valor <= 0) {
    const error = new Error('El valor del movimiento debe ser positivo.');
    error.status = 400;
    throw error;
  }

  const movimiento = {
    id:          Date.now().toString(36) + Math.random().toString(36).substring(2, 9),
    tipo,
    valor:       parseFloat(valor),
    motivo,
    observacion: observacion || '',
    fecha:       new Date().toISOString()
  };

  session.movimientos.push(movimiento);
  if (tipo === 'ingreso') session.ingresos += movimiento.valor;
  else                    session.retiros  += movimiento.valor;

  await session.save();
  return { movimiento, caja: session.toObject() };
};

const agregarVentaEfectivo = async (monto) => {
  await CajaSession.findOneAndUpdate(
    { abierta: true },
    { $inc: { ventasEfectivo: monto } }
  );
};

const obtenerEstadoCaja = async () => {
  const session = await CajaSession.findOne().sort({ createdAt: -1 }).lean();
  if (!session) return null;

  const efectivoEsperado = session.abierta
    ? session.montoInicial + session.ventasEfectivo + session.ingresos - session.retiros
    : null;

  return { ...session, efectivoEsperado };
};

const obtenerHistorial = async () => {
  const sessions = await CajaSession.find().sort({ createdAt: -1 }).lean();
  const historial = [];
  sessions.forEach(s => {
    historial.push({ tipo: 'apertura', montoInicial: s.montoInicial, observacion: s.observacionApertura, fecha: s.fechaApertura });
    s.movimientos.forEach(m => historial.push({ tipo: 'movimiento', movimiento: m }));
    if (!s.abierta && s.fechaCierre) {
      historial.push({ tipo: 'cierre', dineroReal: s.dineroReal, diferencia: s.diferencia, observaciones: s.observacionesCierre, fecha: s.fechaCierre });
    }
  });
  return historial;
};

const resetear = async () => CajaSession.deleteMany({});

export const cajaService = {
  abrirCaja,
  cerrarCaja,
  agregarMovimiento,
  agregarVentaEfectivo,
  obtenerEstadoCaja,
  obtenerHistorial,
  resetear
};

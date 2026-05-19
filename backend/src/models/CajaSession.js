import { Schema, model } from 'mongoose';

const MovimientoSchema = new Schema({
  id:          { type: String, required: true },
  tipo:        { type: String, enum: ['ingreso', 'retiro'], required: true },
  valor:       { type: Number, required: true },
  motivo:      { type: String, required: true },
  observacion: { type: String, default: '' },
  fecha:       { type: String, required: true }
}, { _id: false });

const CajaSessionSchema = new Schema({
  montoInicial:        { type: Number, required: true, default: 0 },
  observacionApertura: { type: String, default: '' },
  movimientos:         [MovimientoSchema],
  ventasEfectivo:      { type: Number, default: 0 },
  ingresos:            { type: Number, default: 0 },
  retiros:             { type: Number, default: 0 },
  abierta:             { type: Boolean, default: true, index: true },
  fechaApertura:       { type: String, required: true },
  dineroReal:          { type: Number, default: null },
  diferencia:          { type: Number, default: null },
  observacionesCierre: { type: String, default: null },
  fechaCierre:         { type: String, default: null }
}, {
  timestamps: true,
  toJSON:   { virtuals: false },
  toObject: { virtuals: false }
});

export const CajaSession = model('CajaSession', CajaSessionSchema);

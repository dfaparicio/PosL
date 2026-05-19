import { Schema, model } from 'mongoose';

const ItemSchema = new Schema({
  categoria:   { type: String, required: true },
  referencia:  { type: String, default: '' },
  precio:      { type: Number, required: true },
  cantidad:    { type: Number, required: true },
  descuento:   { type: Number, default: 0 },
  subtotal:    { type: Number, required: true },
  esPromocion: { type: Boolean, default: false }
}, { _id: false });

const VentaSchema = new Schema({
  id:            { type: String, required: true, unique: true, index: true },
  fecha:         { type: String, required: true, index: true },
  hora:          { type: String, required: true },
  metodoPago:    { type: String, enum: ['efectivo', 'transferencia', 'tarjeta'], required: true, index: true },
  observacion:   { type: String, default: 'N/A' },
  items:         [ItemSchema],
  total:         { type: Number, required: true },
  cantidadTotal: { type: Number, required: true },
  esPromocion:   { type: Boolean, default: false }
}, {
  timestamps: true,
  toJSON:   { virtuals: false },
  toObject: { virtuals: false }
});

export const Venta = model('Venta', VentaSchema);

import { body } from 'express-validator';

const validateCrearVenta = [
  body('items')
    .isArray({ min: 1 }).withMessage('Debe incluir al menos un ítem en la venta'),

  body('items.*.categoria')
    .notEmpty().withMessage('Cada ítem debe tener categoría')
    .isString().withMessage('La categoría debe ser texto'),

  body('items.*.precio')
    .notEmpty().withMessage('Cada ítem debe tener precio')
    .isNumeric().withMessage('El precio debe ser un número')
    .custom(v => { if (parseFloat(v) <= 0) throw new Error('El precio debe ser positivo'); return true; }),

  body('items.*.cantidad')
    .notEmpty().withMessage('Cada ítem debe tener cantidad')
    .isInt({ min: 1 }).withMessage('La cantidad debe ser un entero positivo'),

  body('items.*.descuento')
    .optional()
    .isNumeric().withMessage('El descuento debe ser un número')
    .custom(v => { if (parseFloat(v) < 0) throw new Error('El descuento no puede ser negativo'); return true; }),

  body('items.*.esPromocion')
    .optional()
    .isBoolean().withMessage('esPromocion debe ser verdadero o falso'),

  body('items.*.referencia')
    .optional()
    .isString(),

  body('metodoPago')
    .notEmpty().withMessage('El método de pago es requerido')
    .isIn(['efectivo', 'transferencia', 'tarjeta']).withMessage('Método inválido'),

  body('observacion')
    .optional()
    .isString()
];

export { validateCrearVenta };

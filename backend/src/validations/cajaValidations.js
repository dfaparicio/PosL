import { body } from 'express-validator';

const validateAbrirCaja = [
  body('montoInicial')
    .notEmpty().withMessage('El monto inicial es requerido')
    .isNumeric().withMessage('El monto inicial debe ser un número')
    .custom((value) => {
      if (parseFloat(value) < 0) {
        throw new Error('El monto inicial no puede ser negativo');
      }
      return true;
    }),
  body('observacion')
    .optional()
    .isString().withMessage('La observación debe ser texto')
];

const validateCerrarCaja = [
  body('dineroReal')
    .notEmpty().withMessage('El dinero real es requerido')
    .isNumeric().withMessage('El dinero real debe ser un número')
    .custom((value) => {
      if (parseFloat(value) < 0) {
        throw new Error('El dinero real no puede ser negativo');
      }
      return true;
    }),
  body('observaciones')
    .optional()
    .isString().withMessage('Las observaciones deben ser texto')
];

const validateMovimiento = [
  body('tipo')
    .notEmpty().withMessage('El tipo de movimiento es requerido')
    .isIn(['ingreso', 'retiro']).withMessage('El tipo debe ser "ingreso" o "retiro"'),
  body('valor')
    .notEmpty().withMessage('El valor es requerido')
    .isNumeric().withMessage('El valor debe ser un número')
    .custom((value) => {
      if (parseFloat(value) <= 0) {
        throw new Error('El valor debe ser positivo');
      }
      return true;
    }),
  body('motivo')
    .notEmpty().withMessage('El motivo es requerido')
    .isString().withMessage('El motivo debe ser texto'),
  body('observacion')
    .optional()
    .isString().withMessage('La observación debe ser texto')
];

export { validateAbrirCaja, validateCerrarCaja, validateMovimiento };

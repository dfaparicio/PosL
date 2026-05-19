import { Router } from 'express';
import { cajaCtrl } from '../controllers/cajaController.js';
import { validateAbrirCaja, validateCerrarCaja, validateMovimiento } from '../validations/cajaValidations.js';
import { validarCampos } from '../middlewares/validateFields.js';

const router = Router();

router.post('/abrir', validateAbrirCaja, validarCampos, cajaCtrl.abrirCaja);
router.post('/cerrar', validateCerrarCaja, validarCampos, cajaCtrl.cerrarCaja);
router.post('/movimiento', validateMovimiento, validarCampos, cajaCtrl.agregarMovimiento);
router.get('/actual', cajaCtrl.obtenerCajaActual);
router.get('/historial', cajaCtrl.obtenerHistorialCaja);

export default router;

import { Router } from 'express';
import { ventasCtrl } from '../controllers/ventasController.js';
import { validateCrearVenta } from '../validations/ventasValidations.js';
import { validarCampos } from '../middlewares/validateFields.js';

const router = Router();

router.post('/', validateCrearVenta, validarCampos, ventasCtrl.crearVenta);
router.get('/recientes', ventasCtrl.obtenerVentasRecientes);
router.get('/', ventasCtrl.obtenerVentas);
router.get('/:id', ventasCtrl.obtenerVentaPorId);

export default router;

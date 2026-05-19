import { Router } from 'express';
import { historialCtrl } from '../controllers/historialController.js';

const router = Router();

router.get('/diario/:fecha', historialCtrl.obtenerHistorialDiario);
router.get('/completo', historialCtrl.obtenerHistorialCompleto);
router.get('/dashboard', historialCtrl.obtenerDashboardData);

export default router;

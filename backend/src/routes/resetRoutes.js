import { Router } from 'express';
import { resetCtrl } from '../controllers/resetController.js';

const router = Router();

router.post('/', resetCtrl.resetearTodo);

export default router;

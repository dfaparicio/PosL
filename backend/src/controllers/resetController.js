import { cajaService } from '../services/cajaService.js';
import { ventasService } from '../services/ventasService.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

const resetearTodo = asyncHandler(async (req, res) => {
  await Promise.all([cajaService.resetear(), ventasService.resetear()]);
  res.status(200).json({ data: { mensaje: 'Sistema reiniciado correctamente' } });
});

export const resetCtrl = { resetearTodo };

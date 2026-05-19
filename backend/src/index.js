import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/database.js';
import cajaRoutes from './routes/cajaRoutes.js';
import ventasRoutes from './routes/ventasRoutes.js';
import historialRoutes from './routes/historialRoutes.js';
import resetRoutes from './routes/resetRoutes.js';

const app = express();

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: false
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    nombre: 'ProCuentas API',
    version: '1.0.0',
    endpoints: { caja: '/api/caja', ventas: '/api/ventas', historial: '/api/historial' }
  });
});

app.use('/api/caja',     cajaRoutes);
app.use('/api/ventas',   ventasRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/reset',    resetRoutes);

app.use((req, res) => {
  res.status(404).json({ msg: 'Ruta no encontrada', errors: [] });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({ msg: err.message || 'Error interno del servidor', errors: [] });
});

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
});

export default app;

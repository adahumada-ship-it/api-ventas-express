import express from 'express';
import ventasRoutes from './routes/ventas.js'
import 'dotenv/config';

const app = express();


// 1. Middleware para procesar req.body
app.use(express.json());

// Servir la página de documentación en la raíz del servidor.
app.use(express.static('public'));

//Montamos las rutas con el prefijo /api/v1/ventas
app.use('/api/v1/ventas', ventasRoutes);


//5. Iniciar Servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(' 🚀 Servidor Express en http://localhost:${PORT}');
});
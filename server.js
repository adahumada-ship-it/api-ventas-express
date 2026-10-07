import express from 'express';
import mysql from 'mysql2/promise';
import 'dotenv/config';

const app = express();

const PORT = 3000;

// 1. Middleware para procesar req.body
app.use(express.json());

// 2. Pool de conexión a MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

// 3. Endpoint GET: consultar consolidado de ventas
app.get('/api/v1/ventas/consolidado', async (req, res) => {
    try {
        const { sucursal, año } = req.query;

        if (!sucursal || !año) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Debe enviar ambos parámetros'
            });
        }

        const [rows] = await pool.query(
            'CALL db_ventas_tech(?, ?)',
            [sucursal, año]
        );

        res.status(200).json({
            status: 'success',
            total_registros: rows[0] ? rows[0].length : 0,
            data: rows[0]
        });

    } catch (error) {
        console.log('Error en GET /ventas/consolidado:', error);

        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Error en MySQL'
        });
    }
});

// 4. Endpoint POST: ingresar nueva venta
app.post('/api/v1/ventas', async (req, res) => {
    try {
        const {
            id_producto,
            id_cliente,
            cantidad,
            fecha_venta
        } = req.body;

        // Validación de datos
        if (!id_producto || !id_cliente || !cantidad || !fecha_venta) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Todos los parámetros son obligatorios'
            });
        }

        // Registrar venta en la base de datos
        await pool.query(
            'CALL db_registrar_venta(?, ?, ?, ?)',
            [
                id_producto,
                id_cliente,
                cantidad,
                fecha_venta
            ]
        );

        // Respuesta exitosa
        res.status(201).json({
            status: 'created',
            message: 'Venta registrada exitosamente',
            datos_registrados: {
                id_producto,
                id_cliente,
                cantidad,
                fecha_venta
            }
        });

    } catch (error) {
        console.log('Error en POST /ventas:', error);

        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Error en MySQL'
        });
    }
});

// 5. Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
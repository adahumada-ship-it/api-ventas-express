import { Router } from "express";
import { pool } from "../db.js";
const router = Router();
//3. Endpoint GET: Consultar consolidado de ventas con parámetro
router.get('/consolidado' , async (req, res) => {
    try{
        const{sucursal, anio} = req.query;
        //Validacion de parametros obligatorios
        if(!sucursal || !anio) {
            return res.status(400).json ({
                error:"Bad Reuqest",
                message:"Debe enviar ambos parametros"
            });
        }
        //Se ejecuta el SP en BD
        const [rows] = await pool.query('CALL db_ventas_tech(?,?)' , [sucursal, anio]);
        //Enviamos la respuesta al cliente
        res.status(200).json({
            status: 'sucess',
            total_registros: rows[0] ? rows[0].length : 0,
            data: rows[0]
        });
    }catch (error) {
        console.log('Error en GET /ventas/consolidado' , error);
        res.status(500).json({error: 'Interal server error' , message: 'Error en MYSQL'});
    }
})
//4. Endpoint POST: Ingresar nueva venta
router.post('/', async (req, res) => {
    try {
        const {id_producto, id_cliente, cantidad, fecha_venta} = req.body;
    //Validación de datos
    if (!id_producto || !id_cliente || !cantidad || !fecha_venta) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Todos los parametros son obligatorios'
        });
    }
    //Inserta datos en la BD
    await pool.query('CALL db_registrar_benta(?,?,?,?)' , {
        id_producto, id_cliente, cantidad, fecha_venta
    });
    //Respuesta 201 Created
    res.status(201).json({
        status: 'created',
        message: 'venta registrada exitosamente',
        datos_registrados: { id_producto, id_cliente, cantidad, fecha_venta}
    });
    } catch (error) {
        console.log('Error en POST /ventas ' , error);
        res.status(500).json({error: 'Interal server error' , message: 'Error al insertar'});
    }
});
router.get('/:id_venta', async (req, res) => {
    const idVenta = Number(req.params.id_venta);
    if (!Number.isInteger(idVenta) || idVenta <= 0) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'El ID de venta debe ser un número entero positivo'
        });
    }
    try {
        const [resultados] = await pool.query('CALL sp_venta_id(?)', [idVenta]);
        const venta = resultados[0] ?? [];
        if (venta.length === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'No se encontró una venta con ese ID'
            });
        }
        return res.status(200).json({
            status: 'success',
            data: venta
        });
    } catch (error) {
        console.error('Error en GET /ventas/:id_venta', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Error al consultar la venta en MySQL'
        });
    }
});
export default router;
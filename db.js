import mysql from 'mysql2/promise';
import 'dotenv/config';

//2. Pool de conexión a MySQL
export const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});
console.log('Pool de conexiones MySQL listo');
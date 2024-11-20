import { createPool } from 'mysql2/promise';
import dotenv from 'dotenv';

// Cargar el archivo .env desde la carpeta /src
dotenv.config({ path: 'src/.env' });

const pool = createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

export default pool;

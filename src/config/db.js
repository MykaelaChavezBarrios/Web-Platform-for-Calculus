import { createPool } from 'mysql2/promise';

const pool = createPool({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: 'clavenueva',
    database: 'calcudb'
});

export default pool;
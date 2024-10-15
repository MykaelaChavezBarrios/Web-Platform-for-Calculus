import { Router } from 'express';

const router = Router();

//ruta de prueba
router.get('/', (req, res) => (
    res.json({ 'message': 'hola' })
));

export default router;


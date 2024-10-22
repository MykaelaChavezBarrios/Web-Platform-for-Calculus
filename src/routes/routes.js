import { Router } from 'express';

const router = Router();

//ruta de inicio de sesión
router.get('/', (req, res) => (
    res.render('login', { layout: 'auth', title: 'Inicio de sesión' })
));

//ruta de inicio
router.get('/inicio', (req, res) => {
    res.render('home', { layout: 'main', title: 'Inicio' });
});


export default router;


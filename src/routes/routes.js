import { Router } from 'express';
import { loginAuth } from '../controllers/authC.js';
const router = Router();

// Ruta para mostrar el formulario de inicio de sesión
router.get('/', (req, res) => {
    res.render('login', { layout: 'auth', title: 'Inicio de sesión' });
});

// Ruta para procesar el inicio de sesión
router.post('/loginAuth', loginAuth);

// Rutas para los dashboards
router.get('/inicio-docente', (req, res) => {
    if (req.session.user && req.session.user.rol === 'docente') {
        res.render('home-P', { layout: 'main-P', title: 'Inicio' });
    } else {
        res.redirect('/'); // Redirige al login si no es docente
    }
});

router.get('/inicio', (req, res) => {
    if (req.session.user && req.session.user.rol === 'estudiante') {
        res.render('home-E', { layout: 'main-E', title: 'Inicio' });
    } else {
        res.redirect('/'); // Redirige al login si no es estudiante
    }
});


export default router;
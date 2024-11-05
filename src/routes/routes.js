import { Router } from 'express';
import { loginAuth } from '../controllers/authC.js';
import { logout } from '../controllers/authC.js';
import { getUserProfile } from '../controllers/userC.js';
import { renderChangePassword, changePassword } from '../controllers/changePassword.js';
const router = Router();

// Ruta para mostrar el formulario de inicio de sesión
router.get('/', (req, res) => {
    res.render('login', { layout: 'auth', title: 'Inicio de sesión' });
});

// Ruta para procesar el inicio de sesión
router.post('/loginAuth', loginAuth);

router.get('/logout', logout);

// Rutas para los dashboards

router.get('/inicio', (req, res) => {
    // Verificar si el usuario tiene una sesión activa
    if (!req.session.user) {
        return res.redirect('/login');
    }

    // Redirige al dashboard correspondiente según el rol
    if (req.session.user && req.session.user.rol === 'estudiante') {
        res.render('home-E', { layout: 'main-E', title: 'Inicio' });
    }

    else if (req.session.user && req.session.user.rol === 'docente') {
        res.render('home-P', { layout: 'main-P', title: 'Inicio' });
    }

    else {
        res.redirect('/'); // Redirige al login si no es docente
    }
});

// Rutas de acceso a Mi Perfil
router.get('/mi-perfil', getUserProfile);


// Rutas de acceso a Cambiar constraseña

router.get('/mi-perfil/cambiar-contrasena', renderChangePassword);
router.post('/mi-perfil/cambiar-contrasena', changePassword);


/*router.get('/mi-perfil/cambiar-contrasena', (req, res) => {
    // Verifica si el usuario tiene una sesión activa
    if (!req.session.user) {
        return res.redirect('/login');
    }

    // Redirige al usuario según su rol
    if (req.session.user.rol === 'estudiante') {
        res.render('password', { layout: 'main-E', title: 'Cambiar Contraseña' });
    } else if (req.session.user.rol === 'docente') {
        res.render('password', { layout: 'main-P', title: 'Cambiar Contraseña' });
    }
});
*/


// Ruta de contenido

router.get('/contenido', (req, res) => {
    res.render('video', { layout: 'main-E', title: 'Contenido' });
});

export default router;
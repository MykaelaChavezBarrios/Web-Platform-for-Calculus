import { Router } from 'express';
import { loginAuth } from '../controllers/authC.js';
import { logout } from '../controllers/authC.js';
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

/*
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
});*/

// Rutas de acceso a Mi Perfil

router.get('/mi-perfil', (req, res) => {
    // Verificar si el usuario tiene una sesión activa
    if (!req.session.user) {
        return res.redirect('/login');
    }

    // Redirige al perfil correspondiente según el rol
    if (req.session.user.rol === 'estudiante') {
        res.render('profile', { layout: 'main-E', title: 'Mi perfil' });
    } else if (req.session.user.rol === 'docente') {
        res.render('profile', { layout: 'main-P', title: 'Mi perfil' });
    }
});


// Rutas de acceso a Cambiar constraseña

router.get('/mi-perfil/cambiar-contrasena', (req, res) => {
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



// Ruta de contenido

router.get('/contenido', (req, res) => {
    res.render('content', { layout: 'main-E', title: 'Contenido' });
});

export default router;
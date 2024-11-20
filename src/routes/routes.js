import { Router } from 'express';
import { loginAuth } from '../controllers/authC.js';
import { logout } from '../controllers/authC.js';
import { getUserProfile } from '../controllers/userC.js';
import { renderChangePassword, changePassword } from '../controllers/changePassword.js';
import { getContenido } from '../controllers/contentC.js';
import { getVideo } from '../controllers/videoC.js';
import { getEjercicio, submitRespuesta } from '../controllers/excerciseC.js';
import { getDesafio, submitRespuestaD } from '../controllers/challengeC.js';

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

// Ruta de contenido

router.get('/contenido', getContenido);

// Ruta video

router.get('/contenido/:temaId//:videoId', getVideo);

// Mostrar el ejercicio
router.get('/contenido/:temaId/ejercicio/:ejercicioId', getEjercicio);

// Mostrar pasos

router.get('/contenido/:temaId/ejercicio/:ejercicioId/paso/:pasoId', getEjercicio);

// Enviar respuesta del ejercicio
router.post('/contenido/:temaId/ejercicio/:ejercicioId/paso/:pasoId/respuesta',
    submitRespuesta
);

// Mostrar el desafio
router.get('/contenido/:temaId/desafio/:desafioId', getDesafio);

// Enviar respuesta del desafio
router.post('/contenido/:temaId/desafio/:desafioId/respuesta',
    submitRespuestaD
);


export default router;
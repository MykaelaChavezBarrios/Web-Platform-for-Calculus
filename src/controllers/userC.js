
import pool from '../config/db.js';

export const getUserProfile = async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    try {
        const [userRows] = await pool.query('SELECT nombres, apellidos, correo, rol FROM USUARIO WHERE id = ?', [req.session.user.id]);

        if (userRows.length > 0) {
            const userData = userRows[0];

            // Obtener las iniciales
            const nombreInicial = userData.nombres.charAt(0).toUpperCase();
            const apellidoInicial = userData.apellidos.charAt(0).toUpperCase();
            const iniciales = `${nombreInicial}${apellidoInicial}`;

            // Determinar el layout basado en el rol
            const layout = req.session.user.rol === 'estudiante' ? 'main-E' : 'main-P';

            res.render('profile', { layout, title: 'Mi perfil', userData, iniciales });
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
        res.redirect('/login');
    }
};

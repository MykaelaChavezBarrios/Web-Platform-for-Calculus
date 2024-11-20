// Controlador para cambio de contraseña
import pool from '../config/db.js';

// Controlador para renderizar la vista de cambio de contraseña
export const renderChangePassword = (req, res) => {
    const layout = req.session.user.rol === 'docente' ? 'main-P' : 'main-E';
    res.render('password', { layout, title: 'Cambiar Contraseña' });
};

// Controlador para manejar el cambio de contraseña
export const changePassword = async (req, res) => {
    const { actualPassword, newPassword, confirmPassword } = req.body;
    const userId = req.session.user.id;
    const userpass = req.session.user.contraseña;
    console.log('Actual password:', actualPassword);
    console.log('DB password:', userpass);

    if (newPassword !== confirmPassword) {
        return res.render('password', {
            layout: req.session.user.rol === 'docente' ? 'main-P' : 'main-E',
            title: 'Cambiar Contraseña',
            error: 'La nueva contraseña y su confirmación no coinciden.'
        });
    }

    try {
        // Verificar la contraseña actual
        const [user] = await pool.query('SELECT contraseña FROM USUARIO WHERE id = ?', [userId]);

        if (user[0].contraseña !== actualPassword) {
            return res.render('password', {
                layout: req.session.user.rol === 'docente' ? 'main-P' : 'main-E',
                title: 'Cambiar Contraseña',
                error: 'La contraseña actual es incorrecta.'
            });
        }

        // Actualizar la contraseña
        await pool.query('UPDATE USUARIO SET contraseña = ? WHERE id = ?', [newPassword, userId]);

        // Redirigir con éxito
        res.redirect('/mi-perfil');
    } catch (error) {
        console.error('Error al cambiar la contraseña:', error);
        res.render('password', {
            layout: req.session.user.rol === 'docente' ? 'main-P' : 'main-E',
            title: 'Cambiar Contraseña',
            error: 'Ocurrió un error. Inténtalo de nuevo.'
        });
    }
};

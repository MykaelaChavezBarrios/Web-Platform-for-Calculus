import pool from '../config/db.js';

// Función para autenticar usuarios
export const loginAuth = async (req, res) => {
    const { email, password, role } = req.body;

    try {
        // Consulta para encontrar al usuario en la base de datos
        const [rows] = await pool.query('SELECT * FROM USUARIO WHERE correo = ? AND rol = ?', [email, role]);

        // Verificar si se encontró un usuario
        if (rows.length > 0) {
            const user = rows[0];

            // Comparar la contraseña (sin hash, solo para este caso)
            if (user.contraseña === password) {
                // Guardar información del usuario en la sesión
                req.session.user = {
                    id: user.id,
                    nombre: user.nombres,
                    rol: user.rol
                };

                // Redirigir según el rol del usuario
                if (user.rol === 'estudiante') {
                    res.redirect('/inicio');
                } else if (user.rol === 'docente') {
                    res.redirect('/inicio-docente');
                }
            } else {
                // Contraseña incorrecta, recargar la página de login con un mensaje de error
                res.render('login', {
                    layout: 'auth',
                    error: 'Contraseña incorrecta',
                    email: email, // Mantener el email en el campo
                    role: role // Mantener el rol seleccionado
                });
            }
        } else {
            // Usuario no encontrado, recargar la página de login con un mensaje de error
            res.render('login', {
                layout: 'auth',
                error: 'Usuario no encontrado',
                email: email, // Mantener el email en el campo
                role: role // Mantener el rol seleccionado
            });
        }
    } catch (error) {
        console.error('Error en la autenticación:', error);
        res.render('login', {
            layout: 'auth',
            error: 'Ocurrió un error, intenta nuevamente.'
        });
    }
};

import pool from '../config/db.js';

export const getContenido = async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }

    try {
        const userId = req.session.user.id;
        const layout = req.session.user.rol === 'estudiante' ? 'main-E' : 'main-P';

        // Obtener los temas
        const [temas] = await pool.query(
            `SELECT T.id, T.titulo,
                PE.progreso AS tema_progreso,
                PE.nota_total AS tema_nota
            FROM TEMA AS T
            LEFT JOIN PROGRESO_ESTUDIANTE AS PE ON PE.id_tema = T.id AND PE.id_estudiante = ?
            ORDER BY T.id`,
            [userId]
        );

        // Obtener los videos asociados a cada tema
        const [videos] = await pool.query(
            `SELECT V.id, V.titulo, V.id_tema,
                IF(VV.visto = 1, 100, 0) AS progreso,
                IF(VV.visto = 1, 20, 0) AS nota,
                COALESCE(VV.intentos, 0) AS intentos
            FROM VIDEO AS V
            LEFT JOIN (
                SELECT id_video AS id_recurso, COUNT(*) AS intentos, 1 AS visto
                FROM VIDEO_VISTO
                WHERE id_estudiante = ?
                GROUP BY id_video
            ) AS VV ON VV.id_recurso = V.id
            ORDER BY V.id_tema, V.id`,
            [userId]
        );

        // Obtener los ejercicios asociados a cada tema
        const [ejercicios] = await pool.query(
            `SELECT 
        E.id, 
        E.titulo, 
        E.id_tema, 
        E.tipo,
        LEAST(100, (COALESCE(EP.pasos_correctos, 0) / (SELECT COUNT(*) FROM PASO WHERE id_ejercicio = E.id)) * 100) AS progreso,
        LEAST(20, (COALESCE(EP.pasos_correctos, 0) * 20) / (SELECT COUNT(*) FROM PASO WHERE id_ejercicio = E.id)) AS nota,
        COALESCE(IE.intentos, 0) AS intentos
    FROM 
        EJERCICIO AS E
    LEFT JOIN (
        SELECT 
            id_ejercicio AS id_recurso, 
            COUNT(*) AS intentos, 
            MAX(nota) AS nota
        FROM 
            INTENTO_EJERCICIO
        WHERE 
            id_estudiante = ?
        GROUP BY 
            id_ejercicio
    ) AS IE ON IE.id_recurso = E.id
    LEFT JOIN (
        SELECT 
            P.id_ejercicio AS id_recurso, 
            COUNT(*) AS pasos_correctos
        FROM 
            ERROR_PASO EP
        JOIN 
            PASO P ON P.id = EP.id_paso
        JOIN 
            ALTERNATIVA A ON A.id = EP.id_alternativa
        WHERE 
            A.correcta = 1 AND EP.id_intento IN (SELECT id FROM INTENTO_EJERCICIO WHERE id_estudiante = ?)
        GROUP BY 
            P.id_ejercicio
    ) AS EP ON EP.id_recurso = E.id
    ORDER BY 
        E.id_tema, E.id;`,
            [userId, userId]
        );

        // Organizar los recursos de videos y ejercicios por temas
        const recursosPorTema = temas.map(tema => {
            const recursos = [
                ...videos.filter(video => video.id_tema === tema.id),
                ...ejercicios.filter(ejercicio => ejercicio.id_tema === tema.id)
            ];
            return { ...tema, recursos };
        });

        res.render('content', {
            layout,
            title: 'Contenido',
            temas: recursosPorTema
        });
    } catch (error) {
        console.error('Error al obtener el contenido:', error);
        res.redirect('/');
    }
};

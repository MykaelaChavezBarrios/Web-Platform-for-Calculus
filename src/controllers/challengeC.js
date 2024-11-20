import pool from '../config/db.js';

export const getDesafio = async (req, res) => {
    const { temaId, desafioId } = req.params;

    console.log('Obteniendo desafio:', { temaId, desafioId });

    try {
        // Obtener el ejercicio
        const [ejercicioRows] = await pool.query(
            'SELECT id, titulo, descripcion FROM EJERCICIO WHERE id_tema = ? AND id = ?',
            [temaId, desafioId]
        );

        if (ejercicioRows.length > 0) {
            const ejercicio = ejercicioRows[0];

            // Obtener las alternativas para el paso actual
            const [alternativasRows] = await pool.query(
                'SELECT id, alternativa FROM ALTERNATIVA_DESAFIO WHERE id_ejercicio = ?',
                [desafioId]
            );
            res.render('challenge', {
                title: ejercicio.titulo,
                ejercicio,
                descripcion: ejercicio.descripcion,
                alternativas: alternativasRows,
                temaId,
                estudianteId: req.session.user?.id,
            });

        } else {
            res.status(404).send('Ejercicio no encontrado');
        }
    } catch (error) {
        console.error('Error al obtener el ejercicio:', error);
        res.status(500).send('Error en el servidor');
    }
};



export const submitRespuestaD = async (req, res) => {
    console.log('Datos enviados:', req.body);

    const { temaId, desafioId, alternativaId } = req.body;
    const estudianteId = req.session.user.id;

    if (!temaId || !desafioId || !alternativaId || !estudianteId) {
        console.error('Faltan parámetros:', { temaId, desafioId, alternativaId, estudianteId });
        return res.status(400).send('Faltan parámetros necesarios.');
    }

    try {
        // Validar si la alternativa es correcta
        const [alternativaRows] = await pool.query(
            'SELECT id, alternativa, es_correcta FROM ALTERNATIVA_DESAFIO WHERE id = ?',
            [alternativaId]
        );

        if (alternativaRows.length === 0) {
            return res.status(404).send('Alternativa no encontrada');
        }

        const esCorrecta = alternativaRows[0].es_correcta;

        // Obtener la descripción de la alternativa correcta
        const [correctaRows] = await pool.query(
            'SELECT alternativa FROM ALTERNATIVA_DESAFIO WHERE id_ejercicio = ? AND es_correcta = 1',
            [desafioId]
        );

        const alternativaCorrecta = correctaRows.length > 0 ? correctaRows[0].alternativa : 'Alternativa no definida';

        // Obtener las descripciones del ejercicio
        const [ejercicioRows] = await pool.query(
            'SELECT descripcion FROM EJERCICIO WHERE id = ?',
            [desafioId]
        );

        const ejercicioDescripcion = ejercicioRows.length > 0 ? ejercicioRows[0].descripcion : 'Descripción no disponible';

        // Obtener el video de retroalimentación
        const [videoRows] = await pool.query(
            'SELECT url FROM VIDEO_DESAFIO WHERE id_ejercicio = ?',
            [desafioId]
        );

        const feedbackVideo = videoRows.length > 0 ? videoRows[0].url : null;

        // Registrar el intento en INTENTO_EJERCICIO
        const nota = esCorrecta ? 20 : 0;
        const [insertIntento] = await pool.query(
            `INSERT INTO INTENTO_EJERCICIO (id_estudiante, id_ejercicio, nota, tipo) 
             VALUES (?, ?, ?, ?)`,
            [estudianteId, desafioId, nota, 'desafio']
        );

        const intentoId = insertIntento.insertId;

        // Registrar el error en ERROR_DESAFIO
        await pool.query(
            `INSERT INTO ERROR_DESAFIO (id_intento, id_ejercicio, id_alternativa, es_correcta) 
             VALUES (?, ?, ?, ?)`,
            [intentoId, desafioId, alternativaId, esCorrecta]
        );

        // Actualizar la nota más alta en NOTA_EJERCICIO
        await pool.query(
            `INSERT INTO NOTA_EJERCICIO (id_estudiante, id_ejercicio, nota) 
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE nota = GREATEST(nota, ?)`,
            [estudianteId, desafioId, nota, nota]
        );

        // Renderizar la página con el feedback
        return res.render('challenge', {
            title: 'Desafío Completado',
            temaId,
            ejercicio: { id: desafioId },
            descripcion: ejercicioDescripcion,
            feedback: {
                correcto: esCorrecta,
                mensaje: esCorrecta
                    ? '¡Correcto! Buen trabajo.'
                    : `Respuesta incorrecta, revisa este video para ver el paso a paso:`,
                video: feedbackVideo,
                alternativaCorrecta,
            },
        });
    } catch (error) {
        console.error('Error al procesar la respuesta:', error);
        res.status(500).send('Error en el servidor.');
    }
};


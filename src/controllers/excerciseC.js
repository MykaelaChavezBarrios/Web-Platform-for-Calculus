import pool from '../config/db.js';

export const getEjercicio = async (req, res) => {
    const { temaId, ejercicioId, pasoId } = req.params;

    console.log('Obteniendo desafio:', { temaId, ejercicioId, pasoId });

    try {
        // Obtener el ejercicio
        const [ejercicioRows] = await pool.query(
            'SELECT id, titulo, descripcion FROM EJERCICIO WHERE id_tema = ? AND id = ?',
            [temaId, ejercicioId]
        );

        if (ejercicioRows.length > 0) {
            const ejercicio = ejercicioRows[0];

            // Construir el pasoId dinámico si no está presente
            const pasoIdQuery = pasoId || `${temaId}${ejercicioId}1`; // Paso inicial
            console.log('Paso a obtener:', pasoIdQuery);

            // Obtener el paso actual
            const [pasoRows] = await pool.query(
                'SELECT id, descripcion FROM PASO WHERE id = ?',
                [pasoIdQuery]
            );

            if (pasoRows.length > 0) {
                const paso = pasoRows[0];

                // Obtener las alternativas para el paso actual
                const [alternativasRows] = await pool.query(
                    'SELECT id, descripcion FROM ALTERNATIVA WHERE id_paso = ?',
                    [paso.id]
                );

                // Obtener el siguiente paso, si existe
                const [siguientePasoRows] = await pool.query(
                    'SELECT id FROM PASO WHERE id > ? AND id_ejercicio = ? ORDER BY id LIMIT 1',
                    [pasoIdQuery, ejercicioId]
                );

                const siguientePaso = siguientePasoRows.length > 0 ? siguientePasoRows[0] : null;

                res.render('excercise', {
                    title: ejercicio.titulo,
                    ejercicio,
                    descripcion: ejercicio.descripcion,
                    paso,
                    alternativas: alternativasRows,
                    pasoId: paso.id,
                    temaId,
                    estudianteId: req.session.user?.id,
                    siguientePaso  // Pasar el siguiente paso para el botón
                });
            } else {
                res.status(404).send('Paso no encontrado');
            }
        } else {
            res.status(404).send('Ejercicio no encontrado');
        }
    } catch (error) {
        console.error('Error al obtener el ejercicio:', error);
        res.status(500).send('Error en el servidor');
    }
};












export const submitRespuesta = async (req, res) => {
    console.log('Datos enviados:', req.body);

    const { temaId, ejercicioId, pasoId, alternativaId } = req.body;
    const estudianteId = req.session.user.id; // Usar el ID del estudiante desde la sesión

    if (!temaId || !ejercicioId || !pasoId || !alternativaId || !estudianteId) {
        console.error('Faltan parámetros:', { temaId, ejercicioId, pasoId, alternativaId, estudianteId });
        return res.status(400).send('Faltan parámetros necesarios.');
    }

    try {
        // Validar si la alternativa es correcta
        const [alternativaRows] = await pool.query(
            'SELECT id, descripcion, correcta FROM ALTERNATIVA WHERE id = ?',
            [alternativaId]
        );

        if (alternativaRows.length === 0) {
            return res.status(404).send('Alternativa no encontrada');
        }

        const esCorrecta = alternativaRows[0].correcta;

        // Obtener la descripción de la alternativa correcta
        const [correctaRows] = await pool.query(
            'SELECT descripcion FROM ALTERNATIVA WHERE id_paso = ? AND correcta = 1',
            [pasoId]
        );

        const alternativaCorrecta = correctaRows.length > 0 ? correctaRows[0].descripcion : 'Alternativa no definida';

        // Obtener las descripciones del ejercicio y del paso
        const [ejercicioRows] = await pool.query(
            'SELECT descripcion FROM EJERCICIO WHERE id = ?',
            [ejercicioId]
        );

        const ejercicioDescripcion = ejercicioRows.length > 0 ? ejercicioRows[0].descripcion : 'Descripción no disponible';

        const [pasoRows] = await pool.query(
            'SELECT descripcion FROM PASO WHERE id = ?',
            [pasoId]
        );

        const pasoDescripcion = pasoRows.length > 0 ? pasoRows[0].descripcion : 'Descripción no disponible';

        // Registrar el progreso del estudiante en el paso
        await pool.query(
            `INSERT INTO ERROR_PASO (id_intento, id_paso, id_alternativa) 
             VALUES (NULL, ?, ?)`,
            [pasoId, alternativaId]
        );

        // Calcular el progreso del estudiante en el ejercicio
        const [pasosTotales] = await pool.query(
            'SELECT COUNT(*) AS total FROM PASO WHERE id_ejercicio = ?',
            [ejercicioId]
        );

        const [pasosCompletados] = await pool.query(
            `SELECT COUNT(DISTINCT id_paso) AS completados 
             FROM ERROR_PASO 
             WHERE id_paso IN (SELECT id FROM PASO WHERE id_ejercicio = ?)`,
            [ejercicioId]
        );

        const progreso = Math.min(
            100,
            (pasosCompletados[0]?.completados / pasosTotales[0]?.total) * 100
        );


        // Si el progreso es 100%, registrar el intento completo
        if (progreso === 100) {
            // Calcular la nota promedio basada en las respuestas correctas
            const [notaPromedioRows] = await pool.query(
                `SELECT AVG(A.correcta * 20) AS nota_promedio
                 FROM ERROR_PASO EP
                 JOIN ALTERNATIVA A ON EP.id_alternativa = A.id
                 WHERE EP.id_paso IN (SELECT id FROM PASO WHERE id_ejercicio = ?)`,
                [ejercicioId]
            );

            const notaPromedio = notaPromedioRows[0]?.nota_promedio || 0;

            // Registrar el intento en INTENTO_EJERCICIO
            await pool.query(
                `INSERT INTO INTENTO_EJERCICIO (id_estudiante, id_ejercicio, nota, tipo) 
                 VALUES (?, ?, ?, ?)`,
                [estudianteId, ejercicioId, notaPromedio, 'ejercicio']
            );

            // Actualizar la nota final del ejercicio en NOTA_EJERCICIO
            await pool.query(
                `INSERT INTO NOTA_EJERCICIO (id_estudiante, id_ejercicio, nota)
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE nota = ?`,
                [estudianteId, ejercicioId, notaPromedio, notaPromedio]
            );
        }



        // Obtener el video de retroalimentación
        const [videoRows] = await pool.query(
            'SELECT url FROM VIDEO_PASO WHERE id_paso = ?',
            [pasoId]
        );

        const feedbackVideo = videoRows.length > 0 ? videoRows[0].url : null;

        // Obtener el texto de retroalimentación
        const [textoRows] = await pool.query(
            'SELECT mensaje FROM VIDEO_PASO WHERE id_paso = ?',
            [pasoId]
        );

        const textoFeedback = textoRows.length > 0 ? textoRows[0].mensaje : null;

        // Obtener el siguiente paso, si existe
        const [siguientePasoRows] = await pool.query(
            'SELECT id FROM PASO WHERE id > ? AND id_ejercicio = ? ORDER BY id LIMIT 1',
            [pasoId, ejercicioId]
        );

        const siguientePaso = siguientePasoRows.length > 0 ? siguientePasoRows[0] : null;

        if (siguientePaso) {
            // Si hay siguiente paso, redirigir al siguiente paso
            return res.render('excercise', {
                title: 'Ejercicio ' + ejercicioId,
                temaId,
                feedback: {
                    correcto: esCorrecta,
                    mensaje: esCorrecta
                        ? '¡Correcto! Buen trabajo. La respuesta es:'
                        : `Respuesta incorrecta, revisa esta retroalimentación:`,
                    video: feedbackVideo,
                    texto: textoFeedback,
                    alternativaCorrecta
                },
                ejercicio: { id: ejercicioId },
                paso: { id: pasoId, descripcion: pasoDescripcion },
                descripcion: ejercicioDescripcion,
                siguientePaso
            });
        } else {
            // Si no hay siguiente paso, marcar el ejercicio como completado
            return res.render('excercise', {
                title: 'Ejercicio Completado',
                mensaje: '¡Has completado todos los pasos del ejercicio!',
                temaId,
                ejercicio: { id: ejercicioId },
                paso: { id: pasoId, descripcion: pasoDescripcion },
                descripcion: ejercicioDescripcion,
                feedback: {
                    correcto: esCorrecta,
                    mensaje: esCorrecta
                        ? '¡Correcto! Buen trabajo.'
                        : `Respuesta incorrecta, revisa esta retroalimentación:`,
                    video: feedbackVideo,
                    texto: textoFeedback,
                    alternativaCorrecta
                }
            });
        }
    } catch (error) {
        console.error('Error al procesar la respuesta:', error);
        res.status(500).send('Error en el servidor');
    }
};


import pool from '../config/db.js';

// Controlador para mostrar el video
export const getVideo = async (req, res) => {
    const { temaId, videoId } = req.params;

    try {
        // Consulta para obtener el video del tema
        const [videoRows] = await pool.query(
            'SELECT titulo, url FROM VIDEO WHERE id_tema = ? AND id = ?',
            [temaId, videoId]
        );

        if (videoRows.length > 0) {
            const video = videoRows[0]; // Tomar el primer resultado

            // Renderizar la vista con los datos del video
            res.render('video', {
                title: video.titulo,
                video: video
            });
        } else {
            res.status(404).send('Video no encontrado');
        }
    } catch (error) {
        console.error('Error al obtener el video:', error);
        res.status(500).send('Error en el servidor');
    }
};

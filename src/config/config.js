import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { engine } from 'express-handlebars';

const config = (app) => {
    const __dirname = dirname(fileURLToPath(import.meta.url));

    // Configuración del puerto
    app.set('port', process.env.PORT || 4000);

    // Configuración de la vista
    app.set('views', join(__dirname, '../views'));

    // Configuración del motor de plantillas Handlebars
    app.engine('.hbs', engine({
        defaultLayout: 'main',
        layoutsDir: join(app.get('views'), 'layouts'),
        partialsDir: join(app.get('views'), 'partials'),
        extname: '.hbs'
    }));

    // Establecer el motor de plantillas a Handlebars
    app.set('view engine', '.hbs');
};

export default config;

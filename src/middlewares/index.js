/*import morgan from 'morgan';
import express from 'express';

const set_middlewares = (app) => {
    // Morgan middleware
    app.use(morgan('dev'));

    // Middleware para parsear cuerpos de URL y JSON
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
};

export default set_middlewares;*/

import morgan from 'morgan';
import express from 'express';
import session from 'express-session';

const set_middlewares = (app) => {
    // Morgan middleware (logging de peticiones HTTP)
    app.use(morgan('dev'));

    // Middleware para parsear cuerpos de URL y JSON
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());

    // Middleware para manejar sesiones
    app.use(session({
        secret: 'your_secret_key',  // Cambia 'your_secret_key' por algo seguro
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }  // Cambia a true si usas HTTPS
    }));

    // Middleware para servir archivos estáticos
    app.use(express.static('public'));
};

export default set_middlewares;

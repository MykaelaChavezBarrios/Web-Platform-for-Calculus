import morgan from 'morgan';
import express from 'express';

const set_middlewares = (app) => {
    // Morgan middleware
    app.use(morgan('dev'));

    // Middleware para parsear cuerpos de URL y JSON
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
};

export default set_middlewares;
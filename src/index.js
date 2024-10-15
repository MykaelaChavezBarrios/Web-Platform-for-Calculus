import express from 'express'
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/routes.js';
import set_middlewares from './middlewares/index.js';
import config from './config/config.js';

// Initialization

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));


// Settings

config(app)

// Middlewares

set_middlewares(app)

// Routes

app.get('/', routes);

// Public files

app.use(express.static(join(__dirname, 'public')));

// Run server

app.listen(app.get('port'), () =>
    console.log('Server listening on port', app.get('port'), '\nhttp://localhost:4000/'));
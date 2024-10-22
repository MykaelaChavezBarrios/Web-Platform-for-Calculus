-- Base de datos para el proyecto de aprendizaje de cálculo
CREATE DATABASE IF NOT EXISTS CalcuDB;
USE CalcuDB;

-- Tabla USUARIO (general para todos los usuarios)
-- Almacena la información básica de los usuarios, ya sean estudiantes o docentes
CREATE TABLE IF NOT EXISTS USUARIO (
    id VARCHAR(8) PRIMARY KEY,  -- DNI del usuario
    nombres VARCHAR(50) NOT NULL,
    apellidos VARCHAR(50) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,  -- El correo es único
    contraseña VARCHAR(255) NOT NULL,
    rol ENUM('docente', 'estudiante') NOT NULL  -- Define si es docente o estudiante
);

-- Tabla ESTUDIANTE
-- Relacionada con USUARIO, almacena el progreso y la nota total del estudiante
CREATE TABLE IF NOT EXISTS ESTUDIANTE (
    id VARCHAR(8) PRIMARY KEY,  -- DNI del estudiante, relación 1:1 con USUARIO
    progreso_total DECIMAL(5,2) DEFAULT 0,  -- Progreso total del estudiante en todo el curso
    nota_total DECIMAL(5,2) DEFAULT 0,  -- Nota total acumulada en todo el curso
    FOREIGN KEY (id) REFERENCES USUARIO(id)
);

-- Tabla DOCENTE
-- Relacionada con USUARIO, identifica a los docentes
CREATE TABLE IF NOT EXISTS DOCENTE (
    id VARCHAR(8) PRIMARY KEY,  -- DNI del docente, relación 1:1 con USUARIO
    FOREIGN KEY (id) REFERENCES USUARIO(id)
);

-- Tabla TEMA
-- Almacena los temas del curso de cálculo
CREATE TABLE IF NOT EXISTS TEMA (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,  -- Título del tema
    descripcion TEXT NOT NULL,  -- Descripción del tema
    id_docente VARCHAR(8),  -- El docente responsable del tema
    habilitado BOOLEAN DEFAULT TRUE,  -- Define si el tema está habilitado o no
    FOREIGN KEY (id_docente) REFERENCES DOCENTE(id)
);

-- Tabla EJERCICIO
-- Almacena los ejercicios asociados a cada tema. Incluye tanto ejercicios paso a paso como desafíos
CREATE TABLE IF NOT EXISTS EJERCICIO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,  -- Título del ejercicio
    descripcion TEXT NOT NULL,  -- Descripción del ejercicio
    tipo ENUM('ejercicio', 'desafio') NOT NULL,  -- Define si es un ejercicio paso a paso o un desafío
    id_tema INT,  -- Relación con el tema
    FOREIGN KEY (id_tema) REFERENCES TEMA(id)
);

-- Tabla PASO
-- Almacena los pasos individuales de los ejercicios paso a paso
CREATE TABLE IF NOT EXISTS PASO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion TEXT NOT NULL,  -- Descripción del paso
    id_ejercicio INT,  -- Relación con el ejercicio al que pertenece
    FOREIGN KEY (id_ejercicio) REFERENCES EJERCICIO(id)
);

-- Tabla ALTERNATIVA
-- Almacena las alternativas disponibles en cada paso de un ejercicio
CREATE TABLE IF NOT EXISTS ALTERNATIVA (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion TEXT NOT NULL,  -- Descripción de la alternativa
    correcta BOOLEAN NOT NULL,  -- Indica si la alternativa es correcta o incorrecta
    id_paso INT,  -- Relación con el paso correspondiente
    FOREIGN KEY (id_paso) REFERENCES PASO(id)
);

-- Tabla PROGRESO_ESTUDIANTE
-- Almacena el progreso de cada estudiante en cada tema específico
CREATE TABLE IF NOT EXISTS PROGRESO_ESTUDIANTE (
    id_estudiante VARCHAR(8),  -- Relación con ESTUDIANTE
    id_tema INT,  -- Relación con TEMA
    progreso DECIMAL(5,2) DEFAULT 0,  -- Progreso del estudiante en este tema específico
    nota_total DECIMAL(5,2) DEFAULT 0,  -- Nota total del estudiante en este tema específico
    PRIMARY KEY (id_estudiante, id_tema),
    FOREIGN KEY (id_estudiante) REFERENCES ESTUDIANTE(id),
    FOREIGN KEY (id_tema) REFERENCES TEMA(id)
);

-- Tabla INTENTO_EJERCICIO
-- Almacena los intentos de los estudiantes en ejercicios y desafíos
-- Nota: Solo se permite un intento para los desafíos (enforce unique constraint)
CREATE TABLE IF NOT EXISTS INTENTO_EJERCICIO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_estudiante VARCHAR(8),  -- Relación con ESTUDIANTE
    id_ejercicio INT,  -- Relación con EJERCICIO
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- Fecha y hora del intento
    nota DECIMAL(5,2) NOT NULL,  -- Nota obtenida en este intento
    tipo ENUM('ejercicio', 'desafio') NOT NULL,  -- Diferencia entre ejercicios y desafíos
    UNIQUE (id_estudiante, id_ejercicio, tipo),  -- Un estudiante solo puede hacer un desafío una vez
    FOREIGN KEY (id_estudiante) REFERENCES ESTUDIANTE(id),
    FOREIGN KEY (id_ejercicio) REFERENCES EJERCICIO(id)
);

-- Tabla NOTA_EJERCICIO
-- Almacena la nota más alta obtenida en cada ejercicio (solo para los ejercicios paso a paso)
-- Nota: Para los desafíos, la nota se almacena directamente en INTENTO_EJERCICIO
CREATE TABLE IF NOT EXISTS NOTA_EJERCICIO (
    id_estudiante VARCHAR(8),  -- Relación con ESTUDIANTE
    id_ejercicio INT,  -- Relación con EJERCICIO
    nota DECIMAL(5,2) NOT NULL,  -- Nota más alta obtenida en el ejercicio
    PRIMARY KEY (id_estudiante, id_ejercicio),
    FOREIGN KEY (id_estudiante) REFERENCES ESTUDIANTE(id),
    FOREIGN KEY (id_ejercicio) REFERENCES EJERCICIO(id)
);

-- Tabla ERROR_PASO
-- Almacena los errores cometidos por el estudiante en los ejercicios paso a paso
-- Esto permitirá al docente ver en qué parte del ejercicio el estudiante falló
CREATE TABLE IF NOT EXISTS ERROR_PASO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_intento INT,  -- Relación con el intento en el que ocurrió el error
    id_paso INT,  -- Relación con el paso donde ocurrió el error
    id_alternativa INT,  -- Relación con la alternativa seleccionada incorrectamente
    FOREIGN KEY (id_intento) REFERENCES INTENTO_EJERCICIO(id),
    FOREIGN KEY (id_paso) REFERENCES PASO(id),
    FOREIGN KEY (id_alternativa) REFERENCES ALTERNATIVA(id)
);



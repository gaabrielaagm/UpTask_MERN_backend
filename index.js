import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import conectarDB from './config/db.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import proyectoRoutes from './routes/proyectoRoutes.js';
import tareaRoutes from './routes/tareaRoutes.js';

const app = express();
app.use(express.json());

dotenv.config();

conectarDB();

// Configurar CORS
const whitelist = [process.env.FRONTEND_URL];

const corsOptions = {
    origin: function(origin, callback) {
        if (whitelist.includes(origin)) {
            // permitido consultar la API
            callback(null, true);
        } else {
            // no permitido consultar la API
            callback(new Error('Error de Cors'))
        }
    }
};
app.use(cors(corsOptions));

// Routing
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/proyectos', proyectoRoutes);
app.use('/api/tareas', tareaRoutes);


const PORT = process.env.PORT || 4000;
console.log('conectando...');
const servidor = app.listen(PORT, () => {
    console.log(`servidor corriendo en el puerto ${PORT}`);
});


// Socker.io
import { Server } from 'socket.io';

const io = new Server(servidor, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL
    }
});

io.on('connection', (socket) => {
    // console.log('Conectado a Socket.io');

    // Definir los eventos de socket.io
    socket.on('abrir proyecto', (proyectoId) => {
        socket.join(proyectoId);
    });
    
    socket.on('nueva tarea', tarea => {
        const proyecto = tarea.proyecto
        socket.to(proyecto).emit('tarea agregada', tarea);
    });

    socket.on('eliminar tarea', tarea => {
        const proyecto = tarea.proyecto
        socket.to(proyecto).emit('tarea eliminada', tarea);
    });

    socket.on('actualizar tarea', tarea => {
        const proyecto = tarea.proyecto
        socket.to(proyecto).emit('tarea actualizada', tarea);
    });

    socket.on('actualizar estado tarea', tarea => {
        const proyecto = tarea.proyecto
        socket.to(proyecto).emit('estado tarea actualizado', tarea);
    })
});
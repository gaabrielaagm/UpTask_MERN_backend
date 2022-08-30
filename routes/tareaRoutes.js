import express from 'express';
import {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado } from '../controllers/tareaController.js';
import checkAuth from '../middleware/checkAuth.js';

const router = express.Router();

router.post('/', checkAuth, agregarTarea);
router.route('/:id')
        .get(checkAuth, obtenerTarea)
        .put(checkAuth, actualizarTarea);
router.delete('/:idTarea/proyecto/:idProyecto', checkAuth, eliminarTarea)
router.put('/estado/:id', checkAuth, cambiarEstado);

export default router;
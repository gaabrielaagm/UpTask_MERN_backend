import Proyecto from "../models/Proyecto.js";
import Tarea from "../models/Tarea.js";

const agregarTarea = async (req, res) => {
    const { proyecto } = req.body;
    const existeProyecto = await Proyecto.findById(proyecto).where('creador').equals(req.usuario._id);
    if(!existeProyecto) {
        const error = new Error('El Proyecto No Existe');
        return res.status(404).json({ msg: error.message });
    }

    try {
        // const nuevaTarea = new Tarea(req.body);
        // await nuevaTarea.save();

        const nuevaTarea = await Tarea.create(req.body); //mongoose form

        // Almacenar el ID de la Tarea en el campo tareas del Proyecto
        existeProyecto.tareas.push(nuevaTarea._id);
        await existeProyecto.save();

        return res.json(nuevaTarea);
    } catch (error) {
        console.error(error);
    }
    
};

const obtenerTarea = async (req, res) => {
    const { id } = req.params;
    const tarea = await Tarea.findById(id).populate("proyecto");
    
    if(!tarea) {
        const error = new Error('Tarea No Encontrada');
        return res.status(404).json({ msg: error.message });
    }

    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción No Valida');
        return res.status(403).json({ msg: error.message }); 
    }

    return res.json(tarea)
};

const actualizarTarea = async (req, res) => {
    const { id } = req.params;
    const tareaCambios = req.body;
    const tarea = await Tarea.findById(id).populate("proyecto");
    
    if(!tarea) {
        const error = new Error('Tarea No Encontrada');
        return res.status(404).json({ msg: error.message });
    }

    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción No Valida');
        return res.status(403).json({ msg: error.message }); 
    }

    try {
        tarea.overwrite(tareaCambios);
        await tarea.save();
        return res.json(tarea);
    } catch (error) {
        console.error(error);
    }
};

const eliminarTarea = async (req, res) => {
    const { idTarea, idProyecto } = req.params;

    const proyecto = await Proyecto.findById(idProyecto);
    if(!proyecto) {
        const error = new Error(`Proyecto No Encontrado`);
        return res.status(404).json({msg: error.message});
    }
    
    const tarea = await Tarea.findById(idTarea);
    if(!tarea) {
        const error = new Error(`Tarea No Encontrada`);
        return res.status(404).json({msg: error.message});
    }
    
    try {
        // update project
        proyecto.tareas.pull(tarea._id);
        // proyecto.tareas = proyecto.tareas.filter(tareaDB => tareaDB._id.toString() !== idTarea)
        await proyecto.save();

        // delete task
        await tarea.deleteOne();
        return res.json({msg: 'Tarea Eliminada Del Proyecto'});
    } catch (error) {
        console.error(error);
    }
};

const cambiarEstado = async (req, res) => {
    const { id } = req.params;

    const tarea = await Tarea.findById(id).populate("proyecto");

    if(!tarea) {
        const error = new Error(`Tarea No Encontrada`);
        return res.status(404).json({msg: error.message});
    } 

    try {
        tarea.estado = !tarea.estado;
        tarea.completado = (tarea.estado) ? req.usuario._id : null;
        await tarea.save();
    
        const tareaAlmacenada = await Tarea.findById(id)
            .populate({ path: "completado", select: "nombre" });

        return res.json(tareaAlmacenada);

    } catch (error) {
        console.error(error);
    }
};

export {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado
}
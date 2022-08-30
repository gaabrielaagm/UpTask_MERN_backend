import Proyecto from "../models/Proyecto.js";
import Usuario from "../models/Usuario.js";

const obtenerProyectos = async (req, res) => {
    const proyectos = await Proyecto
        .find({
            $or: [
                {colaboradores: { $in: req.usuario}},    
                {creador: { $in: req.usuario}}  
            ] 
        })
        .select("-tareas");

    res.json(proyectos);
};

const nuevoProyecto = async (req, res) => {
    const proyecto = new Proyecto(req.body);
    proyecto.creador = req.usuario._id;

    try {
        const proyectoAlmacenado =  await proyecto.save();
        res.json(proyectoAlmacenado);
    } catch (error) {
        console.error(error);
    }
};

const obtenerProyecto = async (req, res) => {
    const { id } = req.params;
    const proyecto = await Proyecto
        .findOne({
            _id: id,
            $or: [
                {'colaboradores': { $in: req.usuario}},    
                {'creador': { $in: req.usuario}},    
            ]
        })
        .populate({ 
            path: 'tareas', 
            populate: { path: 'completado', select: "nombre"}
        })
        .populate("colaboradores", "nombre email");

    if(!proyecto) {
        const error = new Error(`Proyecto No Encontrado`);
        return res.status(404).json({msg: error.message});
    }

    // ver que al menos sea un colaborador

    // get tareas
    // const tareas = await Tarea.find().where('proyecto').equals(proyecto._id);

    return res.json(proyecto);
};

const editarProyecto = async (req, res) => {
    const { id } = req.params;
    const proyectoUpdates = req.body;

    const proyecto = await Proyecto.findById(id).where('creador').equals(req.usuario._id);
    if(!proyecto) {
        const error = new Error(`Proyecto No Encontrado`);
        return res.status(404).json({msg: error.message});
    }

    try {
        proyecto.overwrite(proyectoUpdates);
        await proyecto.save();
        res.json(proyecto);
    } catch (error) {
        console.error(error);
    }
};

const eliminarProyecto = async (req, res) => {
    const { id } = req.params;
    
    const proyecto = await Proyecto.findById(id).where('creador').equals(req.usuario._id);
    if(!proyecto) {
        const error = new Error(`Proyecto No Encontrado`);
        return res.status(404).json({msg: error.message});
    }

    try {
        await proyecto.deleteOne();
        return res.json({msg: 'Proyecto Eliminado'});
    } catch (error) {
        console.error(error);
    }
};

const buscarColaborador = async (req, res) => {
    const { email } = req.body;
    const usuario = await Usuario.findOne({ email })
                                  .select('-confirmado -createdAt -password -token -updatedAt -__v');

    if(!usuario) {
        const error = new Error('Usuario No Encontrado');
        return res.status(404).json({ msg: error.message });
    }

    res.json(usuario);
}

const agregarColaborador = async (req, res) => {
    const { id } = req.params;
    const proyecto = await Proyecto.findById(id)
                             .where('creador').equals(req.usuario._id); // solo el creador del proyecto puede agregar colaboradores

    if(!proyecto) {
        const error = new Error('Proyecto No Encontrado');
        return res.status(404).json({ msg: error.message });
    }

    const { email } = req.body;
    const colaborador = await Usuario.findOne({ email })
                                  .select('-confirmado -createdAt -password -token -updatedAt -__v');

    if(!colaborador) {
        const error = new Error('Usuario No Encontrado');
        return res.status(404).json({ msg: error.message });
    }

    // el creador del proyecto no se puede agregar a él mismo como colaborador, es el creador
    if(proyecto.creador.toString() === colaborador._id.toString()) {
        const error = new Error('El creador del Proyecto no puede agregarse como Colaborador');
        return res.status(404).json({ msg: error.message });
    }

    // revisar que el colaborador no exista dentro del proyecto
    if(proyecto.colaboradores.includes(colaborador._id)){
        const error = new Error('El Colaborador ya se encuentra agregado al Proyecto');
        return res.status(404).json({ msg: error.message });
    } else {
        proyecto.colaboradores.push(colaborador._id);
        await proyecto.save();
        res.json(colaborador);
    }
};

const eliminarColaborador = async (req, res) => {
    const { idProyecto, idColaborador } = req.params;

    const proyecto = await Proyecto.findById(idProyecto)
                                     .select('-confirmado -createdAt -password -token -updatedAt -__v');
    
    if(!proyecto) {
        const error = new Error(`Proyecto No Encontrado`);
        return res.status(404).json({msg: error.message});
    }

    proyecto.colaboradores = proyecto.colaboradores.filter(colaborador => colaborador.toString() !== idColaborador);

    try {
        await proyecto.save();
        return res.json({msg: 'Colaborador Eliminado Del Proyecto'});
    } catch (error) {
        console.error(error);
    }
};

export {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    buscarColaborador,
    agregarColaborador,
    eliminarColaborador
}
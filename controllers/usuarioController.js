import Usuario from '../models/Usuario.js';
import generarId from '../helpers/generarId.js';
import generarJWT from '../helpers/generarJWT.js';
import { emailRegistro, emailOlvidePassword } from '../helpers/email.js';

const registrar = async (req, res) => {
    // Evitar registros duplicados
    const { email } = req.body;
    const existeUsuario = await Usuario.findOne({ email });
    if (existeUsuario) {
        const error = new Error('Usuario ya registrado');
        return res.status(400).json({msg: error.message });
    } 

    try {
        // guardar base de datos
        const usuario = new Usuario(req.body);
        usuario.token = generarId();
        await usuario.save();

        //enviar email de confirmacion
        const { email, nombre, token } = usuario
        emailRegistro({email, nombre, token})

        res.json({
            msg: 'Usuario creado Correctamente. Revisa tu Email para confirmar tu cuenta.'
        });
    } catch (error) {
        console.error(error)
    }
};

const autenticar = async (req, res) => {
    // Comprobar si el usuario existeUsuario
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ email });
    if(!usuario) {
        const error = new Error('El usuario no existe');
        return res.status(404).json({ msg: error.message });
    }

    // Comprobar si la cuenda del usuario esta confirmada
    if(!usuario.confirmado) {
        const error = new Error('Tu cuenta no ha sido confirmada');
        return res.status(403).json({ msg: error.message });
    }

    // Comprobar password
    if(await usuario.comprobarPassword(password)) {
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario._id)
        });
    } else {
        const error = new Error('El Password es Incorrecto');
        return res.status(403).json({ msg: error.message });
    }
    
};

const confirmar = async (req, res) => {
    const { token } = req.params;
    const usuarioConfirmar = await Usuario.findOne({ token });
    if (!usuarioConfirmar) {
        const error = new Error('Token no válido.');
        return res.status(403).json({ msg: error.message });
    }

    try {
        usuarioConfirmar.confirmado = true;
        usuarioConfirmar.token = "";
        await usuarioConfirmar.save();
        res.json({ msg: 'Usuario Confirmado Correctamente' });
    } catch (error) {
        console.error(error);
    }
};

const olvidePassword = async (req, res) => {
    const { email } = req.body;
    const usuario = await Usuario.findOne({ email });
    if(!usuario) {
        const error = new Error('El usuario no existe');
        return res.status(404).json({ msg: error.message });
    };

    try {
        usuario.token = generarId(); 
        await usuario.save();

        const { email, nombre, token } = usuario
        emailOlvidePassword({email, nombre, token})

        res.json({ msg: 'Hemos enviado un Email con las siguientes instrucciones. Revisalo.' });
    } catch (error) {
        console.error(error)
    }
};

const comprobarToken = async (req, res) => {
    const { token } = req.params;
    const tokenValido = await Usuario.findOne({ token });
    if (!tokenValido) {
        const error = new Error('Token No válido.');
        return res.status(403).json({ msg: error.message });
    } else {
        res.json({ msg: 'Token válido.' });
    }
};

const nuevoPassword = async (req, res) => {
    const { token } = req.params;
    const { nuevaPassword } = req.body;

    const usuario = await Usuario.findOne({ token });
    if (!usuario) {
        const error = new Error('Token No válido.');
        return res.status(403).json({ msg: error.message });
    } else {
        usuario.password = nuevaPassword;
        usuario.token = ""
        try {
            await usuario.save();
        } catch (error) {
            console.error(error)
        }
        
        return res.json({ msg: 'Password Modificado Correctamente' });
    }
};

const perfil = async (req, res) => { 
    const { usuario } = req;
    res.json(usuario);
} 

export { 
        registrar, 
        autenticar, 
        confirmar, 
        olvidePassword, 
        comprobarToken,
        nuevoPassword,
        perfil
    };

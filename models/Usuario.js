import mongoose from "mongoose";
import bcrypt from "bcrypt";

const usuarioSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true // eliminar espacios inicio y final
    },
    password: {
        type: String,
        required: true,
        trim: true 
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true // no puede existir dos iguales
    },
    token: {
        type: String
    },
    confirmado: {
        type: Boolean,
        default: false
    }
}, { 
    timestamps: true, // agrega dos campos más: 1)creado 2)actualizado
});

usuarioSchema.pre('save', async function(next) {
    // checar que el password no haya sido cambiado, 
    // que solo haga el hasheo cuando el password se modifique, es decir:
    // 1) cuando sea un nuevo registro (password es modificado por que se crea) o
    // 2) ese campo password sea cambiado
    if (!this.isModified('password')) {
        next(); // como saltar al siguiente paso, no se usa return porque detiene toda la ejecución
        // entrará aqui cuando sea un update de un registro ya creado y que sean cambios de cualquier campo
        // excepto si es del campo password
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

usuarioSchema.methods.comprobarPassword = async function (passwordFormulario) {
    return await bcrypt.compare(passwordFormulario, this.password)
}

const Usuario = mongoose.model("Usuario", usuarioSchema);

export default Usuario;

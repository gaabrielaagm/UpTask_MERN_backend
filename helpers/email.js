import nodemailer from 'nodemailer';

// Configuracion y Credenciales de mailtrap
const mailtrapSettings = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
}

export const emailRegistro = async (datos) => {
    const { email, nombre, token } = datos;
    
    const transport = mailtrapSettings();

    // Informacion del Email para
    await transport.sendMail({
        from: '"UpTask - Administrador de Proyectos" <cuentas@uptask.com>',
        to: email,
        subject: "UpTask - Confirma tu Cuenta",
        text: "Comprueba tu cuenta en UpTask",
        html: `
            <p>Hola ${nombre}! Comprueba tu cuenta en UpTask</p>
            <p>Tu cuenta ya está casi lista. Confirmala en el siguiente enlace: 
                <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Confirmar Cuenta</a>
            </p>
            <p>Si tu no creaste esta cuenta puedes ignorar el mensaje.</p>
        `
    });
};

export const emailOlvidePassword = async (datos) => {
    const { email, nombre, token } = datos;

    // Configuracion y Credenciales de mailtrap
    const transport = mailtrapSettings();

    // Informacion del Email para
    await transport.sendMail({
        from: '"UpTask - Administrador de Proyectos" <cuentas@uptask.com>',
        to: email,
        subject: "UpTask - Reestablece tu Password",
        text: "Reestablece tu Password",
        html: `
            <p>Hola ${nombre}! Has solicitado reestablecer tu Password</p>
            <p>Sigue el siguiente enlace para generar un nuevo password: 
                <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer Password</a>
            </p>
            <p>Si tu no creaste esta cuenta puedes ignorar el mensaje.</p>
        `
    });
};
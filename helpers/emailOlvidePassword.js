import nodemailer from 'nodemailer';

const EmailOlvidePassword = async (datos) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  const {email, nombre, token} = datos;
  // Enviar Email

  const info = await transporter.sendMail({
    from: "APV -  Administrados de Pcientes de Veterinaria",
    to: email,
    subject: 'Restablece tu Password',
    text: 'Restablece tu Password',
    html: `<p>Hola:${nombre}, Haz solicitado reestablecer tu Contraseña.</p> 

          <p>Ha click en el siguiente enlace para generar una nueva contraseña:
          <a href="${process.env.FRONTEND_URL}/olvide-password/${token}"> Generar nueva contraseña</a> </p>
          <p>Si tu no solicitaste este cambio Porfavcr ignora este email</p>
              
    `
  });
  console.log('mensaje Enviado: %s', info.messageId);
};

export default EmailOlvidePassword
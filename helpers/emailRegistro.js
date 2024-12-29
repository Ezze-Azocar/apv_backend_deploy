import nodemailer from 'nodemailer';

const emailRegistro = async (datos) => {
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
    subject: 'Comprueba tu cuenta en APV',
    text: 'Comprueba tu cuenta en APV',
    html: `<p>Hola:${nombre}, Comprueba tu cuenta en APV.</p> 
          <p>Tu cuent ya esta lista, haz click en el enlace para verificar:
          <a href="${process.env.FRONTEND_URL}/confirmar/${token}"> Verificar Cuenta</a> </p>
          <p>Si tu no creaste esta cuenta, Porfavcr ignora este email</p>
              
    `
  });
  console.log('mensaje Enviado: %s', info.messageId);
};

export default emailRegistro
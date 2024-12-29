import Veterinario from "../models/Veterinario.js";
import generarJWT from "../helpers/generarJWT.js";
import generarId from "../helpers/generarid.js";
import emailRegistro from "../helpers/emailRegistro.js";
import EmailOlvidePassword from "../helpers/emailOlvidePassword.js";

const registrar = async (req, res) => {
  // Prevenir registros duplicados
  const { email, nombre } = req.body;
  const existeVeterinario = await Veterinario.findOne({ email });
  if (existeVeterinario) {
    const error = new Error("El usuario ya existe");
    return res.status(400).json({ msg: error.message });
  }
  try {
    // Guardar nuevo veterinario en la base de datos
    const veterinario = new Veterinario(req.body);
    const veterinarioGuardado = await veterinario.save();

    //Enviar Email
    emailRegistro({
      email,
      nombre,
      token: veterinarioGuardado.token,
    });

    res.json(veterinarioGuardado);
  } catch (error) {
    console.log(error);
  }
};

const perfil = (req, res) => {
  const { veterinario } = req;
  res.json({ veterinario });
};

const confirmar = async (req, res) => {
  const { token } = req.params;

  const veterinarioConfirmar = await Veterinario.findOne({ token });

  if (!veterinarioConfirmar) {
    const error = new Error("Token no valido");
    return res.status(404).json({ msg: error.message });
  }

  try {
    veterinarioConfirmar.confirmado = true;
    veterinarioConfirmar.token = null;
    await veterinarioConfirmar.save();
    res.json({ msg: "Usuario confirmado correctamente" });
    return;
  } catch (error) {
    console.log(error);
  }
};

const autenticar = async (req, res) => {
  const { email, password } = req.body;
  // Comprobar si el usuario existe
  const usuario = await Veterinario.findOne({ email });
  if (!usuario) {
    const error = new Error("El usuario no existe");
    return res.status(404).json({ msg: error.message });
  }

  // Comprobar si el usuario esta confirmado
  if (!usuario.confirmado) {
    const error = new Error("Tu cuenta no ha sido confirmado");
    return res.status(403).json({ msg: error.message });
  }

  // Revisar el password
  if (await usuario.comprobarPassword(password)) {
    // Autenticar
    res.json({
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      token: generarJWT(usuario.id),
    });
  } else {
    const error = new Error("Password Incorrecto");
    return res.status(403).json({ msg: error.message });
  }
};

const olvidePassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Buscar el veterinario en la base de datos
    const existeVeterinario = await Veterinario.findOne({ email });

    if (!existeVeterinario) {
      const error = new Error("El Usuario no existe");
      return res.status(400).json({ msg: error.message });
    }

    // Resto de la lógica para recuperar contraseña
    existeVeterinario.token = generarId();
    await existeVeterinario.save();

    // Enviar el email con las instrucciones
    EmailOlvidePassword({
      email,
      nombre: existeVeterinario.nombre,
      token: existeVeterinario.token,
    });

    res.json({ msg: "Hemos enviado un email con las instrucciones" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error del servidor" });
  }
};
const comprobarToken = async (req, res) => {
  const { token } = req.params;
  const tokenValido = await Veterinario.findOne({ token });
  if (tokenValido) {
    res.json({ msg: "Token valido y el usuario existe" });
  } else {
    const error = new Error("Token no valido");
    return res.status(404).json({ msg: error.message });
  }
};
const nuevoPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  const veterinario = await Veterinario.findOne({ token });
  if (!veterinario) {
    const error = new Error("Token no valido");
    return res.status(400).json({ msg: error.message });
  }
  try {
    veterinario.password = password;
    veterinario.token = null;
    await veterinario.save();
    res.json({ msg: "Password modificado correctamente" });
  } catch (error) {
    console.log(error);
  }
};

const actualizarPerfil = async (req, res) => {
  const veterinario = await Veterinario.findById(req.params.id)
  if(!veterinario) {
    const error = new Error('Hubo un error')
    res.status(400).json({msg: error.message})
  }

  const { email } = req.body
  if(veterinario.email !== req.body.email){
    const existeEmail = await Veterinario.findOne({email})
    if(existeEmail){
      const error = new Error('Ese email ya esta en uso')
      res.status(400).json({msg: error.message})
    }
  }

  try {
    veterinario.nombre = req.body.nombre;
    veterinario.email = req.body.email;
    veterinario.web = req.body.web;
    veterinario.telefono = req.body.telefono;

    const veterinarioActualizado = await veterinario.save()
    res.json(veterinarioActualizado)
  } catch (error) {
    console.log(error)
  }
}

const actualizarPassword = async (req,res) => {
  // Leer los datos
  const {id} = req.veterinario;
  const { pwd_actual, pwd_nuevo} = req.body

  // Comprobar que el veterinario exista
  const veterinario = await Veterinario.findById(id)
  if(!veterinario) {
    const error = new Error('Hubo un error')
    res.status(400).json({msg: error.message})
  }
  // Comprobar su password
  if(await veterinario.comprobarPassword(pwd_actual)){
    // Almacenar el nuevo password
    veterinario.password = pwd_nuevo;
    await veterinario.save();
    res.json({msg:'Password Almacenado Correctamente'})

  }else {
    const error = new Error('El password actual es incorrecto.')
    res.status(400).json({msg: error.message})
  }
}

export {
  registrar,
  perfil,
  confirmar,
  autenticar,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  actualizarPerfil,
  actualizarPassword
};

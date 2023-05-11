import Veterinario from "../models/veterinarioModel.js";
import generarId from "../helpers/generarId.js";
import generarJWT from "../helpers/generarJWT.js";
import emailRegistro from "../helpers/emailRegistro.js";
import emailOlvidePassword from "../helpers/emailOlvidePassword.js";

const registrar = async (req, res) => {
  const { email, nombre } = req.body;

  // Prevenir usuarios duplicados
  const existeUsuario = await Veterinario.findOne({ email });
  if (existeUsuario) {
    const error = new Error("Usuario ya registrado");
    return res.status(400).json({ msg: error.message });
  }

  try {
    // Guardar un Nuevo Veterinario
    const veterinario = new Veterinario(req.body);
    const veterinarioGuardado = await veterinario.save();

    //Enviar el email
    emailRegistro({
      email,
      nombre,
      token: veterinarioGuardado.token
    })

    res.json(veterinarioGuardado);
  } catch (error) {
    console.log(error);
  }
};

const confirmar = async (req, res) => {
    const { token } = req.params;  

    try {
        const userConfirmar = await Veterinario.findOne({ token });
    
        if(!userConfirmar) {
            const error = new Error('Token no válido.');
            return res.status(404).json({msg: error.message});
        }

        userConfirmar.token = null;
        userConfirmar.confirmado = true;
        await userConfirmar.save();

        res.json({ msg: 'Usuario confirmado correctamente.'});
    } catch (error) {
        console.log(error)
    }
};

const olvidePassword = async (req, res) => {
  const { email } = req.body;

  const existeVeterinario = await Veterinario.findOne({ email });

  if (!existeVeterinario) {
    const error = new Error("El Usuario no existe");
    return res.status(400).json({ msg: error.message });
  }

  //comprobar si el usuario esta confirmado
  if(!existeVeterinario.confirmado) {
    const error = new Error('La cuenta no ha sido confirmada.');
    return res.status(403).json({msg: error.message});
}

  try {
    existeVeterinario.token = generarId();
    await existeVeterinario.save();

    // Enviar Email con instrucciones
    emailOlvidePassword({
      email,
      nombre: existeVeterinario.nombre,
      token: existeVeterinario.token,
    });    

    const message = 'Seguir las instrucciones enviadas al email:';
    const email = existeVeterinario.email;

    res.json({ message, email });

    //otras formas de enviar el mensaje
    /* const mensaje = `Hemos enviado un email a ${existeVeterinario.email} con las instrucciones`;
    res.json({ msg: mensaje }); */
    /* res.json({ msg: "Hemos enviado un email con las instrucciones" }); */
  } catch (error) {
    console.log(error);
  }
};

const comprobarToken = async (req, res) => {
  const {token} = req.params;
  
  const tokenValido = await Veterinario.findOne({ token });

  if(tokenValido) {
    res.json({msg: 'Token válido y el usuario existe.'});
} else {
    const error = new Error('Token no válido.');
    return res.status(403).json({msg: error.message});
}
};

const nuevoPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body; 

  try {
    const veterinario = await Veterinario.findOne({ token });
    if (!veterinario) {
      const error = new Error("Hubo un error");
      return res.status(400).json({ msg: error.message });
    }
    veterinario.token = null;
    veterinario.password = password;
    await veterinario.save();
    res.json({ msg: "Password modificado correctamente" });
  } catch (error) {
    console.log(error);
  }
};

const autenticar = async (req, res) => {
  const {email, password} = req.body;

  //comprobar si el usuario existe
  const user = await Veterinario.findOne({email});

  if(!user) {
      const error = new Error('El usuario no existe.');
      return res.status(403).json({msg: error.message});
  } 

  //comprobar si el usuario esta confirmado
  if(!user.confirmado) {
      const error = new Error('La cuenta no ha sido confirmada.');
      return res.status(403).json({msg: error.message});
  }

  //revisar el password
  if(await user.comprobarPassword(password)) {
      //autenticar
      res.json({
        _id: user._id,
        nombre: user.nombre,
        email: user.email,
        token: generarJWT(user.id)
      });
  } else {
      const error = new Error('El password es incorrecto.');
      return res.status(403).json({msg: error.message});
  }
};

const perfil = (req, res) => {
  const {veterinario} = req;
  res.json(veterinario);
};

const actualizarPerfil = async (req, res) => {
  const veterinario = await Veterinario.findById(req.params.id);
  if (!veterinario) {
    const error = new Error("Hubo un error");
    return res.status(400).json({ msg: error.message });
  }

  //comprobamos que el email editado no esta ya en la BD
  const { email } = req.body;
  if (veterinario.email !== req.body.email) {
    const existeEmail = await Veterinario.findOne({ email });

    if (existeEmail) {
      const error = new Error("Ese email ya esta en uso");
      return res.status(400).json({ msg: error.message });
    }
  }

  try {
    veterinario.nombre = req.body.nombre;
    veterinario.email = req.body.email;
    veterinario.web = req.body.web;
    veterinario.telefono = req.body.telefono;

    const veterianrioActualizado = await veterinario.save();
    res.json(veterianrioActualizado);
  } catch (error) {
    console.log(error);
  }
};

const actualizarPassword = async (req, res) => {
  // Leer los datos
  const { id } = req.veterinario;
  const { pwd_actual, pwd_nuevo } = req.body;

  // Comprobar que el veterinario existe
  const veterinario = await Veterinario.findById(id);
  if (!veterinario) {
    const error = new Error("Hubo un error");
    return res.status(400).json({ msg: error.message });
  }

  // Comprobar su password
  if (await veterinario.comprobarPassword(pwd_actual)) {
    
    // Almacenar el nuevo password
    veterinario.password = pwd_nuevo;
    await veterinario.save();
    res.json({ msg: "Password Almacenado Correctamente" });
  } else {
    const error = new Error("El Password Actual es Incorrecto");
    return res.status(400).json({ msg: error.message });
  }
};

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
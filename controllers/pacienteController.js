import Paciente from "../models/pacienteModel.js";

const agregarPaciente = async (req, res) => {
    try {
        const paciente = new Paciente(req.body);
        paciente.veterinario = req.veterinario._id;
        const pacienteAlmacenado = await paciente.save();
        res.json(pacienteAlmacenado);
    } catch (error) {
        console.log(error);
    }
}

const obtenerPacientes = async (req, res) => {
    const pacientes = await Paciente.find()
      .where("veterinario")
      .equals(req.veterinario)
      .sort({ createdAt: -1 }); // Orden ascendente por fecha
  
    res.json(pacientes);
};

const obtenerPaciente = async (req, res) => { //para econtrar un paciente le pasamos el id por la url
    const {id} = req.params;

    if(id.length !== 24) {
        return res.status(404).json({ msg: "Paciente no encontrado." });
    }

    const paciente = await Paciente.findById(id.trim());
    
    if (paciente.veterinario._id.toString() !== req.veterinario._id.toString()) {
        return res.json({msg: 'Acción no válida.'})
    }

    if (paciente) {
        res.json(paciente)
    }   
};

const actualizarPaciente = async (req, res) => {
    const { id } = req.params;

    if(id.length !== 24) {
        return res.status(404).json({ msg: "Paciente no encontrado." });
    }

    const paciente = await Paciente.findById(id);
    
    if (!paciente) {
        return res.status(404).json({ msg: "Paciente no encontrado." });
    }
    
    if (paciente.veterinario._id.toString() !== req.veterinario._id.toString()) {
        return res.json({ msg: "Accion no válida" });
    }
    
    // Actualizar Paciente, en caso que el dato no este presente en el formulario va a tomar el valor ya tiene el objeto
    paciente.nombre = req.body.nombre || paciente.nombre;
    paciente.propietario = req.body.propietario || paciente.propietario;
    paciente.email = req.body.email || paciente.email;
    paciente.fecha = req.body.fecha || paciente.fecha;
    paciente.sintomas = req.body.sintomas || paciente.sintomas;
    
    try {
        const pacienteActualizado = await paciente.save();
        res.json(pacienteActualizado);
    } catch (error) {
        console.log(error);
    }
};

const eliminarPaciente = async (req, res) => {
    const { id } = req.params;

    if(id.length !== 24) {
        return res.status(404).json({ msg: "Paciente no encontrado." });
    }

    const paciente = await Paciente.findById(id);
  
    if (!paciente) {
        
      return res.status(404).json({ msg: "Paciente no encontrado." });
    }
  
    if (paciente.veterinario._id.toString() !== req.veterinario._id.toString()) {
      return res.json({ msg: "Accion no válida" });
    }
  
    try {
      await paciente.deleteOne();
      res.json({ msg: "Paciente Eliminado" });
    } catch (error) {
      console.log(error);
    }
};

export {
    agregarPaciente,
    obtenerPacientes,
    obtenerPaciente,
    actualizarPaciente,
    eliminarPaciente
};
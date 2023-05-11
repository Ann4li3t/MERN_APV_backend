import mongoose from "mongoose";

const pacienteSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true, //para eliminar espacios en blanco al principio y final
    },
    propietario: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
    },
    fecha: {
        type: Date,
        required: true,
        default: Date.now(),
    },
    sintomas: {
        type: String,
        required: true,
    },
    veterinario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Veterinario",
    },
},
{
timestamps: true,
}
);


//para registrar el schema como un modelo en mongoose 
const Paciente = mongoose.model("Paciente", pacienteSchema);
export default Paciente;
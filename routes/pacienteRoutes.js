import express from "express";
const routes = express.Router();
import {agregarPaciente, 
    obtenerPacientes,
    obtenerPaciente,
    actualizarPaciente,
    eliminarPaciente
} from "../controllers/pacienteController.js";
import checkAuth from "../middleware/authMiddleware.js";

routes
    .route("/")
    .post(checkAuth, agregarPaciente)
    .get(checkAuth, obtenerPacientes);

routes
    .route("/:id")
    .get(checkAuth, obtenerPaciente)
    .put(checkAuth, actualizarPaciente)
    .delete(checkAuth, eliminarPaciente)
    

export default routes;

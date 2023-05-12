import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import conectarDB from "./config/db.js";
import veterinarioRoutes from "./routes/veterinarioRoutes.js";
import pacienteRoutes from "./routes/pacienteRoutes.js";

const app = express();
app.use(express.json());

dotenv.config();

conectarDB();

const dominiosPermitidos = [process.env.FRONTEND_URL];
const corsOptions = {
  origin: function (origin, callback) {
    if (dominiosPermitidos.indexOf(origin) !== -1) {
      // El Origen del Request esta permitido
      callback(null, true);
    } else {
      callback(new Error("No permitido por CORS"));
    }
  },
};
  
app.use(cors(corsOptions));

    // configuracion de CORS


  /* const whitelist = [process.env.FRONTEND_URL]
  const corsOptions = {
    origin: function (origin, callback) {
      if(!origin){//for bypassing postman req with  no origin
        return callback(null, true);
      }
    
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'))
      }
      console.log(process.env.FRONTEND_URL)
    }
    
  }

  app.use(cors({ origin: '*' }))
*/
  

app.use('/api/veterinarios/', veterinarioRoutes);

app.use('/api/pacientes/', pacienteRoutes);

const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`Servidor funcionando por el puerto ${port}`)
});


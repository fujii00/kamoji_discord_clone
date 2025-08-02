import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import UserRouter from "../routes/UserRoute.js";
import authRouter from "../routes/authRoute.js";
import ServerRouter from "../routes/ServerRoute.js";
import fileRoute from "../routes/FileRoute.js";
import path from "node:path";
import Messagerouter from "../routes/MessageRoute.js";
import { Server } from "socket.io";
import { verifyToken } from "../useful/jwt.js";
import { createServer } from "node:http";

const server = express();
const httpServer = createServer(server); // Serveur HTTP créé

const corsoptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
};

// Configuration Socket.IO
const io = new Server(httpServer, { // Utilise httpServer au lieu de server
  cors: corsoptions
});



dotenv.config();

/**MIDDLEWARE GLOBAL */
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(cors(corsoptions));
server.use('/api/uploads', express.static(path.resolve('public/uploads')));

// Gestion des connexions Socket.IO

io.on('connection', (socket) => {
  console.log('Un utilisateur est connecté');
  
  socket.on('authenticate', (token) => {
    try {
      const decoded = verifyToken(token);
      socket.join(`user_${decoded.id}`);
      console.log(`Utilisateur ${decoded.id} authentifié`);
    } catch (e) {
      socket.disconnect();
      console.log('Authentification échouée');
    }
  });

  socket.on('disconnect', () => {
    console.log('Utilisateur déconnecté');
  });
});

// Rend io accessible dans les contrôleurs
server.locals.io = io;

/** ROUTES API*/

server.use("/api/users",UserRouter),
server.use("/api/servers",ServerRouter),
server.use("/api",authRouter)
server.use("/api/files", fileRoute)
server.use("/api/messages",Messagerouter)

server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`); 
  console.log(`WebSocket disponible sur ws://localhost:${process.env.PORT}`);
});

export default io; // Exportez l'instance de Socket.IO pour l'utiliser dans d'autres fichiers
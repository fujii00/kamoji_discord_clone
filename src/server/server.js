import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import UserRouter from "../routes/UserRoute.js";
import authRouter from "../routes/authRoute.js";
import fileRoute from "../routes/FileRoute.js";
import Messagerouter from "../routes/MessageRoute.js";
import { verifyToken } from "../useful/jwt.js";
import ServerRouter from "../routes/ServerRoute.js";

dotenv.config();

const server = express();
const httpServer = createServer(server);

const corsOptions = { origin: "*", methods: ["GET", "POST", "PUT", "DELETE","PATCH"] };
server.use(cors(corsOptions));
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use("/api/uploads", express.static(path.resolve("public/uploads")));

// --- Socket.IO ---
const io = new Server(httpServer, { cors: corsOptions });

// Connexion socket
io.on("connection", (socket) => {
  console.log("Un utilisateur est connecté");

  socket.on("authenticate", (token) => {
    try {
      const decoded = verifyToken(token);
      socket.join(`user_${decoded.id}`); // chaque utilisateur a sa room
      console.log(`Utilisateur ${decoded.id} authentifié`);
    } catch {
      socket.disconnect();
      console.log("Authentification échouée");
    }
  });
 
  socket.on("privateMessage", (msg) => {
    // Émettre le message à la room du destinataire
    const receiverRoom = `user_${msg.receiver}`;
    io.to(receiverRoom).emit("privateMessage", msg);
    // Émettre aussi au sender pour l'affichage immédiat
    const senderRoom = `user_${msg.sender}`;
    io.to(senderRoom).emit("privateMessage", msg);
  });

  socket.on("disconnect", () => console.log("Utilisateur déconnecté"));
});

server.locals.io = io;

// --- Routes ---
server.use("/api/users", UserRouter);
server.use("/api", authRouter);
server.use("/api/files", fileRoute);
server.use("/api/messages", Messagerouter);
server.use("/api/servers", ServerRouter);


// --- Start server ---
httpServer.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

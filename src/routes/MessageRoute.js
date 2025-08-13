import express from "express";
import { isGrantedAccess } from '../middleware/auth.js';
import { ROLES } from "../../config/app.js";
import { createPrivateMessage, deletePrivateMessage, getPrivateMessages } from "../controller/MessageController.js";

const MessageRouter = express.Router();

// Créer un message privé
MessageRouter.post("/private", isGrantedAccess([ROLES.USER]), createPrivateMessage);

// Récupérer tous les messages privés entre deux utilisateurs
MessageRouter.get("/private/:idUser1/:idUser2", isGrantedAccess([ROLES.USER]), getPrivateMessages);

// Supprimer un message privé
MessageRouter.delete("/:id", isGrantedAccess([ROLES.USER]), deletePrivateMessage);

export default MessageRouter;

import express from "express";

import { isGrantedAccess } from '../middleware/auth.js'; // Importez vos fonctions
import { ROLES } from "../../config/app.js";
import { createPrivateMessage, deletePrivateMessage, getPrivateMessages } from "../controller/MessageController.js";

const Messagerouter = express.Router();

// Routes protégées avec vérification du token et des rôles
Messagerouter.post("/private",isGrantedAccess([ROLES.USER]) ,createPrivateMessage);

// Récupérer tous les messages privés entre 2 utilisateurs (ex: /privateMessages/1/2)
Messagerouter.get("/private/:idUser1/:idUser2",isGrantedAccess([ROLES.USER]),getPrivateMessages);

// Supprimer un message privé par son id
Messagerouter.delete("/:id",isGrantedAccess([ROLES.USER]), deletePrivateMessage);
export default Messagerouter;
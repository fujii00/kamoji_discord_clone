import express from "express";
import {
    createMessage,
    getMessageById,
    updateMessage,
    deleteMessage,
    togglePinMessage,
    listMessages,
    getMessageReplies,
    sendPrivateMessage,
    getPrivateConversation,
    sendChannelMessage,
    getChannelMessages
} from "../controller/MessageController.js";
import { isGrantedAccess } from '../middleware/auth.js'; // Importez vos fonctions
import { ROLES } from "../../config/app.js";

const Messagerouter = express.Router();

// Routes protégées avec vérification du token et des rôles
Messagerouter.post("/add", isGrantedAccess([ROLES.USER]), createMessage);
Messagerouter.get("/:id", isGrantedAccess([ROLES.USER]), getMessageById);
Messagerouter.patch("/:id", isGrantedAccess([ROLES.USER]), updateMessage);
Messagerouter.delete("/:id", isGrantedAccess([ROLES.USER]), deleteMessage); // Seul l'admin peut supprimer
Messagerouter.post("/:id/pin", isGrantedAccess([ROLES.USER]), togglePinMessage);
Messagerouter.get("/", isGrantedAccess([ROLES.USER]), listMessages);
Messagerouter.get("/:id/replies", isGrantedAccess([ROLES.USER]), getMessageReplies);
Messagerouter.post("/private", isGrantedAccess([ROLES.USER]), sendPrivateMessage);
Messagerouter.get("/conversation/:id", isGrantedAccess([ROLES.USER]), getPrivateConversation);
Messagerouter.post('/channels',isGrantedAccess([ROLES.USER]) , sendChannelMessage);
Messagerouter.get('/channels/:channel_id/messages', isGrantedAccess([ROLES.USER]), getChannelMessages);
export default Messagerouter;
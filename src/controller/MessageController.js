import MessageModel from "../model/Message/MessageModel.js";
import UserModel from "../model/UserModel.js";
import { Op } from "sequelize";

// Créer un message privé (sender, receiver, content)
export async function createPrivateMessage(req, res) {
  try {
    const { receiver, content, reply } = req.body;
    const sender = req.user.id; // Récupéré depuis le token

    // Vérification : champs requis
    if (!receiver || !content) {
      return res.status(400).json({ error: "receiver and content are required" });
    }

    // Vérification : pas d’auto-message
    if (Number(receiver) === Number(sender)) {
      return res.status(400).json({ error: "You cannot send a message to yourself" });
    }
    // Vérification : contenu non vide
    if (!content || !content.trim()) {
  return res.status(400).json({ error: "Message content cannot be empty" });
}

    // Vérification : receiver existe ?
    const receiverExists = await UserModel.findByPk(receiver);
    if (!receiverExists) {
      return res.status(404).json({ error: "Receiver not found" });
    }

    // Création du message
    const newMessage = await MessageModel.create({
      sender,
      receiver,
      content,
      reply: reply || null,
      channel: null,
      server: null,
    });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


// Récupérer les messages privés entre deux utilisateurs (idUser1 et idUser2)
export async function getPrivateMessages(req, res) {
  try {
    const { idUser1, idUser2 } = req.params;

    const messages = await MessageModel.findAll({
       where: {
    [Op.or]: [
      { sender: Number(idUser1), receiver: Number(idUser2) },
      { sender: Number(idUser2), receiver: Number(idUser1) }
    ]
  },
      include: [
        { model: UserModel, as: 'Sender', attributes: ['id', 'Name', 'DisplayName'] },
        { model: UserModel, as: 'Receiver', attributes: ['id', 'Name', 'DisplayName'] },
      ],
      order: [['createdAt', 'ASC']]
    });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Supprimer un message privé par id
export async function deletePrivateMessage(req, res) {
  try {
    const { id } = req.params;
    const message = await MessageModel.findByPk(id);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    await message.destroy();
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

import MessageModel from "../model/Message/MessageModel.js";
import UserModel from "../model/UserModel.js";
import { Op } from "sequelize";

// Créer un message privé
export async function createPrivateMessage(req, res) {
  try {
    const { receiver, content } = req.body;
    const sender = req.user.id;

    if (!receiver || !content?.trim())
      return res.status(400).json({ error: "receiver and content are required" });

    if (receiver === sender)
      return res.status(400).json({ error: "Cannot send message to self" });

    const receiverExists = await UserModel.findByPk(receiver);
    if (!receiverExists) return res.status(404).json({ error: "Receiver not found" });

    // Créer le message
    const newMessage = await MessageModel.create({ sender, receiver, content });

    // Récupérer le message complet avec infos des utilisateurs
    const fullMessage = await MessageModel.findByPk(newMessage.id, {
      include: [
        { model: UserModel, as: 'Sender', attributes: ['id', 'Name', 'DisplayName'] },
        { model: UserModel, as: 'Receiver', attributes: ['id', 'Name', 'DisplayName'] }
      ]
    });

    const msgToSend = {
      id: fullMessage.id,
      sender: fullMessage.sender,
      receiver: fullMessage.receiver,
      content: fullMessage.content,
      timestamp: fullMessage.createdAt,
      senderDisplayName: fullMessage.Sender?.DisplayName,
      receiverDisplayName: fullMessage.Receiver?.DisplayName
    };

    // Émettre via Socket.IO aux deux utilisateurs
    req.app.locals.io.to(`user_${receiver}`).emit("privateMessage", msgToSend);
    req.app.locals.io.to(`user_${sender}`).emit("privateMessage", msgToSend);

    res.status(201).json(msgToSend);
  } catch (err) {
    console.error("Error creating private message:", err);
    res.status(500).json({ error: err.message });
  }
}

// Récupérer messages privés entre deux utilisateurs
export async function getPrivateMessages(req, res) {
  const { idUser1, idUser2 } = req.params;
  try {
    const messages = await MessageModel.findAll({
      where: {
        [Op.or]: [
          { sender: idUser1, receiver: idUser2 },
          { sender: idUser2, receiver: idUser1 }
        ]
      },
      order: [['createdAt', 'ASC']]
    });

    const formatted = await Promise.all(messages.map(async msg => {
      const sender = await UserModel.findByPk(msg.sender, { attributes: ['DisplayName'] });
      const receiver = await UserModel.findByPk(msg.receiver, { attributes: ['DisplayName'] });
      return {
        id: msg.id,
        sender: msg.sender,
        receiver: msg.receiver,
        content: msg.content,
        timestamp: msg.createdAt,
        senderDisplayName: sender?.DisplayName,
        receiverDisplayName: receiver?.DisplayName
      };
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching private messages:", err);
    res.status(500).json({ error: err.message });
  }
}

// Supprimer un message privé
export async function deletePrivateMessage(req, res) {
  try {
    const { id } = req.params;
    const message = await MessageModel.findByPk(id);
    if (!message) return res.status(404).json({ error: "Message not found" });
    await message.destroy();
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (err) {
    console.error("Error deleting private message:", err);
    res.status(500).json({ error: err.message });
  }
}

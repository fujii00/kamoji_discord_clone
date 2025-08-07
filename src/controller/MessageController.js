import MessageModel from "../model/Message/MessageModel.js";
import { Op } from "sequelize";
import io from "../server/server.js";
 // Assurez-vous que votre serveur WebSocket est correctement importé

// Créer un message
export async function createMessage(req, res) {
    try {
        const { content, channel, server, receiver, reply } = req.body;
        
        // Récupérer l'ID de l'utilisateur connecté depuis le token
        const sender = req.user.id; // Supposant que verifyToken() stocke l'ID dans req.user

        const message = await MessageModel.create({
            content,
            sender, // Utiliser l'ID de l'utilisateur authentifié
            channel,
            server,
            receiver,
            reply,
        });
        return res.status(201).json(message);
    } catch (error) {
        console.error("Erreur lors de la création du message :", error);
        return res.status(500).json({ 
            error: "Erreur serveur",
            details: error.errors?.map(e => e.message) || error.message 
        });
    }
}

// Récupérer un message par ID
export async function getMessageById(req, res) {
    try {
        const { id } = req.params;
        const message = await MessageModel.findByPk(id, {
            include: [
                { association: 'Sender' },
                { association: 'Receiver' },
                { association: 'ParentMessage' },
                { association: 'Replies' },
            ],
        });
        if (!message) {
            return res.status(404).json({ error: "Message non trouvé" });
        }
        return res.status(200).json(message);
    } catch (error) {
        console.error("Erreur lors de la récupération du message :", error);
        return res.status(500).json({ error: "Erreur serveur" });
    }
}

// Mettre à jour un message
export async function updateMessage(req, res) {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const message = await MessageModel.findByPk(id);
        if (!message) {
            return res.status(404).json({ error: "Message non trouvé" });
        }
        await message.updateContent(content);
        return res.status(200).json(message);
    } catch (error) {
        console.error("Erreur lors de la mise à jour du message :", error);
        return res.status(500).json({ error: "Erreur serveur" });
    }
}

// Supprimer un message (soft delete)
export async function deleteMessage(req, res) {
    try {
        const { id } = req.params;
        const message = await MessageModel.findByPk(id);
        if (!message) {
            return res.status(404).json({ error: "Message non trouvé" });
        }
        await message.destroy();
        return res.status(200).json({ message: "Message supprimé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression du message :", error);
        return res.status(500).json({ error: "Erreur serveur" });
    }
}

// Épingler/Désépingler un message
export async function togglePinMessage(req, res) {
    try {
        const { id } = req.params;
        const message = await MessageModel.findByPk(id);
        if (!message) {
            return res.status(404).json({ error: "Message non trouvé" });
        }
        await message.togglePin();
        return res.status(200).json(message);
    } catch (error) {
        console.error("Erreur lors de l'épinglage du message :", error);
        return res.status(500).json({ error: "Erreur serveur" });
    }
}

// Lister les messages (par canal, serveur ou destinataire)
export async function listMessages(req, res) {
    try {
        const { channel, server, receiver } = req.query;
        const where = {};
        if (channel) where.channel = channel;
        if (server) where.server = server;
        if (receiver) where.receiver = receiver;

        const messages = await MessageModel.findAll({
            where,
            include: [
                { association: 'Sender' },
                { association: 'Receiver' },
            ],
            order: [['createdAt', 'DESC']],
        });
        return res.status(200).json(messages);
    } catch (error) {
        console.error("Erreur lors de la récupération des messages :", error);
        return res.status(500).json({ error: "Erreur serveur" });
    }
}

// Récupérer les réponses d'un message
export async function getMessageReplies(req, res) {
    try {
        const { id } = req.params;
        const message = await MessageModel.findByPk(id, {
            include: [
                { association: 'Replies', include: ['Sender'] },
            ],
        });
        if (!message) {
            return res.status(404).json({ error: "Message non trouvé" });
        }
        return res.status(200).json(message.Replies);
    } catch (error) {
        console.error("Erreur lors de la récupération des réponses :", error);
        return res.status(500).json({ error: "Erreur serveur" });
    }
}

// Envoyer un message privé
export async function sendPrivateMessage(req, res) {
  try {
    const { content, receiverId } = req.body;
    const senderId = req.user.id;

    if (senderId === receiverId) {
      return res.status(400).json({ error: "Vous ne pouvez pas vous envoyer un message à vous-même" });
    }

    const message = await MessageModel.create({
      content,
      sender: senderId,
      receiver: receiverId,
      is_private: true // Ajoutez ce champ à votre modèle
    });

    // Émettez l'événement en temps réel (WebSocket/Socket.IO)
    io.to(`user_${receiverId}`).emit('new_message', message);

    return res.status(201).json(message);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

// Récupérer la conversation entre deux utilisateurs
export async function getPrivateConversation(req, res) {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const messages = await MessageModel.findAll({
      where: {
        [Op.or]: [
          {
            sender: currentUserId,
            receiver: userId
          },
          {
            sender: userId,
            receiver: currentUserId
          }
        ]
      },
      order: [['createdAt', 'ASC']],
      include: [
        { association: 'Sender', attributes: ['id', 'username'] },
        { association: 'Receiver', attributes: ['id', 'username'] }
      ]
    });

    return res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

// MessageController.js
export async function sendChannelMessage(req, res) {
    try {
        const { content, channel_id } = req.body;
        const sender_id = req.user.id;

        // Vérifier que le canal existe et appartient à un serveur
        const channel = await ChannelModel.findOne({
            where: { id: channel_id },
            include: [{
                model: ServerModel,
                required: true,
                include: [{
                    model: UserModel,
                    as: 'server_members',
                    where: { id: sender_id }
                }]
            }]
        });

        if (!channel) {
            return res.status(403).json({ 
                error: "Canal introuvable ou vous n'avez pas accès" 
            });
        }

        // Créer le message
        const message = await MessageModel.create({
            content,
            sender: sender_id,
            channel: channel_id,
            server: channel.server_id,
            is_pinned: false
        });

        // Récupérer les détails complets pour l'émission
        const fullMessage = await MessageModel.findByPk(message.id, {
            include: [
                { association: 'Sender', attributes: ['id', 'username'] },
                { association: 'Channel', attributes: ['id', 'name'] }
            ]
        });

        // Diffuser le message à tous les membres du serveur
        req.app.locals.io.to(`server_${channel.server_id}`).emit('new_message', {
            type: 'channel_message',
            message: fullMessage
        });

        return res.status(201).json(fullMessage);
    } catch (error) {
        console.error("Erreur:", error);
        return res.status(500).json({ error: "Erreur serveur" });
    }
}

export async function getChannelMessages(req, res) {
    try {
        const { channel_id } = req.params;
        const user_id = req.user.id;

        // Vérifier l'accès au canal
        const hasAccess = await ChannelModel.findOne({
            where: { id: channel_id },
            include: [{
                model: ServerModel,
                include: [{
                    model: UserModel,
                    as: 'server_members',
                    where: { id: user_id }
                }]
            }]
        });

        if (!hasAccess) {
            return res.status(403).json({ error: "Accès refusé" });
        }

        const messages = await MessageModel.findAll({
            where: { channel: channel_id },
            include: [
                { association: 'Sender', attributes: ['id', 'username'] },
                { association: 'Replies' }
            ],
            order: [['createdAt', 'ASC']]
        });

        return res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erreur serveur" });
    }
}
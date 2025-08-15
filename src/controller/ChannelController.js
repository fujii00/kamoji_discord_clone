import { Sequelize } from "sequelize";
import ChannelModel from "../model/Server/ChannelModel.js";
import ServerModel from "../model/Server/ServerModel.js";
import UserModel from "../model/UserModel.js";

// controllers/ChannelController.js
export const createChannel = async (req, res) => {
    const transaction = await ChannelModel.sequelize.transaction();
    try {
        const { server_id } = req.params;
        const { name, is_voice = false } = req.body;
        const user_id = req.user.id;

        // Validation du nom
        if (!name || name.trim().length < 1 || name.trim().length > 100) {
            await transaction.rollback();
            return res.status(400).json({ error: "Nom du canal invalide (1-100 caractères)" });
        }

        // Vérifier si l'utilisateur est admin
        const server = await ServerModel.findOne({
            where: { id: server_id },
            include: [{
                model: UserModel,
                as: 'server_members',
                where: { id: user_id },
                through: { where: { is_admin: true } },
                required: true
            }]
        });

        if (!server) {
            await transaction.rollback();
            return res.status(403).json({ error: "Permission refusée" });
        }

        // Création du channel avec position sécurisée
        const position = await ChannelModel.count({ where: { server_id }, transaction });
        const channel = await ChannelModel.create({
            name: name.trim(),
            server_id,
            is_voice,
            is_text: !is_voice,
            position
        }, { transaction });

        await transaction.commit();

        // Événement temps réel
        req.app.locals.io.to(`server_${server_id}`).emit('channel_created', channel);

        res.status(201).json(channel);
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

export const getServerChannels = async (req, res) => {
    try {
        const { server_id } = req.params;
        const user_id = req.user.id;

        // Vérifier l'appartenance au serveur
        const server = await ServerModel.findOne({
            where: { id: server_id },
            include: [{
                model: UserModel,
                as: 'server_members',
                where: { id: user_id },
                required: true
            }]
        });

        if (!server) {
            return res.status(403).json({ error: "Accès refusé" });
        }

        const channels = await ChannelModel.findAll({
            where: { server_id },
            order: [['position', 'ASC']]
        });

        res.json(channels);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

export const deleteChannel = async (req, res) => {
    const transaction = await ChannelModel.sequelize.transaction();
    try {
        const { channel_id } = req.params;
        const user_id = req.user.id;

        // Récupérer le channel avec vérification admin
        const channel = await ChannelModel.findOne({
            where: { id: channel_id },
            include: [{
                model: ServerModel,
                include: [{
                    model: UserModel,
                    as: 'server_members',
                    where: { id: user_id },
                    through: { where: { is_admin: true } },
                    required: true
                }]
            }]
        });

        if (!channel) {
            await transaction.rollback();
            return res.status(404).json({ error: "Canal introuvable ou permissions insuffisantes" });
        }

        await channel.destroy({ transaction });
        await transaction.commit();

        req.app.locals.io.to(`server_${channel.server_id}`).emit('channel_deleted', { id: channel_id });

        res.json({ message: "Canal supprimé" });
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

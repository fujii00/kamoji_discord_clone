import ChannelModel from "../model/Server/ChannelModel.js";
import ServerModel from "../model/Server/ServerModel.js";
import UserModel from "../model/UserModel.js";



// controllers/ChannelController.js
export const createChannel = async (req, res) => {
    try {
        const { server_id } = req.params; // Récupéré depuis l'URL
        const { name, is_voice = false } = req.body;
        const user_id = req.user.id;

        // Vérification automatique des permissions
   const server = await ServerModel.findOne({
    where: { id: server_id },
    include: [{
        model: UserModel,
        as: 'server_members',
        through: {
            where: { is_admin: true }
        },
        required: true
    }]
});

        if (!server) {
            return res.status(403).json({ error: "Permission refusée" });
        }

        // Création avec server_id automatique
        const channel = await ChannelModel.create({
            name,
            server_id, // Injecté automatiquement
            is_voice,
            is_text: !is_voice,
            position: await ChannelModel.count({ where: { server_id } })
        });

        // Événement temps réel
        req.app.locals.io.to(`server_${server_id}`).emit('channel_created', channel);

        res.status(201).json(channel);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

export const getServerChannels = async (req, res) => {
    try {
        const { server_id } = req.params;
        const user_id = req.user.id;

        // Vérifier l'appartenance au serveur
        const isMember = await ServerModel.count({
            where: { id: server_id },
            include: [{
                association: 'server_members',
                where: { id: user_id }
            }]
        });

        if (!isMember) {
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
    try {
        const { channel_id } = req.params;
        const user_id = req.user.id;

        const channel = await ChannelModel.findOne({
            where: { id: channel_id },
            include: [{
                model: ServerModel,
                include: [{
                    association: 'server_members',
                    where: { id: user_id },
                    through: { where: { is_admin: true } }
                }]
            }]
        });

        if (!channel) {
            return res.status(404).json({ error: "Canal introuvable ou permissions insuffisantes" });
        }

        await channel.destroy();
        req.app.locals.io.to(`server_${channel.server_id}`).emit('channel_deleted', { id: channel_id });

        res.json({ message: "Canal supprimé" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};
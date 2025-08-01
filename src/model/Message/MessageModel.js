import { DataTypes } from "sequelize";
import sequelize from "../../../config/orm_config.js";
import { DefaultModel } from "../DefaultModel.js";
import UserModel from "../UserModel.js";
import ChannelModel from "../Server/ChannelModel.js";
import ServerModel from "../Server/ServerModel.js";

// Définition du modèle sans les références circulaires immédiates
const MessageModel = sequelize.define('MessageModel', {
    ...DefaultModel,
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    is_pinned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    sender: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    channel: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    server: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    receiver: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    reply: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'messages',
    timestamps: true,
    underscored: true,
    paranoid: true,
    defaultScope: {
        attributes: {
            exclude: []
        }
    },
    scopes: {
        pinned: {
            where: {
                is_pinned: true
            }
        },
        withContent: {
            attributes: ['id', 'content', 'createdAt', 'sender']
        },
        withSender: {
            include: ['Sender']
        },
        withReceiver: {
            include: ['Receiver']
        }
    },
    hooks: {
        beforeUpdate: (message) => {
            message.updatedAt = new Date();
        }
    }
});

// Méthodes d'instance
MessageModel.prototype.togglePin = function() {
    this.is_pinned = !this.is_pinned;
    return this.save();
};

MessageModel.prototype.updateContent = async function(newContent) {
    this.content = newContent;
    return await this.save();
};

// Fonction pour configurer les associations (à appeler après l'initialisation de tous les modèles)
export function setupMessageAssociations(models) {
    MessageModel.belongsTo(models.UserModel, {
        as: 'Sender',
        foreignKey: 'sender'
    });
    
    MessageModel.belongsTo(models.UserModel, {
        as: 'Receiver',
        foreignKey: 'receiver'
    });
    
    MessageModel.belongsTo(models.ChannelModel, {
        foreignKey: 'channel'
    });
    
    MessageModel.belongsTo(models.ServerModel, {
        foreignKey: 'server'
    });
    
    // Auto-référence pour les réponses
    MessageModel.belongsTo(MessageModel, {
        as: 'ParentMessage',
        foreignKey: 'reply'
    });
    
    MessageModel.hasMany(MessageModel, {
        as: 'Replies',
        foreignKey: 'reply'
    });
}

export default MessageModel;


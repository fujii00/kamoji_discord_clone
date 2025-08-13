import { DataTypes } from "sequelize";
import sequelize from "../../../config/orm_config.js";
import { DefaultModel } from "../DefaultModel.js";

import UserModel from "../UserModel.js";          // importer UserModel ici
import ChannelModel from "../Server/ChannelModel.js";  // importer ChannelModel
import ServerModel from "../Server/ServerModel.js";    // importer ServerModel

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

// Associations directement ici, après définition du modèle :
MessageModel.belongsTo(UserModel, {
    as: 'Sender',
    foreignKey: 'sender'
});

MessageModel.belongsTo(UserModel, {
    as: 'Receiver',
    foreignKey: 'receiver'
});

MessageModel.belongsTo(ChannelModel, {
    foreignKey: 'channel'
});

MessageModel.belongsTo(ServerModel, {
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

// Méthodes d'instance (tu peux laisser telles quelles)
MessageModel.prototype.togglePin = function() {
    this.is_pinned = !this.is_pinned;
    return this.save();
};

MessageModel.prototype.updateContent = async function(newContent) {
    this.content = newContent;
    return await this.save();
};

export default MessageModel;

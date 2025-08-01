
import { DataTypes } from "sequelize";
import sequelize from "../../../config/orm_config.js";
import { DefaultModel } from "../DefaultModel.js";


const ChannelModel = sequelize.define('ChannelModel', {
    ...DefaultModel,
    name: {
        type: DataTypes.STRING(45),
        allowNull: false
    },
    subject: {
        type: DataTypes.STRING(25),
        allowNull: true
    },
    restriction: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    permission: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    statut: {
        type: DataTypes.ENUM('active', 'inactive', 'archived', 'restricted'),
        allowNull: false,
        defaultValue: 'active'
    },
    is_voice: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    is_text: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    position: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: 'channels',
    timestamps: true,
    underscored: true,
    paranoid: true, // Pour le soft delete si nécessaire
    defaultScope: {
        where: {
            statut: 'active' // Par défaut, ne montre que les channels actifs
        }
    },
    scopes: {
        withInactive: {
            where: {} // Pour obtenir tous les channels, y compris inactifs
        },
        voiceChannels: {
            where: {
                is_voice: true
            }
        },
        textChannels: {
            where: {
                is_text: true
            }
        }
    }
});

// Méthodes d'instance
ChannelModel.prototype.toggleStatus = function() {
    const statusOrder = ['active', 'inactive', 'archived', 'restricted'];
    const currentIndex = statusOrder.indexOf(this.statut);
    this.statut = statusOrder[(currentIndex + 1) % statusOrder.length];
    return this.save();
};

ChannelModel.prototype.updatePosition = async function(newPosition) {
    this.position = newPosition;
    return await this.save();
};

// Associations
ChannelModel.associate = function(models) {
    ChannelModel.hasMany(models.MessageModel, {
        foreignKey: 'channel',
        as: 'messages'
    });
    
    ChannelModel.belongsToMany(models.UserModel, {
        through: 'ChannelMembers',
        as: 'members',
        foreignKey: 'channel_id'
    });
    
    ChannelModel.belongsTo(models.ServerModel, {
        foreignKey: 'server_id',
        as: 'server'
    });
};

export default ChannelModel;
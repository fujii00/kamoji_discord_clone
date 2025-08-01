import { DataTypes } from "sequelize";

import FileModel from "./FileModel.js";
import MessageModel from "./MessageModel.js";
import sequelize from "../../../config/orm_config.js";

const MessageGalleryModel = sequelize.define('MessageGalleryModel', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    message_id: {
        type: DataTypes.INTEGER,
        references: {
            model: MessageModel,
            key: 'id'
        }
    },
    file_id: {
        type: DataTypes.INTEGER,
        references: {
            model: FileModel,
            key: 'id'
        }
    }
}, {
    tableName: 'message_gallery',
    timestamps: false
});

MessageGalleryModel.associate = function(models) {
    MessageGalleryModel.belongsTo(models.MessageModel, { foreignKey: 'message_id' });
    MessageGalleryModel.belongsTo(models.FileModel, { foreignKey: 'file_id' });
};

export default MessageGalleryModel;


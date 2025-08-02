import { DataTypes } from "sequelize";

import sequelize from "../../../config/orm_config.js";
import { DefaultModel } from "../DefaultModel.js";

const FileModel = sequelize.define('FileModel', {
    ...DefaultModel,
    filename: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    path: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    
    size: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
}, {
    tableName: 'files',
    timestamps: false,
    underscored: true, 
});

FileModel.associate = function(models) {
    FileModel.belongsToMany(models.MessageModel, {
        through: models.MessageGalleryModel,
        as: 'messages',
        foreignKey: 'file_id'
    });
};

export default FileModel;
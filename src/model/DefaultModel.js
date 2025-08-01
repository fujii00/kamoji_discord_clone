import { DataTypes, Sequelize } from "sequelize";

export const DefaultModel = {
    id: {
        type : DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    createdAt:{
            type: DataTypes.DATE,
            allowNull:false,
            defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
        },
    updatedAt:{
            type:DataTypes.DATE,
            allowNull:false,
            defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
        }
    }
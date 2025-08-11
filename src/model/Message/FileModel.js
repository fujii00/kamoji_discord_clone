import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../../../config/orm_config.js";
import UserModel from "../UserModel.js";
import { DefaultModel } from "../DefaultModel.js";


const FileModel  = sequelize.define(
    'FileModel',
    {... DefaultModel,
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        filename: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        size: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        path: {
            type: DataTypes.STRING,
            allowNull: false
        },
        url: {
            type: DataTypes.VIRTUAL,
            get(){
                return `http://localhost:${process.env.PORT}/api${this.path}/${this.filename}`
            }
        }
    },
    {
        tableName: 'files',
        timestamps: false
    }
)



export default FileModel;
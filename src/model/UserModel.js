import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../../config/orm_config.js";
import { DefaultModel } from "./DefaultModel.js";
import { hashPassword } from "../useful/password.js";



const UserModel = sequelize.define('UserModel',{
    ...DefaultModel,
    Name:{
        type: DataTypes.STRING,
        allowNull: false
    },
    DisplayName:{
        type: DataTypes.STRING,
        allowNull:false 
    },
    email: {
        type: DataTypes.STRING,
        allowNull:false,
        unique: true
    },
    contact:{
        type:DataTypes.INTEGER,
        allowNull: true,
    },
    avatar:{
        type:DataTypes.STRING,
        allowNull:true
    },
    bio:{
        type:DataTypes.TEXT,
        allowNull:true
    },
    activity_box:{
        type:DataTypes.TEXT,
        allowNull:true
    },
    note_box:{
        type:DataTypes.STRING,
        allowNull:true
    },
    badge:{
        type:DataTypes.STRING,
        allowNull:true
    },
    statut:{
        type:DataTypes.ENUM('online', 'offline', 'invisible', 'idle'),
        allowNull:false,
        defaultValue:'offline'
    },
    reels:{
      type:DataTypes.STRING,
        allowNull:true
    },
    is_banned:{
        type:DataTypes.BOOLEAN,
        allowNull:true
    },
    gender:{
        type: DataTypes.CHAR,
        allowNull:true,
        defaultValue: 'M'
    },
    code:{
            type: DataTypes.STRING(6),
            allowNull: true,
            unique: true
        },
        expiredAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
    password:{
        type: DataTypes.STRING,
        allowNull:false
    },
    roles:{
        type: DataTypes.JSON,
        allowNull:false,
        defaultValue: ["ROLE_USER"]
    },
    date_of_birth:{
        type: DataTypes.DATE,
        allowNull:false
    }
},{
       tableName: 'users',
       timestamps: false,
       defaultScope: {
               attributes: {exclude: ['password']}
           },
           scopes: {
        withPassword: {attributes: {include: ['password']}},
        withCode: {attributes: {include: ['code', 'expiredAt']}}
    },
           hooks: {
               beforeCreate: async (user, options) => {
                   user.password = await hashPassword(user.password)
               },
               beforeUpdate: async (user, options) => {
                  if (user && user.password && user.changed('password')) user.password = await hashPassword (user.password)
               },
              afterCreate(user, options) {
                    if (user && user.dataValues.password) delete user.dataValues.password
                    if (user && user.dataValues.code) delete user.dataValues.code
                    if (user && user.dataValues.expiredAt) delete user.dataValues.expiredAt
                },
           }  
})

UserModel.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.password;
    delete values.code;
    delete values.expiredAt;
    return values;
}

export default UserModel
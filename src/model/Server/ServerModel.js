import { DataTypes} from "sequelize";
import sequelize from "../../../config/orm_config.js";
import { DefaultModel } from "../DefaultModel.js";
import UserModel from "../UserModel.js";

const ServerModel = sequelize.define('ServerModel',{
    ...DefaultModel,
  title:{
    type: DataTypes.STRING,
    allowNull:false
  },
  icon:{
    type: DataTypes.STRING,
    allowNull:true
  },
  category:{
type: DataTypes.STRING,
    allowNull:true
  },
  bio:{
type: DataTypes.TEXT,
    allowNull:true
  },
  interest:{
type: DataTypes.STRING,
    allowNull:true
  },
  is_verify:{
type: DataTypes.STRING,
    allowNull:true
  },
  icon_banner:{
    type: DataTypes.STRING,
    allowNull:true
  },
  members:{
type: DataTypes.INTEGER,
    allowNull:true
  },
  status_member:{
    type: DataTypes.STRING,
    allowNull:true
  },
  link:{
    type: DataTypes.STRING,
    allowNull:true
  },
  user_id:{
    tableName:'user_id',
     type : DataTypes.INTEGER,
        references: {
            model: UserModel, // Name of the UserModel table
            key: 'id' // Primary key in the UserModel table
        },
        allowNull: true,
  }
},{
       tableName: 'servers',
       timestamps: false,  
})

UserModel.hasMany(ServerModel, {foreignKey:'user_id'})
ServerModel.belongsTo(UserModel, {foreignKey:'user_id'})

export default ServerModel;
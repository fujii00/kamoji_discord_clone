import UserModel from "../src/model/UserModel.js";
import sequelize from "./orm_config.js";
import FileModel from "../src/model/Message/FileModel.js";
import MessageGalleryModel from "../src/model/Message/MessageGallery.js";
import ServerModel from "../src/model/Server/ServerModel.js";
import MessageModel from "../src/model/Message/MessageModel.js";
import ChannelModel from "../src/model/Server/ChannelModel.js";



sequelize.sync({alter: true}).then(() => {
    console.log('Success Migration into my database',)
}).catch(error => console.log('Error Migration', error))
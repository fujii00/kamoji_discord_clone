// import FileModel from "./Message/FileModel.js";
// import MessageGalleryModel from "./Message/MessageGallery.js";
// import MessageModel from "./Message/MessageModel.js";
// import ChannelModel from "./Server/ChannelModel.js";
// import ServerModel from "./Server/ServerModel.js";
// import UserModel from "./UserModel.js";


// // Associations
// MessageModel.belongsTo(UserModel, { as: 'Sender', foreignKey: 'sender' });
// MessageModel.belongsTo(UserModel, { as: 'Receiver', foreignKey: 'receiver' });
// MessageModel.belongsTo(ChannelModel, { foreignKey: 'channel' });
// MessageModel.belongsTo(ServerModel, { foreignKey: 'server' });
// MessageModel.belongsTo(MessageModel, { as: 'ParentMessage', foreignKey: 'reply' });
// MessageModel.hasMany(MessageModel, { as: 'Replies', foreignKey: 'reply' });

// // Many-to-many Message <-> File
// MessageModel.belongsToMany(FileModel, {
//   through: MessageGalleryModel,
//   foreignKey: 'message_id',
//   otherKey: 'file_id',
//   as: 'Files'
// });
// FileModel.belongsToMany(MessageModel, {
//   through: MessageGalleryModel,
//   foreignKey: 'file_id',
//   otherKey: 'message_id',
//   as: 'Messages'
// });

// export {
//   UserModel,
//   FileModel,
//   MessageGalleryModel,
//   MessageModel,
//   ServerModel,
//   ChannelModel
// };

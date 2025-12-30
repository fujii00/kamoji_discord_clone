import UserModel from "../src/model/UserModel.js";
import sequelize from "./orm_config.js";
import FileModel from "../src/model/Message/FileModel.js";
import MessageGalleryModel from "../src/model/Message/MessageGallery.js";
import ServerModel from "../src/model/Server/ServerModel.js";
import MessageModel from "../src/model/Message/MessageModel.js";
import ChannelModel from "../src/model/Server/ChannelModel.js";
import seedUsers from "../src/Seed/seedUser.js";



// sequelize.sync({alter: true}).then(() => {
//     console.log('Success Migration into my database',)
// }).catch(error => console.log('Error Migration', error))

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connexion DB OK");

    // Après la migration
    await seedUsers();

    await sequelize.close();
    console.log("Seed terminé et DB fermée");
  } catch (err) {
    console.error(err);
  }
})();
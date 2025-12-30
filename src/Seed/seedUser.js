import UserModel from "../model/UserModel.js";
import FileModel from "../model/Message/FileModel.js";

const seedUsers = async () => {
  try {
    // Vérifier si un admin existe déjà
    const adminExists = await UserModel.findOne({ where: { email: "krissKamdem0@gmail.com" } });
    if (adminExists) {
      console.log("ℹ️ Admin déjà présent, seed ignoré");
      return;
    }

    // Création des avatars avec les champs obligatoires
    const avatars = await Promise.all([
      FileModel.create({
        url: "http://localhost:7000/api/uploads/users/kris/avatar/file-1755323385332-245494645-Admin.jpg",
        filename: "file-1755281635228-773618013-Admin.jpg",
        size: 7631,
        path: "/uploads/users/kris/avatar"
      }),
      FileModel.create({
        url: "http://localhost:7000/api/uploads/users/kris/avatar/file-1755323426290-690197608-Admin 2.jpg",
        filename: "file-1755280538156-543889115-Admin2.jpg",
        size: 16627,
        path: "/uploads/users/kris/avatar"
      }),
    ]);

    // Création des utilisateurs
    await UserModel.bulkCreate([
      {
        Name: "Allan",
        DisplayName: "K@ries450",
        email: "krissKamdem0@gmail.com",
        password: "K@ries45",   // ⚠️ Mot de passe en clair, hook va le hacher
        roles: ["ROLE_ADMIN"],
        date_of_birth: new Date("1990-01-01"),
        gender: "M",
        avatar: avatars[0].id,
        statut: "online"
      },
      {
        Name: "Bryan",
        DisplayName: "Fujii",
        email: "Fujii@gmail.com",
        password: "Fujii@12",   // ⚠️ idem
        roles: ["ROLE_ADMIN"],
        date_of_birth: new Date("1995-06-15"),
        gender: "M",
        avatar: avatars[1].id,
        statut: "online"
      }
    ], { individualHooks: true }); // important pour que beforeCreate soit appliqué à chacun

    console.log("✅ Seed utilisateurs terminé !");
  } catch (error) {
    console.error("❌ Erreur lors du seed des utilisateurs :", error);
  }
};

export default seedUsers;

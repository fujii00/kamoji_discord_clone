import sequelize from "./orm_config.js";

const testBdConnection = async () => {
    try {
        await sequelize.authenticate()
        console.log("La connection à la base de données fonctionne parfaitement")
    }
    catch (e) {
        console.log("impossible de se connecter à la base de données ;", e)
    }
}

 await testBdConnection()
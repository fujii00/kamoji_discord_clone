import {Sequelize} from "sequelize";
import "./env.js"

const host = process.env.DB_HOST, user = process.env.DB_USER, password = process.env.DB_PASSWORD, dbName = process.env.DB_NAME, port = process.env.DB_PORT

const sequelize = new Sequelize(dbName, user, password, {
    host: host,
    dialect: process.env.DB_DIALECT, // spécifiez le dialecte ici
    port
})

sequelize.addHook('beforeUpdate', async (instance) => {
    instance.updatedAt = new Date()
})

sequelize.addHook("afterCreate", async (instance) => {

    const date = new Date()

    if (instance?.createdAt) instance.createdAt = date
    if (instance?.updatedAt) instance.updatedAt = date
})
export default sequelize
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import UserRouter from "../routes/UserRoute.js";
import authRouter from "../routes/authRoute.js";
import ServerRouter from "../routes/ServerRoute.js";
import fileRoute from "../routes/FileRoute.js";
import path from "node:path";


const server = express();
const corsoptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
};

dotenv.config();

/**MIDDLEWARE GLOBAL */
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(cors(corsoptions));
server.use('/api/uploads', express.static(path.resolve('public/uploads')));

/** ROUTES API*/

server.use("/api/users",UserRouter),
server.use("/api/servers",ServerRouter),
server.use("/api",authRouter)
server.use("/api/files", fileRoute)


server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`); 
});
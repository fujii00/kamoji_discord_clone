
import ServerModel from "../model/Server/ServerModel.js";
import { ROLES } from "../../config/app.js";

export async function getServers(req,res) {
    try {
      const {id,roles} = req.user
      const adminRoles =[ROLES.ADMIN,ROLES.ROOT]
    const options = adminRoles.some(r => roles.includes(r)) 
            ? {} 
            : { where: { user_id: id } }; // Correction ici
        
        const servers = await ServerModel.findAll(options);
        res.json(servers);
      res.json(servers);
}
    catch (error) {
      console.error("Error fetching servers:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
}

export async function getServer(req,res) {
  try{
  const id = req.params.id;
  const server = await ServerModel.findByPk(id);
  if (!server) {
    return res.status(404).json({ error: "server not found" });
  }
 else res.json(server);
  }
  catch (error) {
    console.error("Error fetching server:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function postServers(req, res) {
    try {
        const { title, completed, description = null } = req.body;
        const { id } = req.user; // Récupéré du middleware d'authentification

        const newserver = await ServerModel.create({
            user_id: id, // <-- Correction clé : 'user_id' au lieu de 'userId'
            title,
            completed,
            description
        });

        res.status(201).json(newserver);
    } catch (error) {
        console.error("Error creating server:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}


export async function patchServers(req,res) {
try{
  const id = req.params.id;
  const server = await ServerModel.findByPk(id);
  if (!server) {
    return res.status(404).json({ error: "server not found" });
  }
  await server.update(req.body);
  res.status(202).json(server);
}
catch (error) {
    console.error("Error updating server:", error);
    res.status(500).json({ error: "Internal Server Error" });
}
}

export async function deleteServers(req,res) {
try{
  const id = req.params.id;
  const server = await ServerModel.findByPk(id);
  if (!server) {
    return res.status(404).json({ error: "server not found" });
  }
  await server.destroy();
  res.status(204).json({ message: "server deleted successfully" });
}
catch (error) {
    console.error("Error deleting server:", error);
    res.status(500).json({ error: "Internal Server Error" });
}
}


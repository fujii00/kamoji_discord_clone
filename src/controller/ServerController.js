import ServerModel from "../model/Server/ServerModel.js";
import { ROLES } from "../../config/app.js";

// Récupérer tous les serveurs
export async function getServers(req, res) {
  try {
    const { id, roles } = req.user;
    const adminRoles = [ROLES.ADMIN, ROLES.ROOT,ROLES.USER];

    const options = adminRoles.some(r => roles.includes(r))
      ? {}
      : { where: { user_id: id } };

    const servers = await ServerModel.findAll(options);
    res.json(servers);
  } catch (error) {
    console.error("Error fetching servers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Récupérer un serveur par son ID
export async function getServer(req, res) {
  try {
    const id = req.params.id;
    const server = await ServerModel.findByPk(id);

    if (!server) {
      return res.status(404).json({ error: "Server not found" });
    }

    res.json(server);
  } catch (error) {
    console.error("Error fetching server:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Créer un nouveau serveur
export async function postServers(req, res) {
  try {
    const { title, bio, category, interest, link } = req.body;
    const { id } = req.user;

    const newServer = await ServerModel.create({
      user_id: id,
      title,
      bio,
      category,
      interest,
      link
    });

    res.status(201).json(newServer);
  } catch (error) {
    console.error("Error creating server:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Mettre à jour un serveur
export async function patchServers(req, res) {
  try {
    const id = req.params.id;
    const server = await ServerModel.findByPk(id);

    if (!server) {
      return res.status(404).json({ error: "Server not found" });
    }

    // Vérifier si l'utilisateur est propriétaire ou admin
    const { id: userId, roles } = req.user;
    const adminRoles = [ROLES.ADMIN, ROLES.ROOT];
    if (server.user_id !== userId && !adminRoles.some(r => roles.includes(r))) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await server.update(req.body);
    res.status(202).json(server);
  } catch (error) {
    console.error("Error updating server:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Supprimer un serveur
export async function deleteServers(req, res) {
  try {
    const id = req.params.id;
    const server = await ServerModel.findByPk(id);

    if (!server) {
      return res.status(404).json({ error: "Server not found" });
    }

    // Vérifier si l'utilisateur est propriétaire ou admin
    const { id: userId, roles } = req.user;
    const adminRoles = [ROLES.ADMIN, ROLES.ROOT];
    if (server.user_id !== userId && !adminRoles.some(r => roles.includes(r))) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await server.destroy();
    res.status(204).json({ message: "Server deleted successfully" });
  } catch (error) {
    console.error("Error deleting server:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

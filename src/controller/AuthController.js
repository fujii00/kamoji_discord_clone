import UserModel from "../model/UserModel.js";
import {verifyPassword} from "../useful/password.js";
import {generateToken} from "../useful/jwt.js";


export async function Login(req, res) {
    try {
        const {email, password} = req.body
        const user = await UserModel.scope("withPassword").findOne({where: {email}})

        if (!user) res.status(400).json({message: "Invalid credentials"})

        const validated = await verifyPassword(password, user.password)

        if (!validated) return res.status(400).json("invalid credentials")

        const {id, status, roles} = user.toJSON()

        return res.status(200).json({token: generateToken({id, email, status, roles})})
    }
    catch (e) {
        res.status(500).json({error: e.message ?? "Une erreur est survenue sur le serveur"})
    }
}
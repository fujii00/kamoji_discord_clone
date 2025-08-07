import UserModel from "../model/UserModel.js";
import {generateVerificationCode} from "../useful/helpers.js";
import {sendTemplateEmail} from "../useful/sendMail.js";



export async function getUsers(req, res) {
    try {
        /*const users = await UserModel.findAll()*/
        const users = await UserModel.paginate(({
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10
        }))
             res.status(200).json(users);

    }
    catch (e) {
        res.status(500).json({message: e.message ?? "Une erreur est survenue sur le serveur"})
    }
}

export async function getUsersWithPassword(req, res) {
    try {
        const users = await UserModel.scope("withPassword").findAll()
             res.status(200).json(users);

    }
    catch (e) {
        res.status(500).json({message: e.message ?? "Une erreur est survenue sur le serveur"})
    }
}



export async function postUser(req, res) {
    try {
        const {code, expiredAt} = await generateVerificationCode(6, 1000 * 5 * 60)

        const user =
            await UserModel.create({...req.body, code, expiredAt})

        try {
            await sendTemplateEmail(
                req.body.email,
                "Inscription Sur La Plateforme",
                "welcome",
                {username: `${req.body.Name} ${req.body.DispalyName}`, validatedCode: code}
            )
        }
        catch (e) {

        }
        res.status(201).json(user)
    }
    catch (e) {
        res.status(500)
            .json({message: e.message ?? "Une erreur est survenue sur le serveur"})
    }
}


export async function patchUser(req, res) {
    try {
         const id = req.params.id;
        
        const user = await UserModel.findByPk(id);
        if (!user)
         res.status(404).json({ message: "User not found" });
        
    await user.update(req.body);
        res.status(200).json(user);
    } catch (error) {
         res.status(500).json({ message: error.message });
    }
}

export async function deleteUser (req, res) {
  try {
    const user = await UserModel.findByPk(req.params.id);
    if (!user) 

       res.status(404).json({ message: "User not found" });
    
    await user.destroy(req.body);
     res.status(200).json({ message: "User deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getPeopleUser(req,res){

    try{
        const id = req.params.id;
        const user = await UserModel.findByPk(id);
        if (!user)
             res.status(404).json({message: "User not found"});
        else
            res.status(200).json(user);

    }
    catch(e){
        res.status(500).json({message: e.message ?? "Une erreur est survenue sur le serveur"});

    }
}

// controllers/userController.js
export const getCurrentUser = async (req, res) => {
    try {
        // Vérifie que req.user existe bien (set par le middleware)
        if (!req.user?.id) {
            return res.status(401).json({ error: "Non authentifié" });
        }

        const user = await UserModel.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

export const checkEmail = async (req, res) => {
  try {
    const { code, userId } = req.body;
    
    const user = await UserModel.scope("withCode").findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    if (user.code !== code) {
      return res.status(400).json({ error: "Invalid code" });
    }
    
    if (user.expiredAt < new Date()) {
      return res.status(400).json({ error: "Code expired" });
    }
    
    await user.update({ 
      verified: true,
      code: null,
      expiredAt: null 
    });
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export async function resendCode(req, res) {
    try {
        const {email} = req.body

        const user = await UserModel.findOne({where: {email}})

        if (!user) return  res.status(400).json({message: "Invalid Login"})

        const {code, expiredAt} = await generateVerificationCode(6, 1000 * 5 * 60)

        await user.set({ code, expiredAt, verified: false})

        await user.save()

        return res.status(200).json({message: "ok"})
    }
    catch (e) {
        return res.status(500).json({message: e.message})
    }
}

export async function checkCode(req, res) {
    try {
        const {code, email} = req.body

        const user = await UserModel.scope("withCode").findOne({where: {email}})

        if (!user || user.code !== code) return  res.status(400).json({message: "Invalid Code"})

        if (!user.expiredAt || (new Date()) > user.expiredAt) return  res.status(400).json({message: 'Code Expired'})
        await user.set({verified: true})

        await user.save()

        return res.status(200).json({message: "ok"})
    }
    catch (e) {
        return res.status(500).json({message: e.message})
    }
}


export async function resetPassword(req, res) {
    try {
        const {email} = req.body // const email = req.body.email
        const user = await UserModel.findOne({where: {email}})

        if (!user) return  res.status(400).json({message: "This email doesn't exist in our database"})

        const {code, expiredAt} = await generateVerificationCode(6, 1000 * 5 * 60)

        await user.set({code, expiredAt})

        await user.save()

        try {
            await sendTemplateEmail(
                user.email,
                "Demande de réinitialisation du mot de passe",
                "resetPassword",
                {resetCode: code}
            )
        }
        catch (e) {
            console.log(e.message, "L'erreur lors de l'envoie du mail")
        }

        return res.status(200).json({status: "ok"})
    }
    catch (e) {
        return res.status(500).json({message: e.message})
    }
}

export async function confirmResetPassword(req, res) {
    try {
        const {email, code, password} = req.body

        const user = await UserModel.scope("withCode").findOne({where: {email}})
        
        if (!user || user.code !== code) return  res.status(400).json({message: "Invalid Code"})

        if (!user.expiredAt || (new Date()) > user.expiredAt) return  res.status(400).json({message: 'Code Expired'})

        await user.set({password, code: null, expiredAt: null})

        await user.save()

        try {
            await sendTemplateEmail(
                user.email,
                "Confirmation de réinitialisation du mot de passe",
                "resetPasswordSuccess"
            )
        }
        catch (e) {
            console.log(e.message, "l'erreur lors de l'envoie du mail")
        }

        return res.status(200).json(user)
    }
    catch (e) {
        return res.status(500).json({message: e.message})
    }
}
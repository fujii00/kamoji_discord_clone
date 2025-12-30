import UserModel from "../model/UserModel.js";
import {generateVerificationCode} from "../useful/helpers.js";
import {sendTemplateEmail} from "../useful/sendMail.js";

import paginate from "../useful/paginate.js";
import FileModel from "../model/Message/FileModel.js";

export async function getUsers(req, res) {
  try {
    const users = await paginate(UserModel, {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10
    });
    res.json(users);
  } catch (e) {
    res.status(500).json({
      message: e.message ?? "Une erreur est survenue sur le serveur"
    });
  }
}

export async function getAllUsers(req, res) {
  try {
    const users = await UserModel.findAll(); // récupère tous les utilisateurs
    res.json(users);
  } catch (e) {
    res.status(500).json({
      message: e.message ?? "Une erreur est survenue sur le serveur"
    });
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
    const { DisplayName, Name, email, phone, password, avatar, date_of_birth } = req.body;

    try {
        const { code, expiredAt } = await generateVerificationCode(6, 1000 * 5 * 60);

        const user = await UserModel.create({
            DisplayName,
            Name,
            email,
            phone,
            password,
            code,
            expiredAt,
            avatar,
            date_of_birth
        });

        // 🔹 Recharger avec l'association pour avoir file.url
        const fullUser = await UserModel.findByPk(user.id, {
            include: [{ model: FileModel, as: 'file' }]
        });

        try {
            await sendTemplateEmail(
                email,
                "Inscription Sur La Plateforme",
                "welcome",
                { username: `${Name} ${DisplayName}`, validatedCode: code }
            );
        } catch (e) {
            console.log(e.message, "as message");
        }

        res.status(201).json(fullUser);
    } catch (e) {
        res.status(500).json({ message: e.message ?? "Une erreur est survenue sur le serveur" });
    }
}





export async function patchUser(req, res) {
  try {
    const id = req.params.id;

    let user = await UserModel.findByPk(id, {
      include: [{ model: FileModel, as: 'file' }]
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Champs autorisés
    const allowedFields = ['DisplayName', 'bio', 'activity_box'];
    const updates = {};
    for (let key of allowedFields) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    // Avatar
    if (req.file) {
      const file = await FileModel.create({
        filename: req.file.filename,
        size: req.file.size,
        path: '/uploads', // ajouter le path
        userId: id
      });
      updates.avatar = file.id;
    }

    // Mettre à jour l'utilisateur
    await user.update(updates);

    // Recharger avec avatar
    user = await UserModel.findByPk(id, {
      include: [{ model: FileModel, as: 'file' }]
    });

    // Retourner JSON avec URL avatar directement depuis FileModel
    const userData = {
      ...user.toJSON(),
      url: user.file ? user.file.url : null
    };

    return res.status(200).json(userData);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || 'Server error' });
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

export async function getCurrentUser(req, res){

    try{
        const {id} = req.user;
        console.log(id);
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

export async function checkEmail(req, res) {
    try {
        const {code} = req.body, {id} = req.user

        const user = await UserModel.scope("withCode").findByPk(id)

        if (!user) return  res.status(400).json({message: 'Invalid Code'})

        if (user.code !== code) return  res.status(400).json({message: 'Invalid Code'})

        if (!user.expiredAt || (new Date()) > user.expiredAt) return  res.status(400).json({message: 'Code Expired'})

        await user.set({code: null, expiredAt: null, status: true})

        await user.save()

        try {
            await sendTemplateEmail(
                user.email,
                "Activation du compte",
                "congratulation",
                {username: `${user.Name} ${user.DisplayName}`}
            )
        }
        catch (e) {

        }

        return res.status(200).json(user)
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
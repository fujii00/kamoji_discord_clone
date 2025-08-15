import express from "express";
import {
    getUsers,
    getUsersWithPassword,
    patchUser,
    postUser,
    deleteUser,
    getPeopleUser,
    getCurrentUser,
    checkEmail, resetPassword, confirmResetPassword,
    checkCode,
    getAllUsers
} from "../controller/UserController.js";
import { isGrantedAccess } from "../middleware/auth.js";
import { parseIdParam } from "../middleware/parseIdParam.js";
import { ROLES } from "../../config/app.js";
import validate from "../middleware/validate.js";
import {
    resetPasswordSchema,
    sendCodeResetSchema,
    userDefaultSchema,
    validatedCodeSchema
} from "../schema/userSchema.js";
import upload from "../middleware/upload.js";


const UserRouter= express.Router();

UserRouter.get("/", getUsers)
UserRouter.get("/All",getAllUsers)
UserRouter.get("/all", getUsersWithPassword)

UserRouter.get("/me", isGrantedAccess([ROLES.USER]), getCurrentUser)

UserRouter.get("/:id", parseIdParam, getPeopleUser)

UserRouter.post("/add", validate(userDefaultSchema), postUser)
UserRouter.post("/forgot_password", validate(sendCodeResetSchema), resetPassword)
UserRouter.post('/check_code', checkCode)
UserRouter.post("/reset_password", validate(resetPasswordSchema()), confirmResetPassword)
UserRouter.post("/check_email", isGrantedAccess([ROLES.USER]), validate(validatedCodeSchema()), checkEmail)
UserRouter.patch("/:id", upload.single("avatar") ,patchUser)
UserRouter.delete("/:id", deleteUser)

export default UserRouter;
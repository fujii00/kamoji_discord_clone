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
    checkCode
} from "../controller/userController.js";
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


const UserRouter= express.Router();

UserRouter.get("/", getUsers)
UserRouter.get("/all", getUsersWithPassword)

UserRouter.get("/me", isGrantedAccess([ROLES.USER]), getCurrentUser)

UserRouter.get("/:id", parseIdParam, getPeopleUser)

UserRouter.post("/add", validate(userDefaultSchema), postUser)
UserRouter.post("/reset_password", validate(sendCodeResetSchema), resetPassword)
UserRouter.post('/check_code', checkCode)
UserRouter.post("/confirm_reset_password", validate(resetPasswordSchema()), confirmResetPassword)
UserRouter.post("/check_email", isGrantedAccess([ROLES.USER]), validate(validatedCodeSchema()), checkEmail)
UserRouter.patch("/:id", patchUser)
UserRouter.delete("/:id", deleteUser)

export default UserRouter;
import express from 'express';

import { parseIdParam } from '../middleware/parseIdParam.js';
import { isGrantedAccess } from '../middleware/auth.js';
import { ROLES } from "../../config/app.js";
import { deleteServers, getServer, getServers, patchServers, postServers } from '../controller/ServerController.js';

const ServerRouter= express.Router();

ServerRouter.get('/',isGrantedAccess([ROLES.USER,ROLES.ADMIN]),getServers);

ServerRouter.get('/:id',parseIdParam,getServer);

ServerRouter.post('/add', isGrantedAccess([ROLES.USER]), postServers);

ServerRouter.patch('/:id', parseIdParam, patchServers);

ServerRouter.delete('/:id', parseIdParam,deleteServers);

export default ServerRouter;
import express from 'express';
import {
    createChannel,
    getServerChannels,
    deleteChannel
} from '../controller/ChannelController.js';
import { isGrantedAccess } from '../middleware/auth.js';
import { ROLES } from '../../config/app.js';


const Channelrouter = express.Router();

Channelrouter.post('/servers/:server_id/add', isGrantedAccess([ROLES.USER]), createChannel);
Channelrouter.get('/server/:server_id', isGrantedAccess([ROLES.USER,ROLES.ADMIN]), getServerChannels);
Channelrouter.delete('/:channel_id',isGrantedAccess([ROLES.USER]), deleteChannel);

export default Channelrouter;
import express from "express";
import upload from "../middleware/upload.js";
import {patchSingle, postMultiple, postSingle} from "../controller/FileController.js";

const fileRoute = express.Router()

fileRoute.post("/add", upload.single('file'), postSingle)

fileRoute.post('/multiple/add', upload.array('files'), postMultiple)

fileRoute.patch("/:id", upload.single('file'), patchSingle)


export default fileRoute
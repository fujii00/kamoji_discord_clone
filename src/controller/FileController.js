import {getPlural} from "../useful/helpers.js";
import {existsSync, mkdirSync} from "node:fs";
import {rename, unlink} from "node:fs/promises"
import FileModel from "../model/Message/FileModel.js";
import fileModel from "../model/Message/FileModel.js";


export async function postSingle(req, res) {
    try {
        const folders = ['', 'uploads']
        if (req.body.model) folders.push(getPlural(req.body.model))
        if (req.body.name) folders.push(req.body.name)
        if (req.body.context) folders.push(req.body.context)


        const path = folders.join('/')

        if (folders.length > 2) {
            const fullPath = `public${path}`

            if (!existsSync(fullPath)) {
                mkdirSync(fullPath, { recursive: true });
            }

            await rename(
                `public/uploads/${req.file.filename}`,
                `${fullPath}/${req.file.filename}`
            )

        }

        const file = await fileModel.create({
            filename: req.file.filename,
            path,
            size: req.file.size
        })

        return res.status(201).json(file)
    }
    catch (e) {
        await unlink(`public/uploads/${req.file.filename}`)

        return res.status(500).json({message: e.message})
    }
}

export async function patchSingle(req, res) {
    const {id} = req.params
    const file = await FileModel.findByPk(id)
    if (!file) {
        await unlink(`public/uploads/${req.file.filename}`)
        return res.status(404).json({message: "Not Found"})
    }
    const filename = req.file.filename
    const size = req.file.size
    const fullPath = `public${file.path}`

    await rename(
        `public/uploads/${req.file.filename}`,
        `${fullPath}/${req.file.filename}`
    )

    await unlink(`${fullPath}/${file.filename}`)

    await file.set({filename, size})

    await file.save()

    return res.status(200).json(file)
}

export async function postMultiple(req, res) {
    const folders = ['', 'uploads']
    if (req.body.model) folders.push(getPlural(req.body.model))
    if (req.body.name) folders.push(req.body.name)
    if (req.body.context) folders.push(req.body.context)
    const path = folders.join('/')
    const fullPath = `public${path}`
    if (!existsSync(fullPath)) {
        mkdirSync(fullPath, { recursive: true });
    }
    const promises = req.files.map(async uploadedFile => {
        if (folders.length > 2) {
            await rename(
                `public/uploads/${uploadedFile.filename}`,
                `${fullPath}/${uploadedFile.filename}`
            )

        }

        return await fileModel.create({
            filename: uploadedFile.filename,
            path,
            size: uploadedFile.size
        })
    })

    return res.status(201).json(promises)
}
require('colors')
require('dotenv').config()

const path = require('path')
const fs = require('fs')

const { response } = require("express")
const cloudinary = require('cloudinary').v2
cloudinary.config(process.env.CLOUDINARY_URL)

const { uploadFiles } = require("../helpers")
const { User, Product } = require('../models')


const uploadFile = async (req, res = response) => {
    try {
        // const allowedExtensions = ['md', 'pdf', 'txt']
        const dir = 'images'
        const name = await uploadFiles(req.files, undefined, dir)
        return res.json({ name })
    } catch (error) {
        return res.status(400).json({ msg: error })
    }
}


const switchCollections = (collection = '', id = '', res = response) => {
    return new Promise(async (resolve, reject) => {
        let model
        switch (collection) {
            case 'users':
                model = await User.findById(id)
                if (!model) return reject({ error: `No existe un usuario con el id ${id}`, status: 401 })
                break;
            case 'products':
                model = await Product.findById(id)
                if (!model) return reject({ error: `No existe un producto con el id ${id}`, status: 401 })
                break;

            default: return reject({ error: 'Categoria sin validar', status: 500 })
        }
        resolve(model)
    })
}


const updateImage = async (req, res = response) => {
    const { collection, id } = req.params

    try {
        const model = await switchCollections(collection, id)

        if (model.image) {
            const pathImage = path.join(__dirname, '../uploads', collection, model.image)
            if (fs.existsSync(pathImage)) fs.unlinkSync(pathImage)
        }

        model.image = await uploadFiles(req.files, undefined, collection)
        await model.save()
        res.json(model)
    } catch ({ error, status }) {
        return res.status(status).json({ msg: error })
    }
}


const updateImageCloudinary = async (req, res = response) => {
    const { collection, id } = req.params

    try {
        const model = await switchCollections(collection, id)

        if (model.image) {
            const nameSplit = model.image.split('/')
            const name = nameSplit[nameSplit.length - 1]
            const [ public_id ] = name.split('.')
            await cloudinary.uploader.destroy(public_id)
        }

        const { tempFilePath } = req.files.file
        const { secure_url } = await cloudinary.uploader.upload(tempFilePath)
        model.image = secure_url

        await model.save()
        res.json(model)
    } catch ({ error, status }) {
        return res.status(status).json({ msg: error })
    }
}


const showImage = async (req, res = response) => {
    const { collection, id } = req.params

    try {
        const model = await switchCollections(collection, id)

        if (model.image) {
            const pathImage = path.join(__dirname, '../uploads', collection, model.image)
            if (fs.existsSync(pathImage)) return res.sendFile(pathImage)
        }
    } catch ({ error, status }) {
        return res.status(status).json({ msg: error })
    }

    const pathNotImage = path.join(__dirname, '../assets', `no-image.jpg`)
    if (fs.existsSync(pathNotImage)) return res.sendFile(pathNotImage)
}



module.exports = {
    uploadFile,
    updateImage,
    updateImageCloudinary,
    showImage
}
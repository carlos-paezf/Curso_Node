require('colors')
const { response } = require("express")

const { Category } = require('../models')


const categoriesGet = async (req, res = response) => {
    const { limit = 5, from = 0 } = req.query
    const query = { status: true }

    const [total, categories] = await Promise.all([
        Category.countDocuments(query),
        Category.find(query)
            .populate({
                path: 'user',
                select: 'name'
            })
            .skip(Number(from))
            .limit(Number(limit))
    ])

    res.json({
        total,
        categories,
        from,
        limit
    })
}


const categoryGetByID = async (req, res = response) => {
    const { id } = req.params

    const category = await Category.findById(id)
        .populate({
            path: 'user',
            select: 'name'
        })

    res.json({
        category
    })
}


const categoryPost = async (req, res = response) => {
    const name = req.body.name.toUpperCase()
    const categoryDB = await Category.findOne({ name })

    try {
        if (categoryDB) return res.status(401).json({ msg: `La categoría ${categoryDB.name} ya existe` })

        const data = {
            name,
            user: req.userAuth._id
        }

        const category = new Category(data)
        category.save()

        res.status(201).json({
            msg: 'Category POST',
            category
        })
    } catch (error) {
        console.log(`Error: `.red)
        throw new Error(error)
    }
}


const categoryPutByID = async (req, res = response) => {
    const { id } = req.params
    const { status, user, ...data } = req.body
    data.name = data.name.toUpperCase()
    data.user = req.userAuth._id

    const category = await Category.findByIdAndUpdate(id, data, { new: true })
        .populate({
            path: 'user',
            select: 'name email'
        })

    res.json({
        id,
        category
    })
}


const categoryTotalDeleteByID = async (req, res = response) => {
    const { id } = req.params

    const category = await Category.findByIdAndDelete(id)
        .populate({
            path: 'user',
            select: 'name email'
        })
    const userAuth = req.userAuth

    res.json({
        category,
        userAuth
    })
}


const categoryPartialDeleteByID = async (req, res = response) => {
    const { id } = req.params

    const category = await Category.findByIdAndUpdate(id, { status: false })
        .populate({
            path: 'user',
            select: 'name email'
        })
    const userAuth = req.userAuth

    res.json({
        category,
        userAuth
    })
}


module.exports = {
    categoriesGet,
    categoryGetByID,
    categoryPost,
    categoryPutByID,
    categoryTotalDeleteByID,
    categoryPartialDeleteByID
}

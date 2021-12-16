require('colors')
const { response } = require('express')
const { ObjectId } = require('mongoose').Types

const { User, Category, Product } = require('../models')


const allowedCollections = [
    'users',
    'roles',
    'categories',
    'products'
]


const searchUsers = async (term = '', res = response) => {
    try {
        const isMongoId = ObjectId.isValid(term)
        if (isMongoId) {
            const user = await User.findById(term)
            return res.json({
                results: user ? [user] : []
            })
        }

        const regex = new RegExp(term, 'i')

        const [total, users] = await Promise.all([
            User.count({
                $or: [{ name: regex }, { email: regex }],
                $and: [{ status: true }]
            }),
            User.find({
                $or: [{ name: regex }, { email: regex }],
                $and: [{ status: true }]
            })
        ])

        return res.json({
            total,
            results: users
        })
    } catch (error) {
        console.log(`Error: `.red)
        throw new Error(error)
    }
}


const searchCategories = async (term = '', res = response) => {
    try {
        const isMongoId = ObjectId.isValid(term)
        if (isMongoId) {
            const category = await Category.findById(term).populate({
                path: 'user',
                select: 'name email'
            })
            return res.json({
                results: category ? [category] : []
            })
        }

        const regex = new RegExp(term, 'i')

        const [total, categories] = await Promise.all([
            Category.count({ name: regex, status: true }),
            Category.find({ name: regex, status: true }).populate({
                path: 'user',
                select: 'name email'
            })
        ])

        return res.json({
            total,
            results: categories
        })
    } catch (error) {
        console.log(`Error: `.red)
        throw new Error(error)
    }
}


const searchProducts = async (term = '', res = response) => {
    try {
        const isMongoId = ObjectId.isValid(term)
        if (isMongoId) {
            const product = await Product.findById(term).populate('user', 'name').populate('category', 'name')
            return res.json({
                results: product ? [product] : []
            })
        }

        const regex = new RegExp(term, 'i')

        const [total, products] = await Promise.all([
            Product.count({ name: regex, status: true }),
            Product.find({ name: regex, status: true }).populate('user', 'name').populate('category', 'name')
        ])

        return res.json({
            total,
            results: products
        })
    } catch (error) {
        console.log(`Error: `.red)
        throw new Error(error)
    }
}


const search = (req, res = response) => {
    const { collection, term } = req.params

    if (!allowedCollections.includes(collection)) return res.status(400).json({ msg: `Las colecciones permitidas son ${allowedCollections}` })

    switch (collection) {
        case 'users': searchUsers(term, res); break;
        case 'categories': searchCategories(term, res); break;
        case 'products': searchProducts(term, res); break;
        default: res.status(500).json({ msg: 'Búsqueda no controlada' }); break;
    }
    res.json({
        msg: 'Buscar',
        collection,
        term
    })
}


module.exports = {
    search
}

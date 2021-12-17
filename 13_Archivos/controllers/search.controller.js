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


const searchUsers = (term = '') => {
    let res
    return new Promise(async (resolve, reject) => {
        try {
            const isMongoId = ObjectId.isValid(term)
            if (isMongoId) {
                const user = await User.findById(term)
                res = {
                    results: user ? [user] : []
                }
                return resolve(res)
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

            res = {
                total,
                results: users
            }

            return resolve(res)
        } catch (error) {
            console.log(`Error: `.red)
            return reject({ error, status: 500 })
        }
    })
}


const searchCategories = (term = '') => {
    let res
    return new Promise(async (resolve, reject) => {
        try {
            const isMongoId = ObjectId.isValid(term)
            if (isMongoId) {
                const category = await Category.findById(term).populate({
                    path: 'user',
                    select: 'name email'
                })
                res = {
                    results: category ? [category] : []
                }
                return resolve(res)
            }

            const regex = new RegExp(term, 'i')

            const [total, categories] = await Promise.all([
                Category.count({ name: regex, status: true }),
                Category.find({ name: regex, status: true }).populate({
                    path: 'user',
                    select: 'name email'
                })
            ])

            res = {
                total,
                results: categories
            }

            return resolve(res)
        } catch (error) {
            console.log(`Error: `.red)
            return reject({ error, status: 500 })
        }
    })

}


const searchProducts = (term = '') => {
    let res
    return new Promise(async (resolve, reject) => {
        try {
            const isMongoId = ObjectId.isValid(term)
            if (isMongoId) {
                const product = await Product.findById(term)
                    .populate('user', 'name')
                    .populate('category', 'name')
                res = {
                    results: product ? [product] : []
                }
                return resolve(res)
            }

            const regex = new RegExp(term, 'i')

            const [total, products] = await Promise.all([
                Product.count({ name: regex, status: true }),
                Product.find({ name: regex, status: true })
                    .populate('user', 'name')
                    .populate('category', 'name')
            ])

            res = {
                total,
                results: products
            }
            return resolve(res)
        } catch (error) {
            console.log(`Error: `.red)
            return reject({ error, status: 500 })
        }
    })
}


const search = async (req, res = response) => {
    const { collection, term } = req.params

    if (!allowedCollections.includes(collection)) return res.status(400).json({ msg: `Las colecciones permitidas son ${allowedCollections}` })

    let results

    try {
        switch (collection) {
            case 'users': results = await searchUsers(term); break;
            case 'categories': results = await searchCategories(term); break;
            case 'products': results = await searchProducts(term); break;
            default: res.status(500).json({ msg: 'Búsqueda no controlada' }); break;
        }
        return res.json(results)
    } catch ({ error, status }) {
        console.log(error)
        res.status(status).json(error)
    }
}


module.exports = {
    search
}

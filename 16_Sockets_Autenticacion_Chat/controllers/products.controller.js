require('colors')
const { response } = require("express")

const { Product, Category } = require('../models')


const productsGet = async (req, res = response) => {
    const { limit = 5, from = 0 } = req.query
    const query = { status: true }

    const [total, products] = await Promise.all([
        Product.countDocuments(query),
        Product.find(query)
            .populate({
                path: 'user',
                select: 'name'
            })
            .populate('category', 'name')
            .skip(Number(from))
            .limit(Number(limit))
    ])

    res.json({
        total,
        products,
        from,
        limit
    })
}


const productGetByID = async (req, res = response) => {
    const { id } = req.params

    const product = await Product.findById(id)
        .populate({
            path: 'user',
            select: 'name'
        })
        .populate('category', 'name')

    res.json({
        product
    })
}


const productPost = async (req, res = response) => {
    const name = req.body.name.toUpperCase()
    const { status, user, ...rest } = req.body
    
    const productDB = await Product.findOne({ name })

    try {
        if (productDB) return res.status(401).json({ msg: `El producto ${productDB.name} ya existe` })

        const data = {
            name,
            rest,
            user: req.userAuth._id
        }

        const product = new Product(data)
        product.save()

        res.status(201).json({
            msg: 'product POST',
            product
        })
    } catch (error) {
        console.log(`Error: `.red)
        throw new Error(error)
    }
}


const productPutByID = async (req, res = response) => {
    const { id } = req.params
    const { status, user, ...data } = req.body

    if (data.name) data.name = data.name.toUpperCase()
    data.user = req.userAuth._id

    const product = await Product.findByIdAndUpdate(id, data, { new: true })
        .populate({
            path: 'user',
            select: 'name email'
        })
        .populate('category', 'name')

    res.json({
        id,
        product
    })
}


const productTotalDeleteByID = async (req, res = response) => {
    const { id } = req.params

    const product = await Product.findByIdAndDelete(id)
        .populate({
            path: 'user',
            select: 'name email'
        })
        .populate('category', 'name')
    const userAuth = req.userAuth

    res.json({
        product,
        userAuth
    })
}


const productPartialDeleteByID = async (req, res = response) => {
    const { id } = req.params

    const product = await Product.findByIdAndUpdate(id, { status: false })
        .populate({
            path: 'user',
            select: 'name email'
        })
        .populate('category', 'name')
    const userAuth = req.userAuth

    res.json({
        product,
        userAuth
    })
}


module.exports = {
    productsGet,
    productGetByID,
    productPost,
    productPutByID,
    productTotalDeleteByID,
    productPartialDeleteByID
}

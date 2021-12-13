const { request, response } = require('express')
const bcryptjs = require('bcryptjs')
const { validationResult } = require('express-validator')

const User = require('../models/user')


const usersGet = async (req = request, res = response) => {
    const { limit = 5, from = 0 } = req.query
    const query = { status: true }

    const [total, users] = await Promise.all([
        User.countDocuments(query),
        User.find(query)
            .skip(Number(from))
            .limit(Number(limit))
    ])

    res.json({
        total,
        users,
        from,
        limit
    })
}


const usersPost = async (req, res = response) => {
    const { name, email, password, role } = req.body
    const user = new User({ name, email, password, role })

    const salt = bcryptjs.genSaltSync()
    user.password = bcryptjs.hashSync(password, salt)

    await user.save()

    res.json({
        msg: 'post data to API - controller',
        user
    })
}


const usersPut = async (req, res = response) => {
    const { id } = req.params
    const { _id, password, google, email, role, ...resto } = req.body

    if (password) {
        const salt = bcryptjs.genSaltSync()
        resto.password = bcryptjs.hashSync(password, salt)
    }

    const user = await User.findByIdAndUpdate(id, resto)

    res.json({
        msg: 'put data to API - controller',
        id,
        user
    })
}


const usersTotalDelete = async (req, res = response) => {
    const { id } = req.params

    const user = await User.findByIdAndDelete(id)

    res.json({
        msg: 'total delete data from API - controller',
        user
    })
}


const usersPartialDelete = async (req, res = response) => {
    const { id } = req.params

    const user = await User.findByIdAndUpdate(id, { status: false })

    res.json({
        msg: 'partial delete data from API - controller',
        user
    })
}


module.exports = {
    usersGet,
    usersPost,
    usersPut,
    usersTotalDelete,
    usersPartialDelete
}
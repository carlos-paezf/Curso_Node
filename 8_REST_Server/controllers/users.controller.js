const { request, response } = require('express')


const usersGet = (req = request, res = response) => {
    const { q, nombre = 'No Name', apikey, page = 1, limit = 10 } = req.query
    res.json({
        msg: 'get data from API - controller',
        q,
        nombre,
        apikey,
        page, 
        limit
    })
}

const usersPost = (req, res = response) => {
    const body = req.body
    res.json({
        msg: 'post data to API - controller',
        body
    })
}

const usersPut = (req, res = response) => {
    const { id } = req.params
    res.json({
        msg: 'put data to API - controller',
        id
    })
}

const usersDelete = (req, res = response) => res.json({ msg: 'delete data from API - controller' })


module.exports = {
    usersGet,
    usersPost,
    usersPut,
    usersDelete
}
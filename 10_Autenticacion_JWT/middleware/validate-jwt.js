require('dotenv').config()
const { response, request } = require('express');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const SECRET_KEY = process.env.SECRET_KEY


const validateJWT = async (req = request, res = response, next) => {
    const token = req.header('x-token')
    if (!token) return res.status(4001).json({ msg: "No hay token en la petición" })

    try {
        const { uid } = jwt.verify(token, SECRET_KEY)
        req.uid = uid

        const userAuth = await User.findById(uid)
        if (!userAuth) return res.status(401).json({ msg: "Token no valido - Usuario no existe" })
        if (!userAuth.status) return res.status(401).json({ msg: "Token no valido - Usuario status=false" })
        req.userAuth = userAuth

        next()
    } catch (error) {
        console.log('Error: '.red, error)
        res.status(401).json({ msg: "Token no valido" })
    }
}


module.exports = {
    validateJWT
}

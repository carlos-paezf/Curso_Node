require('dotenv').config()
require('colors')
const jwt = require('jsonwebtoken')

const SECRET_KEY = process.env.SECRET_KEY


const generateJWT = (uid = '') => {
    return new Promise((resolve, reject) => {
        const payload = { uid }
        jwt.sign(payload, SECRET_KEY, {
            expiresIn: '2h'
        }, (err, token) => {
            if (err) {
                console.log('Error: '.red, err)
                reject('No se pudo generar un token')
            } else {
                resolve(token)
            }
        })
    })
}


module.exports = {
    generateJWT
}
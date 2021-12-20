require('dotenv').config()
const jwt = require('jsonwebtoken')

const { User } = require('../models')


const verifyJWT = async (token = '') => {
    try {
        if (token.length < 10) return null
        const { uid } = jwt.verify(token, process.env.SECRET_KEY)
        const user = await User.findById(uid)
        if (user) {
            if (user.status) return user
            else return null
        }
        else return null
    } catch (error) {
        return null
    }
}


module.exports = {
    verifyJWT
}

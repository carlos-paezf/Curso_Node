require('colors')
const { request, response } = require('express')
const bcryptjs = require('bcryptjs')

const User = require('../models/user')
const { generateJWT } = require('../helpers/generate-jwt')


const login = async (req, res = response) => {
    const { email, password } = req.body

    try {
        const user = await User.findOne({ email })
        if (!user) return res.status(400).json({ msg: "Email / Password incorrectos - Email" })
        if (!user.status) return res.status(400).json({ msg: "Email / Password incorrectos - Status" })

        const validPassword = bcryptjs.compareSync(password, user.password)
        if (!validPassword) return res.status(400).json({ msg: "Email / Password incorrectos - Password" })

        const token = await generateJWT(user.id)

        res.json({
            msg: 'Login ok',
            user,
            token
        })
    } catch (error) {
        console.log('ERROR: '.red, error)
        return res.status(500).json({
            msg: 'Hable con el administrador'
        })
    }
}


module.exports = {
    login
}
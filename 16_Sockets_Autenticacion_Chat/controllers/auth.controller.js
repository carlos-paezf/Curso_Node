require('colors')
const { request, response } = require('express')
const bcryptjs = require('bcryptjs')

const User = require('../models/user')
const { generateJWT } = require('../helpers/generate-jwt')
const { googleVerify } = require('../helpers/google-verify')


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


const googleSignIn = async (req, res = response) => {
    const { id_token } = req.body

    try {
        const { name, image, email } = await googleVerify(id_token)

        let user = await User.findOne({ email })
        if (!user) {
            const data = {
                name,
                email,
                password: 'En espera de cambios',
                image,
                role: 'USER_ROlE',
                google: true
            }
            user = new User(data)
            await user.save()
        }

        if (!user.status) return res.status(401).json({ msg: 'Usuario bloqueado, habla con el administrador' })

        const token = await generateJWT(user.id)

        res.json({
            msg: 'Google Sign In, Ok',
            id_token,
            user,
            token
        })
    } catch (error) {
        console.log('Error: '.red, error)
        res.status(400).json({ msg: 'El token no se pudo verificar' })
    }
}


const renewToken = async (req, res = response) => {
    const { userAuth } = req
    const token = await generateJWT(userAuth.id)
    res.json({
        userAuth,
        token
    })
}


module.exports = {
    login,
    googleSignIn,
    renewToken
}
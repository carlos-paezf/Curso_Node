const { Router } = require('express')
const { check } = require('express-validator')

const { login, googleSignIn, renewToken } = require('../controllers')
const { validateFields, validateJWT } = require('../middleware')

const router = Router()


router.post('/login', [
    check('email', 'El correo es obligatorio').not().isEmpty(),
    check('email', 'Debe ingresar un correo valido').isEmail(),
    check('password', 'La contraseña es obligatoria').not().isEmpty(),
    validateFields
], login)

router.post('/google', [
    check('id_token', 'El id_token de Google es necesario').not().isEmpty(),
    validateFields
], googleSignIn)

router.get('/', validateJWT, renewToken)

module.exports = router
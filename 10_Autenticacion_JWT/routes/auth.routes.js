const { Router } = require('express')
const { check } = require('express-validator')
const { login } = require('../controllers/auth.controller')
const { validateFields } = require('../middleware/validate-fields')

const router = Router()


router.post('/login', [
    check('email', 'El correo es obligatorio').not().isEmpty(),
    check('email', 'Debe ingresar un correo valido').isEmail(),
    check('password', 'La contraseña es obligatoria').not().isEmpty(),
    validateFields
], login)


module.exports = router
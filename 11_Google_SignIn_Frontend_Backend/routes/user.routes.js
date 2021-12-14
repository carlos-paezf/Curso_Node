const { Router } = require('express')
const { check } = require('express-validator')
const { usersGet, usersPost, usersPut, usersTotalDelete, usersPartialDelete } = require('../controllers/users.controller')

const { validRole, emailExists, userExistsByID } = require('../helpers/db-validators')
const { validateFields, validateJWT, validateAdminRole, hasRole } = require('../middleware')

const router = Router()


router.get('/', usersGet)

router.post('/', [
    check('name', 'El nombre es obligatorio').not().isEmpty(),
    check('email', 'El correo no es valido').isEmail(),
    check('password', 'La contraseña debe tener más de 6 letras').isLength({min: 6}),
    check('email').custom(emailExists),
    check('role').custom(validRole),
    validateFields
], usersPost)

router.put('/:id', [
    check('id', 'No es un id valido').isMongoId(),
    check('id').custom(userExistsByID),
    check('role').custom(validRole),
    validateFields
], usersPut)

router.delete('/total-delete/:id', [
    validateJWT,
    validateAdminRole,
    check('id', 'No es un id valido').isMongoId(),
    check('id').custom(userExistsByID),
    validateFields
], usersTotalDelete)

router.delete('/partial-delete/:id', [
    validateJWT,
    hasRole('ADMIN_ROLE', 'SALES_ROLE', 'OTHER_ROLE'),
    check('id', 'No es un id valido').isMongoId(),
    check('id').custom(userExistsByID),
    validateFields
], usersPartialDelete)



module.exports = router
const { Router } = require('express')
const { check } = require('express-validator')

const { categoriesGet, categoryGetByID, categoryPost, categoryPutByID, categoryTotalDeleteByID, categoryPartialDeleteByID } = require('../controllers/categories.controller')
const { categoryExistsByID } = require('../helpers/db-validators')
const { validateJWT, validateFields, hasRole, validateAdminRole } = require('../middleware')

const router = Router()


router.get('/', categoriesGet)

router.get('/:id', [
    check('id', 'No es un id de mongo valido').isMongoId(),
    check('id').custom(categoryExistsByID),
    validateFields
], categoryGetByID)

router.post('/', [
    validateJWT,
    check('name', 'El nombre de la categoría es requerido').not().isEmpty(),
    validateFields
], categoryPost)

router.put('/:id', [
    validateJWT,
    hasRole('ADMIN_ROLE', 'SALES_ROLE'),
    check('id', 'No es un id de mongo valido').isMongoId(),
    check('id').custom(categoryExistsByID),
    check('name', 'El nombre de la categoría es requerido').not().isEmpty(),
    validateFields
], categoryPutByID)

router.delete('/total-delete/:id', [
    validateJWT,
    validateAdminRole,
    check('id', 'No es un id de mongo valido').isMongoId(),
    check('id').custom(categoryExistsByID),
    validateFields
], categoryTotalDeleteByID)

router.delete('/partial-delete/:id', [
    validateJWT,
    hasRole('ADMIN_ROLE', 'SALES_ROLE'),
    check('id', 'No es un id de mongo valido').isMongoId(),
    check('id').custom(categoryExistsByID),
    validateFields
], categoryPartialDeleteByID)


module.exports = router
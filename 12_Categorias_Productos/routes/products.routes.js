const { Router } = require('express')
const { check } = require('express-validator')

const { productsGet, productGetByID, productPost, productPutByID, productTotalDeleteByID, productPartialDeleteByID } = require('../controllers/products.controller')
const { productExistsByID, categoryExistsByID } = require('../helpers/db-validators')
const { validateJWT, validateFields, hasRole, validateAdminRole } = require('../middleware')

const router = Router()


router.get('/', productsGet)

router.get('/:id', [
    check('id', 'No es un id de mongo valido').isMongoId(),
    check('id').custom(productExistsByID),
    validateFields
], productGetByID)

router.post('/', [
    validateJWT,
    check('name', 'El nombre del producto es requerido').not().isEmpty(),
    check('category', 'El id de la categoria no es un id de mongo valido').isMongoId(),
    check('category').custom(categoryExistsByID),
    validateFields
], productPost)

router.put('/:id', [
    validateJWT,
    hasRole('ADMIN_ROLE', 'SALES_ROLE'),
    check('id', 'No es un id de mongo valido').isMongoId(),
    check('id').custom(productExistsByID),
    check('category', 'El id de la categoria no es un id de mongo valido').isMongoId(),
    check('category').custom(categoryExistsByID),
    validateFields
], productPutByID)

router.delete('/total-delete/:id', [
    validateJWT,
    validateAdminRole,
    check('id', 'No es un id de mongo valido').isMongoId(),
    check('id').custom(productExistsByID),
    validateFields
], productTotalDeleteByID)

router.delete('/partial-delete/:id', [
    validateJWT,
    hasRole('ADMIN_ROLE', 'SALES_ROLE'),
    check('id', 'No es un id de mongo valido').isMongoId(),
    check('id').custom(productExistsByID),
    validateFields
], productPartialDeleteByID)


module.exports = router
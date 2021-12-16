const { Router } = require('express')
const { check } = require('express-validator')

const { uploadFile, updateImage, showImage, updateImageCloudinary } = require('../controllers')
const { allowedCollections } = require('../helpers')
const { validateFields, validateJWT, hasRole, validateFile, validateAdminRole } = require('../middleware')

const router = Router()


router.post('/', [
    validateFile,
    validateJWT, 
    validateAdminRole
], uploadFile)

router.put('/local/:collection/:id', [
    validateFile,
    validateJWT,
    hasRole('ADMIN_ROLE', 'SALES_ROLE', 'USER_ROLE'),
    check('id', 'El id es requerido').not().isEmpty(),
    check('id', 'No es un id de Mongo').isMongoId(),
    check('collection').custom(collection => allowedCollections(collection, ['users', 'products'])),
    validateFields
], updateImage)


router.put('/cloudinary/:collection/:id', [
    validateFile,
    validateJWT,
    hasRole('ADMIN_ROLE', 'SALES_ROLE', 'USER_ROLE'),
    check('id', 'El id es requerido').not().isEmpty(),
    check('id', 'No es un id de Mongo').isMongoId(),
    check('collection').custom(collection => allowedCollections(collection, ['users', 'products'])),
    validateFields
], updateImageCloudinary)


router.get('/:collection/:id', [
    check('id', 'El id es requerido').not().isEmpty(),
    check('id', 'No es un id de Mongo').isMongoId(),
    check('collection').custom(collection => allowedCollections(collection, ['users', 'products', 'as'])),
    validateFields
], showImage)


module.exports = router
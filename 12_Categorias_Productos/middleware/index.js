const validateFields = require('../middleware/validate-fields')
const validateJWT = require('../middleware/validate-jwt')
const validateRole = require('../middleware/validate-role')


module.exports = {
    ...validateFields,
    ...validateJWT,
    ...validateRole
}
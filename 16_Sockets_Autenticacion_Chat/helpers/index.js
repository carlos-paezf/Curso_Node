const dbValidators = require('./db-validators')
const generateJWT = require('./generate-jwt')
const googleVerify = require('./google-verify')
const uploadFile = require('./upload-files')
const verifyJWT = require('./verify-jwt')


module.exports = {
    ...dbValidators,
    ...generateJWT,
    ...googleVerify,
    ...uploadFile,
    ...verifyJWT
}
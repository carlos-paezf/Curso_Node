const path = require('path')
const { v4: uuidv4 } = require('uuid')


const uploadFiles = async (files, allowedExtensions = ['png', 'jpg', 'jpeg', 'gif'], dir = '') => {
    return new Promise((resolve, reject) => {
        const { file } = files

        const nameSplit = file.name.split('.')
        const extension = nameSplit[nameSplit.length - 1]

        if (!allowedExtensions.includes(extension)) return reject(`La extensión ${extension} no es permitida. Extensiones permitidas: ${allowedExtensions}`)

        const tempName = uuidv4() + '.' + extension

        const uploadPath = path.join(__dirname, '../uploads', dir, tempName)

        file.mv(uploadPath, (err) => {
            if (err) return reject(err)
            resolve(tempName)
        })
    })
}


module.exports = {
    uploadFiles
}
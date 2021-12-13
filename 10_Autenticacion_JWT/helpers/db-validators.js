const Role = require('../models/role')
const User = require('../models/user')


const validRole = async (role = '') => {
    const roleExists = await Role.findOne({ role })
    if (!roleExists) throw new Error(`El rol ${role} no está registrado en la base de datos`)
}


const emailExists = async (email) => {
    const emailExists = await User.findOne({ email })
    if (emailExists) throw new Error(`El correo ${email} ya está registrado en la base de datos`)
}


const userExistsByID = async (id) => {
    const userExists = await User.findById(id)
    if (!userExists) throw new Error(`El usuario con id ${id} no está registrado en la base de datos`)
}


module.exports = {
    validRole,
    emailExists,
    userExistsByID
}
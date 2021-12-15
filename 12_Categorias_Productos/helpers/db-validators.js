const { User, Role, Category, Product } = require('../models')


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
    if (!userExists.status) throw new Error(`El usuario con id ${id} está suspendido en la base de datos`)
}


const categoryExistsByID = async (id) => {
    const categoryExists = await Category.findById(id)
    if (!categoryExists) throw new Error(`La categoría con id ${id} no está registrada en la base de datos`)
    if (!categoryExists.status) throw new Error(`La categoría con id ${id} está suspendida en la base de datos`)
}


const productExistsByID = async (id) => {
    const productExists = await Product.findById(id)
    if (!productExists) throw new Error(`El producto con id ${id} no está registrada en la base de datos`)
    if (!productExists.status) throw new Error(`El producto con id ${id} está suspendida en la base de datos`)
}

module.exports = {
    validRole,
    emailExists,
    userExistsByID,
    categoryExistsByID,
    productExistsByID
}
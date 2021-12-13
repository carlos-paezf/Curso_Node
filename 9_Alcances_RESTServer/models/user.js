const { Schema, model } = require('mongoose')


const UserSchema = Schema({
    name: {
        type: String,
        required: [true, 'El nombre es requerido']
    },
    email: {
        type: String,
        required: [true, 'El email es requerido'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'La contraseña es requerida']
    },
    image: {
        type: String
    },
    role: {
        type: String,
        required: [true, 'El rol es requerido'],
        emun: ['ADMIN_ROLE', 'USER_ROLE']
    },
    status: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
})


UserSchema.methods.toJSON = function() {
    const { __v, password, ...user} = this.toObject()
    return user
}


module.exports = model('User', UserSchema)
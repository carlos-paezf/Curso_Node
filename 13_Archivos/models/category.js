const { Schema, model } = require('mongoose')


const CategorySchema = Schema({
    name: {
        type: String,
        required: [true, 'El nombre de la categoría es obligatoria'],
        unique: true
    },
    status: {
        type: Boolean,
        default: true,
        required: true
    },
    user: {
        type: Schema.Types.ObjectID,
        ref: 'User',
        required: true
    }
})


CategorySchema.methods.toJSON = function() {
    const { __v, status, _id, ...category} = this.toObject()
    category.id_category = _id
    return category
}


module.exports = model('Category', CategorySchema)
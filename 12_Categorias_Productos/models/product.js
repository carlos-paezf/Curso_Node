const { Schema, model } = require('mongoose')


const ProductSchema = Schema({
    name: {
        type: String,
        required: [true, 'El nombre del producto es requerido'],
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
    },
    unitPrice: {
        type: Number,
        default: 0
    },
    category: {
        type: Schema.Types.ObjectID,
        ref: 'Category',
        required: [true, 'La categoría del producto es requerida']
    },
    description: {
        type: String
    },
    available: {
        type: Boolean,
        default: true
    }
})


ProductSchema.methods.toJson = function() {
    const { __v, _id, ...product } = this.toObject()
    product.id_product = _id
    return product
}


module.exports = model('Product', ProductSchema)
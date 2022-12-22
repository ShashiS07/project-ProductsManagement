const mongoose=require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId

const cartSchema= new mongoose.Schema({
    userId: {
        type: ObjectId,
        ref: 'user',
        require: true,
        unique: true
    },
    items: [{
        productId: {
            type: ObjectId,
            ref: 'product',
            require: true
        },
        quantity: {
            type: Number,
            require: true,
            default: 1
        },
        _id: false
    }],
    totalPrice: {
        type: Number,
        require: true
    },
    totalItems: {
        type: Number,
        require: true
    }
}, { timestamps: true })

module.exports = mongoose.model('cart', cartSchema)

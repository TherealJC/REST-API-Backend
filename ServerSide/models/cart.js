const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartSchema = new Schema({
    accountId: {
        type: Schema.Types.ObjectId, ref: 'Account'
    },
    items: [{
        productId: {
            type: Schema.Types.ObjectId, ref: 'Product'
        },
        quantity: {
            type: Number
        },
        lineTotal: {
            type: Number
        }
    }],
    totalPrice: {
        type: Number
    }
});

const Cart = mongoose.model('cart', CartSchema);
module.exports = Cart;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    accountId: {
        type: Schema.Types.ObjectId, ref: 'Account',
    },
    customerId: {
        type: Schema.Types.ObjectId, ref: 'Customer',
    },
    cartId: {
        type: Schema.Types.ObjectId, ref: 'Cart',
    },
    totalPrice: {
        type: Number
    },
    orderStatus: {
        type: String
    }
},
    {
        timestamps: true,
    }
);
const Order = mongoose.model('order', OrderSchema);
module.exports = Order;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CustomerSchema = new Schema({
    accountId: {
        type: Schema.Types.ObjectId, ref: 'Account'
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    contactNo: {
        type: String
    },
    streetNo: {
            type: String
    },
    streetName: {
        type: String
    },
    city: {
        type: String
    },
    postcode: {
        type: String
    }
});

const Customer = mongoose.model('customer', CustomerSchema);
module.exports = Customer;
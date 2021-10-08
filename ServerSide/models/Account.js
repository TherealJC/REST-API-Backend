const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const AccountSchema = new Schema({
    username: {
        type: String
    },
    password: {
        type: String
    },
    email: {
        type: String
    },
    admin: {
        type: Boolean,
        default: false
    },
},
{
    timestamps: true,
  }
);

AccountSchema.methods.isValidPassword = async function(password) {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        throw error;
    }
};

const Account = mongoose.model('account', AccountSchema);
module.exports = Account;
// These controllers are called when a customer based store routes are accessed
const { authSchema, customerSchema, orderSchema, categorySchema } = require('../configs/validationSchema');
const createError = require('http-errors');
const Account = require('../models/account');
const Category = require('../models/category'); // import Category model
const Product = require('../models/product');
const Customer = require('../models/customer');
const Cart = require('../models/cart');
const Order = require('../models/order');
const mongoose = require('mongoose');

module.exports =
{
    getAllProducts: async (req, res, next) => {
        try {
            const allProducts = await Product.find({})
            res.send({ allProducts })
        } catch (error) {
            next(error)
        }
    },
    viewSingleProduct: async (req, res, next) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {throw createError.Conflict('Product ID is not in the correct format')};
            const requestedProduct = await Product.findById(req.params.id)
            if (!requestedProduct) { throw createError.Conflict('ProductID not found, product does not exist')};

            res.send({ requestedProduct })

        } catch (error) {
            next(error)
        }
    },
    getAllCategories: async (req, res, next) => {
        try {
            const allCategories = await Category.find({})
            res.send({ allCategories })
        } catch (error) {
            next(error)
        }
    },
    viewItemsByCategory: async (req, res, next) => {
        try {
            const result = await categorySchema.validateAsync(req.body);
            const name = result.name
            const matchingProducts = await Product.find({ category: name })
            if(!matchingProducts[0]) throw createError.Conflict("Category does not exist")
            res.send({ matchingProducts })
        } catch (error) {
            next(error)
        }
    },
    postCustomerDetails: async (req, res, next) => {
        try {
            if (!req.headers['authorization']) return next(createError.Unauthorized())
            const result = await customerSchema.validateAsync(req.body)
            const { firstName, lastName, contactNo, streetNo, streetName, city, postcode } = result
            const accountId = req.payload.aud;

            const customerRecordsExist = await Customer.findOne({ accountId: accountId })
            if (customerRecordsExist) { throw createError.Conflict('Account already has customer records, please Update (PUT) instead of posting') }

            Customer.create({ accountId: accountId, firstName, lastName, contactNo, streetNo, streetName, city, postcode })
                .then(function (customer) {
                    res.send({ customer })
                })
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            next(error)
        }
    },
    getCustomerDetails: async (req, res, next) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {throw createError.Conflict('Customer ID is not in the correct format')};
            const requestedCustomer = await Customer.findById(req.params.id)
            if (!requestedCustomer) { throw createError.Conflict('CustomerID does not exist/no records net')};

            res.send({ requestedCustomer })

        } catch (error) {
            next(error)
        }
    },
    editCustomerDetails: async (req, res, next) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {throw createError.Conflict('Customer ID is not in the correct format')};
            const requestedCustomer = await Customer.findById(req.params.id)
            if (!requestedCustomer) { throw createError.Conflict('CustomerID does not exist/no records yet')};

            const result = await customerSchema.validateAsync(req.body)

            Customer.findByIdAndUpdate({ _id: req.params.id }, result)
                .then(function () {
                    Customer.findOne({ _id: req.params.id }).then(function (customer) {
                        res.send(customer);
                    })
                })
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            next(error)
        }
    },
    deleteCustomerDetails: async (req, res, next) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {throw createError.Conflict('Customer ID is not in the correct format')};
            const requestedCustomer = await Customer.findById(req.params.id)
            if (!requestedCustomer) { throw createError.Conflict('CustomerID does not exist/no records net')};

            await Customer.findByIdAndRemove({ _id: req.params.id })
                .then(function (customer) {
                    res.send(`'Deleted Customer records:' ${customer}`);
                })
        } catch (error) { next(error) }
    },

    editAccount: async (req, res, next) => {
        try {      
            const accountExists = await Account.findById(req.payload.aud)
            if (!accountExists) throw createError.Conflict("Account does not exist")

            const result = await authSchema.validateAsync(req.body)

            Account.findByIdAndUpdate({ _id: req.payload.aud }, result)
                .then(function () {
                    Account.findOne({ _id: req.payload.aud }).select('-admin').then(function (account) {
                        res.send(account);
                    })
                })
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            next(error)
        }
    },
    deleteAccount: async (req, res, next) => {
        try {
            const accountExists = await Account.findById(req.payload.aud)
            if (!accountExists) throw createError.Conflict("Account does not exist")

            await Account.findByIdAndRemove({ _id: req.payload.aud })
                .then(function (account) {
                    res.send(`'Deleted Account:' ${account}`);
                })
        } catch (error) { next(error) }
    },
    addItemToCart: async (req, res, next) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {throw createError.Conflict('Invalid on non-existing productId')};
            const exists = await Product.findById(req.params.id)
            if (!exists) { throw createError.Conflict('Product not found, product does not exist in the database')};

            const id = req.payload.aud; const pId = req.params.id
            await Cart.find({ accountId: id }).then(async function (carts) { // get users cart
                const currentCart = carts[carts.length - 1];

                const a = await Product.find({ _id: pId }).select('price -_id') // get product price
                const b = a[0].price

                const existingProductIndex = currentCart.items.findIndex(p => p.productId == pId);
                if (existingProductIndex >= 0) { // if exists already, update
                    const existingProduct = currentCart.items[existingProductIndex];
                    existingProduct.quantity += 1;
                    existingProduct.lineTotal += b;
                } else { // if doesn't exist, push new item
                    currentCart.items.push({ productId: pId, quantity: 1, lineTotal: b })
                }
                currentCart.totalPrice += b;
                
                Cart.findByIdAndUpdate({ _id: currentCart._id }, currentCart) // update db
                    .then(function () {
                        Cart.findOne({ _id: currentCart._id }).then(function (result) {
                            res.send(result);
                    })
                })
            })
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            next(error)
        }
    },
    removeItemFromCart: async (req, res, next) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {throw createError.Conflict('Invalid on non-existing productId')};
            const exists = await Product.findById(req.params.id)
            if (!exists) { throw createError.Conflict('Product not found, product does not exist in the database')};
            
            const id = req.payload.aud; const pId = req.params.id
            await Cart.find({ accountId: id }).then(async function (carts) { // get users cart
                const currentCart = carts[carts.length - 1];

                const a = await Product.find({ _id: pId }).select('price -_id'); // get product price
                const b = a[0].price;

                const existingProductIndex = currentCart.items.findIndex(p => p.productId == pId); // get obj at index where matching product Id
                if (existingProductIndex <= -1) { throw createError.Conflict("Item does not exist in cart" )};
                const existingProduct = currentCart.items[existingProductIndex];

                if (existingProduct.quantity <= 1) {
                    currentCart.items.splice(existingProductIndex, 1); console.log('Removing item from cart')
                } else {
                    existingProduct.quantity -= 1; existingProduct.lineTotal -= b; console.log('Reducing product quantity by 1')
                }
                currentCart.totalPrice -= b;
                
                Cart.findByIdAndUpdate({ _id: currentCart._id }, currentCart) // update db
                    .then(function () {
                        Cart.findOne({ _id: currentCart._id }).then(function (result) {
                            res.send(result);
                    })
                })
            })
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            next(error)
        }
    },
    currentCartDetails: async (req, res, next) => {
        const id = req.payload.aud;
        await Cart.find({ accountId: id }).then(async function (carts) {
            const currentCart = carts[carts.length - 1]; // * USERS CART
            const pIdArray = await currentCart.items.reduce((a, { productId }) => a.concat(productId), []);
            await Product.find({ _id: pIdArray }).then(async function (products) { // * PRODUCTS IN CART
                res.send({ currentCart, products })
            })
        })
    },

    placeOrder: async (req, res, next) => {
        try {
            const id = req.payload.aud;
            const carts = await Cart.find({ accountId: id });
            const currentCart = carts[carts.length - 1]; // * USERS CART
            const cartId = currentCart._id; const s = currentCart.totalPrice;

            const customer = await Customer.find({ accountId: id });
            if (customer[0] == null) throw createError.Conflict("Customer must register their details before making an order");
            const customerId = customer[0]._id;

            const cartRecord = await Cart.findById(cartId)
            const getProductIds = cartRecord.items.reduce((a, { productId }) => a.concat(productId), []);
            if (getProductIds[0] == null) { throw createError.Conflict('Cart is empty !') }

            Order.create({ accountId: id, customerId: customerId, cartId: cartId, totalPrice: s,  orderStatus: 'Created'})
                .then(function (order) {
                    Cart.create({accountId: id, items: [], totalPrice: 0}) // Fresh cart
                    res.send(order)
                })
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            next(error)
        }
    },
    getSingleOrder: async (req, res, next) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {throw createError.Conflict('Order ID is not in the correct format')};
            const requestedOrder = await Order.findById(req.params.id)
            if (!requestedOrder) { throw createError.Conflict('OrderID does not exist/no records yet')};

            const order = await Order.findOne({ _id: req.params.id })
            .populate('customerId', 'accountId firstName lastName contactNo streetNo streetName city postcode', Customer)
            .populate('cartId', 'items', Cart)

            const pIdArray = await order.cartId.items.reduce((a, { productId }) => a.concat(productId), []);
            await Product.find({ _id: pIdArray }).then(async function (products) { // * PRODUCTS IN CART
                res.send({ order, products })
            })
        } catch (error) {
            next(error)
        }
    },
    getAllOrders: async (req, res, next) => {
        try {
            if (!req.headers['authorization']) return next(createError.Unauthorized())
            const id = req.payload.aud;
            const allOrders = await Order.find({ accountId: id })
            .populate('customerId', 'accountId firstName lastName contactNo streetNo streetName city postcode', Customer)
            .populate('cartId', 'items', Cart)
            res.send({ allOrders })
        } 
        catch (error) {
             next(error)
        }
    }
}
// These controllers are called when an admin shop based route is accessed
const { adminAuthSchema, categorySchema, productSchema, customerSchema, cartSchema, orderSchema } = require('../configs/validationSchema');         //for Joi validation
const createError = require('http-errors');   
const Account = require('../models/account');
const Category = require('../models/category');
const Product = require('../models/product');
const Customer = require('../models/customer');
const Cart = require('../models/cart');
const Order = require('../models/order');
const mongoose = require('mongoose');

module.exports = {

    getAllAccounts: async (req, res, next) => {
        try {
            const allAccounts = await Account.find({})
            res.send({ allAccounts })

        } catch (error) {
            next(error)
        }
    },
    getSingleAccount: async (req, res, next) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {throw createError.Conflict('Account ID is not in the correct format')};
            const exists = await Account.findById(req.params.id)
            if (!exists) { throw createError.Conflict('Account ID not found, account does not exist')};

            const account = await Account.findOne({_id: req.params.id})
            res.send({ account })

        } catch (error) {
            next(error)
        }
    },
    editAccount: async (req, res, next) => {
        try {
            const result = await adminAuthSchema.validateAsync(req.body)
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {throw createError.Conflict('accountId entered is not a valid _id format')}

            const accExists = await Account.findById(req.params.id)
            if (!accExists) { throw createError.Conflict('accountId not found, account does not exist')}

            Account.findByIdAndUpdate({ _id: req.params.id }, result)
            .then(function () {
                Account.findOne({ _id: req.params.id }).then(function (account) {
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
            const accountExists = await Account.findById(req.params.id)
            if (!accountExists) throw createError.Conflict("Account does not exist")

            await Account.findByIdAndRemove({_id: req.params.id})
            .then(function(account){
                res.send(`'Deleted Account:' ${account}`);
            })
        } catch (error) {next(error)}
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
    addNewCategory: async (req, res, next) => {
        try {
            const result = await categorySchema.validateAsync(req.body);
            const name = result.name

            const categoryExists = await Category.findOne({ name: name })
            if (categoryExists) throw createError.Conflict(`'${name}' Category already exists`)

            Category.create({ name }).then(function(category) {
                res.send(category)
            })

        } catch (error) {
            if (error.isJoi === true) error.status = 422
            next(error)
        }
    },
    editCategory: async (req, res, next) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {throw createError.Conflict('Category ID is not in the correct format')};
            const exists = await Category.findById(req.params.id)
            if (!exists) { throw createError.Conflict('CategoryID not found, category does not exist')};

            const result = await categorySchema.validateAsync(req.body)

            Category.findByIdAndUpdate({ _id: req.params.id }, result)
            .then(function () {
                Category.findOne({ _id: req.params.id }).then(function (category) {
                    res.send(category);
                })
            })
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            next(error)
        }
    },
    deleteCategory: async (req, res, next) => {
        try {
            const categoryExists = await Category.findById(req.params.id)
            if (!categoryExists) throw createError.Conflict("Category does not exist")

            await Category.findByIdAndRemove({_id: req.params.id})
            .then(function(category){
                res.send(`'Deleted Category:' ${category}`)
            })
        } catch (error) {next(error)}
    },

    getAllProducts: async (req, res, next) => {
        try {
            const allProducts = await Product.find({})
            res.send({ allProducts })

        } catch (error) {
            next(error)
        }
    },
    getSingleProduct: async (req, res, next) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {throw createError.Conflict('Product ID is not in the correct format')};
            const exists = await Product.findById(req.params.id)
            if (!exists) { throw createError.Conflict('Product ID not found, product does not exist')};

            res.send({ exists })

        } catch (error) {
            next(error)
        }
    },
    createNewProduct: async (req, res, next) => {
        try {
            const result = await productSchema.validateAsync(req.body)
            const { name, price, category, description } = result;

            const productExists = await Product.findOne({ name: name })
            if (productExists) throw createError.Conflict(`'${name}' Product already exists`)

            const validCategory = await Category.findOne({name: category})
            if (!validCategory) throw createError.Conflict('Category entered does not exist')

            Product.create({ name, price, category, description }).then(function(product) {
                res.send(product)
            })
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            next(error)
        }
    },
    editProduct: async (req, res, next) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {throw createError.Conflict('Product ID is not in the correct format')};
            const exists = await Product.findById(req.params.id)
            if (!exists) { throw createError.Conflict('ProductID not found, product does not exist')};

            const result = await productSchema.validateAsync(req.body)
            const validCategory = await Category.findOne({name: result.category})
            if (!validCategory) throw createError.Conflict('Category entered does not exist')

            Product.findByIdAndUpdate({ _id: req.params.id }, result)
            .then(function () {
                Product.findOne({ _id: req.params.id }).then(function (product) {
                    res.send(product);
                })
            })
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            next(error)
        }
    },
    deleteProduct: async (req, res, next) => {
        try {
            const productExists = await Product.findById(req.params.id)
            if (!productExists) throw createError.Conflict("Product does not exist")

            await Product.findByIdAndRemove({_id: req.params.id})
            .then(function(product){
                res.send(`'Deleted Product:' ${product}`);
            })
        } catch (error) {next(error)}
    },

    getAllCustomers: async (req, res, next) => {
        try {
            const allCustomers = await Customer.find({})
            res.send({ allCustomers })

        } catch (error) {
            next(error)
        }
    },
    getSingleCustomer: async (req, res, next) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {throw createError.Conflict('Customer ID is not in the correct format')};
            const exists = await Customer.findById(req.params.id)
            if (!exists) { throw createError.Conflict('Customer ID not found, customer does not exist')};

            res.send({ exists })

        } catch (error) {
            next(error)
        }
    },
    createNewCustomer: async (req, res, next) => {
        try {
            const result = await customerSchema.validateAsync(req.body)
            const { accountId, firstName, lastName, contactNo, streetNo, streetName, city, postcode } = result

            if (!mongoose.Types.ObjectId.isValid(accountId)) {
            throw createError.Conflict('accountId entered is not a valid _id format')}

            const doesCustomerHaveAccount = await Account.findById(accountId)
            if (!doesCustomerHaveAccount) { throw createError.Conflict('accountId not found, account does not exist')}

            const customerRecordsExist = await Customer.findOne({accountId: accountId})
            if (customerRecordsExist) { throw createError.Conflict('Account already has customer records, please Update (PUT) instead of posting')}

            Customer.create({ accountId, firstName, lastName, contactNo, streetNo, streetName, city, postcode })
            .then(function(customer) {
                res.send(customer)
            })
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            next(error)
        }
    },
    editCustomer: async (req, res, next) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {throw createError.Conflict('Customer ID is not in the correct format')};
            const exists = await Customer.findById(req.params.id)
            if (!exists) { throw createError.Conflict('CustomerID not found, customer record does not exist')};

            const result = await customerSchema.validateAsync(req.body)

            if (!mongoose.Types.ObjectId.isValid(result.accountId)) {throw createError.Conflict('Account ID is not a real id')};

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
    deleteCustomer: async (req, res, next) => {
        try {
            const customerExists = await Customer.findById(req.params.id)
            if (!customerExists) throw createError.Conflict("Customer does not exist")

            await Customer.findByIdAndRemove({_id: req.params.id})
            .then(function(customer){
                res.send(`'Deleted Customer:' ${customer}`);
            })
        } catch (error) {next(error)}
    },

    getAllCarts: async (req, res, next) => {
        try {
            const allCarts = await Cart.find({}).populate('items.productId', 'name price category description', Product)
            res.send({ allCarts })

        } catch (error) {
            next(error)
        }
    },
    createNewCart: async (req, res, next) => {
        try {
            const result = await cartSchema.validateAsync(req.body)
            var { accountId, items, totalPrice } = result; 

            if (!mongoose.Types.ObjectId.isValid(accountId)) {
            throw createError.Conflict('accountId entered is not a valid _id format')}
            const doesCustomerHaveAccount = await Account.findById(accountId)
            if (!doesCustomerHaveAccount) { throw createError.Conflict("accountId not found, account must exist to have a cart")}

            const pIdArray = await items.reduce((a, { productId }) => a.concat(productId), []);
            const pQtyArray = await items.reduce((a, { quantity }) => a.concat(quantity), []);

            for(var i = 0; i < pIdArray.length - 1; i++){
                for(var j = i + 1; j < pIdArray.length; j++){
                    if(pIdArray[i] == pIdArray[j]){
                        throw createError.Conflict("Not Allowed: 2 matching productIds")}}};

            await Product.find({ _id: pIdArray }).then(async function (products) {
                if (!products[0]) { throw createError.Conflict("Incorrect ProductID, product doesnt exist")};
                const pricesArray = await products.reduce((a, { price }) => a.concat(price), []);

                var sum = 0; var itemTotal = 0; var arrayOfLineTotal = [] // * Calculate total
                pricesArray.forEach(function (itemsPrice, index) {
                    itemsQuantity = pQtyArray[index];
                    itemTotal = itemsQuantity * itemsPrice;
                    sum = sum + itemTotal;
                    arrayOfLineTotal.push(sum)
                });
                totalPrice = sum;

                items.forEach(function(el, index) {
                    if (el.quantity <= 0) throw createError.Conflict("Products quantity must be more than zero")
                    el.lineTotal = arrayOfLineTotal[index]
                })
            });
            Cart.create({ accountId, items, totalPrice })
            .then(function(cart) {
                res.send(cart);
            })
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            next(error)
        }
    },
    editCart: async (req, res, next) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {throw createError.Conflict('Cart ID is not in the correct format')};
            const exists = await Cart.findById(req.params.id)
            if (!exists) { throw createError.Conflict('CartID not found, cart does not exist')};
            const result = await cartSchema.validateAsync(req.body)
            var { accountId, items, totalPrice } = result; 

            if (!mongoose.Types.ObjectId.isValid(result.accountId)) {throw createError.Conflict('Incorrect accountId')};

            const pIdArray = await items.reduce((a, { productId }) => a.concat(productId), []);
            const pQtyArray = await items.reduce((a, { quantity }) => a.concat(quantity), []);

            for(var i = 0; i < pIdArray.length - 1; i++){
                for(var j = i + 1; j < pIdArray.length; j++){
                    if(pIdArray[i] == pIdArray[j]){
                        throw createError.Conflict("Not Allowed: 2 matching productIds")}}};

            await Product.find({ _id: pIdArray }).then(async function (products) {
                if (!products[0]) { throw createError.Conflict("Incorrect ProductID, product doesnt exist")};
                const pricesArray = await products.reduce((a, { price }) => a.concat(price), []);

                var sum = 0; var itemTotal = 0; var arrayOfLineTotal = [] // * Calculate total
                pricesArray.forEach(function (itemsPrice, index) {
                    itemsQuantity = pQtyArray[index];
                    itemTotal = itemsQuantity * itemsPrice;
                    sum = sum + itemTotal;
                    arrayOfLineTotal.push(sum)
                });
                totalPrice = sum;

                items.forEach(function(el, index) {
                    if (el.quantity <= 0) throw createError.Conflict("Products quantity must be more than zero")
                    el.lineTotal = arrayOfLineTotal[index]
                })
            });
            Cart.findByIdAndUpdate({ _id: req.params.id }, {accountId, items, totalPrice})
            .then(function () {
                Cart.findOne({ _id: req.params.id }).then(function (cart) {
                    res.send(cart);
                })
            })
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            next(error)
        }
    },
    deleteCart: async (req, res, next) => {
        try {
            const cartExists = await Cart.findById(req.params.id)
            if (!cartExists) throw createError.Conflict("Cart does not exist")

            await Cart.findByIdAndRemove({_id: req.params.id})
            .then(function(cart){
                res.send(`'Deleted Cart:' ${cart}`);
            })
        } catch (error) {next(error)}
    },
    getAnyCart: async (req, res, next) => {
        try {
        const id = req.params.id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw createError.Conflict('cartId entered is not a valid _id format')}
        const thisCart = await Cart.find({ _id: id }).populate('items.productId', 'name price category description', Product)
        if (!thisCart[0]) throw createError.Conflict("Cart does not exist/incorrect ID")
        res.send({ thisCart })
        } catch (error) {
            next(error)
        }
    },

    getAllOrders: async (req, res, next) => {
        try {
            const allOrders = await Order.find({})
            .populate('customerId', 'accountId firstName lastName contactNo streetNo streetName city postcode', Customer)
            .populate('cartId', 'items', Cart)

            res.send({ allOrders })

        } catch (error) {
            next(error)
        }
    },
    getSingleOrder: async (req, res, next) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {throw createError.Conflict('Order ID is not in the correct format')};
            const exists = await Order.findById(req.params.id)
            if (!exists) { throw createError.Conflict('Order ID not found, order does not exist')};

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
    createNewOrder: async (req, res, next) => {
        try {
            const result = await orderSchema.validateAsync(req.body)
            const { accountId, customerId, cartId, totalPrice, orderStatus } = result

            if (!mongoose.Types.ObjectId.isValid(accountId)) {
                throw createError.Conflict('accountId entered is not a valid _id format')}
            const doesAccountExist = await Account.findById(accountId)
            if (!doesAccountExist) { throw createError.Conflict("accountId not found")}

            if (!mongoose.Types.ObjectId.isValid(customerId)) {
                throw createError.Conflict('customerId entered is not a valid _id format')}
            const doesCustomerExist = await Customer.findById(customerId)
            if (!doesCustomerExist) { throw createError.Conflict("customerId not found")}

            if (!mongoose.Types.ObjectId.isValid(cartId)) {
                throw createError.Conflict('cartId entered is not a valid _id format')}
            const doesCartExist = await Cart.findById(cartId)
            if (!doesCartExist) { throw createError.Conflict("cartId not found")}

            const orderExists = await Order.findOne({cartId: cartId})
            if (orderExists) { throw createError.Conflict('An order has already been created from this cart')}

            const cartRecord = await Cart.findById(cartId)
            const getProductIds = cartRecord.items.reduce((a, {productId}) => a.concat(productId), []);
            if (getProductIds[0] == null) { throw createError.Conflict('Cart is empty !') }

            Order.create({ accountId, customerId, cartId, totalPrice, orderStatus })
            .then(function(order) {
                Cart.create({accountId: accountId, items: [], totalPrice: 0}) // Create new empty cart for user (old one stays in db for records)
                res.send(order)
            })
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            next(error)
        }
    },
    editOrder: async (req, res, next) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {throw createError.Conflict('Order ID is not in the correct format')};
            const exists = await Order.findById(req.params.id)
            if (!exists) { throw createError.Conflict('OrderID not found, order does not exist')};
            const result = await orderSchema.validateAsync(req.body)

            Order.findByIdAndUpdate({ _id: req.params.id }, result)
            .then(function () {
                Order.findOne({ _id: req.params.id }).then(function (order) {
                    res.send(order);
                })
            })
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            next(error)
        }
    },
    deleteOrder: async (req, res, next) => {
        try {
            const orderExists = await Order.findById(req.params.id)
            if (!orderExists) throw createError.Conflict("Order does not exist")

            await Order.findByIdAndRemove({_id: req.params.id})
            .then(function(order){
                res.send(`'Deleted Order:' ${order}`);
            })
        } catch (error) {next(error)}
    },

    addItemToCart: async (req, res, next) => { // for testing
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
    removeItemFromCart: async (req, res, next) => { // for testing
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
};
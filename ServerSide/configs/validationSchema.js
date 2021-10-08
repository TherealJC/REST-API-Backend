// * File is used to validate models/schemas are in the correct format (Input validation)
const Joi = require('@hapi/joi');

const authSchema = Joi.object({
    username: Joi.string().alphanum().min(4).max(30).required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(6).required()
});
const adminAuthSchema = Joi.object({
    username: Joi.string().alphanum().min(4).max(30).required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(6).required(),
    admin: Joi.boolean()
});
const loginSchema = Joi.object({
    username: Joi.string().alphanum().min(4).max(30).required(),
    password: Joi.string().min(6).required()
});
const categorySchema = Joi.object({
    name: Joi.string().min(3).max(30).required()
});
const productSchema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    price: Joi.number().positive().precision(2).required(),
    category: Joi.string().min(3).max(30).required(),
    description: Joi.string().min(10).max(800).required()
});
const customerSchema = Joi.object({
    accountId: Joi.string().alphanum(),
    firstName: Joi.string().min(2).max(30).required(),
    lastName: Joi.string().min(2).max(30).required(),
    contactNo: Joi.string().min(7).max(18).pattern(/^[0-9\.\-\/]+$/).required(),
    streetNo: Joi.string().min(1).max(6).pattern(/^[a-zA-Z0-9\.\-\/]+$/).required(),
    streetName: Joi.string().min(3).max(30).required(),
    city: Joi.string().min(3).max(30).required(),
    postcode: Joi.string().length(4).pattern(/^[0-9\.\-\/]+$/).required()
});
const cartSchema = Joi.object({
    accountId: Joi.string().alphanum().required(),
    
    items: Joi.array().items({
      productId: Joi.string().alphanum().min(24).max(24).required().messages({
        'string.min': `ProductId entered is not a valid object id`,
        'string.max': `ProductId entered is not a valid object id'`,
      }),
      quantity: Joi.number().integer().required(),
      lineTotal: Joi.number().default(0).max(0), //so user can't input their own value through CSRF/xss, auto calculated later
    }).allow(null).allow(''),

    totalPrice: Joi.number().precision(2).min(0).default(0)
});
const orderSchema = Joi.object({
    accountId: Joi.string().alphanum().min(24).max(24).required(),
    customerId: Joi.string().alphanum().min(24).max(24).required(),
    cartId: Joi.string().alphanum().min(24).max(24).required(),
    totalPrice: Joi.number().precision(2).min(0).default(0),
    orderStatus: Joi.string().min(3).max(30).default('Recently Created')
});

module.exports = { 
    authSchema,
    adminAuthSchema,
    loginSchema,
    categorySchema,
    productSchema,
    customerSchema,
    cartSchema,
    orderSchema
};
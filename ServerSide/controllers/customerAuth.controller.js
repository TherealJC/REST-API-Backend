// These controllers are called when a customer based authorization route is accessed
const Account = require('../models/account'); // Import Account schema
const Cart = require('../models/cart'); // Import Account schema
const bcrypt = require('bcrypt');
const createError = require('http-errors');
const { authSchema, loginSchema } = require('../configs/validationSchema');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../configs/jwt.config');
const client = require('../configs/redis.config');

module.exports = {
    registerCustomerAccount: async (req, res, next) => {
        try {
        const result = await authSchema.validateAsync(req.body);
        const { username, password, email } = result
        
        const userDoesExist = await Account.findOne({username: username})
        if (userDoesExist) throw createError.Conflict(`'${username}' already has an account assosiated with it`);
        const emailDoesExist = await Account.findOne({email: email})
        if (emailDoesExist) throw createError.Conflict(`'${email}' already has an account assosiated with it`);
        
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds).then((hashedPassword) =>
        Account.create({ username, password: hashedPassword, email}))

        .then(async function(account) {
            await Cart.create({accountId: account.id, items: [], totalPrice: 0})

            const accessToken = await signAccessToken(account.id);
            const refreshToken = await signRefreshToken(account.id);
            res.send({ accessToken, refreshToken });
        })
    } catch (error) {
        if (error.isJoi === true) error.status = 422
        next(error) }
    },
    customerLogin: async (req, res, next) => {
        try {
            const result = await loginSchema.validateAsync(req.body);
            const account = await Account.findOne({username: result.username})
            if (!account) throw createError.NotFound("Account has not been registered")
            const passwordsMatch = await account.isValidPassword(result.password)
            if (!passwordsMatch) throw createError.Unauthorized('Username/password is not valid')
            
            const accessToken = await signAccessToken(account.id);
            const refreshToken = await signRefreshToken(account.id);
            res.send({ accessToken, refreshToken });
        } catch (error) {
            if (error.isJoi === true) return next(createError.BadRequest("Invalid Username/Password"));
            next(error)
        }
    },
    customerRefreshTokens: async function(req, res, next) {
        try {
            const { refreshToken } = req.body
            
            if (!refreshToken) throw createError.BadRequest()
            const accountId = await verifyRefreshToken(refreshToken)
    
            const accessToken = await signAccessToken(accountId)
            const refToken = await signRefreshToken(accountId)
            res.send({ accessToken: accessToken, refreshToken: refToken })
    
        } catch (error) {
            next(error)
        }
    },
    customerLogout: async function(req, res, next) {
        try {
            const {refreshToken} = req.body
            if (!refreshToken) throw createError.BadRequest()
            const accountId = await verifyRefreshToken(refreshToken)
            client.DEL(accountId, (err, value) => {
                if (err) {
                    console.log(err.message)
                    throw createError.InternalServerError()
                }
                console.log(value)
                res.sendStatus(204)
            })
        } catch (error) {
            next(error)
        }
    },
}
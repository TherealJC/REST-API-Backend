// These controllers are called when an admin based authorization route is accessed
const Account = require('../models/account');
const Cart = require('../models/cart');   
const bcrypt = require('bcrypt');
const createError = require('http-errors');
const { adminAuthSchema, loginSchema } = require('../configs/validationSchema');
const { adminSignAccessToken, adminSignRefreshToken, adminVerifyRefreshToken } = require('../configs/jwt.config');
const client = require('../configs/redis.config');

module.exports = {
    adminCreateAccount: async (req, res, next) => {
        try { 
        const result = await adminAuthSchema.validateAsync(req.body);
        const { username, password, email, admin } = result
    
        const userDoesExist = await Account.findOne({username: username})
        if (userDoesExist) throw createError.Conflict(`'${username}' already has an account assosiated with it`)

        const emailDoesExist = await Account.findOne({email: email})
        if (emailDoesExist) throw createError.Conflict(`'${email}' already has an account assosiated with it`)

        const saltRounds = 10;
        bcrypt.hash(password, saltRounds).then((hashedPassword) =>

        Account.create({ username, password: hashedPassword, email, admin }))
        .then(async function(account) {

            Cart.create({accountId: account.id, items: [], totalPrice: 0})
            
            const accessToken = await adminSignAccessToken(account.id);
            const refreshToken = await adminSignRefreshToken(account.id);
            res.send({ accessToken, refreshToken });
        })
    } catch (error) {
        if (error.isJoi === true) error.status = 422
        next(error) }
    },
    adminLogin: async (req, res, next) => {
        try {
            const result = await loginSchema.validateAsync(req.body);

            const account = await Account.findOne({username: result.username})
            if (!account) throw createError.NotFound("Incorrect Username/Password")
    
            const passwordsMatch = await account.isValidPassword(result.password)
            if (!passwordsMatch) throw createError.Unauthorized('Incorrect Username/Password')
    
            const accessToken = await adminSignAccessToken(account.id);
            const refreshToken = await adminSignRefreshToken(account.id);
            res.send({ accessToken, refreshToken });
        } catch (error) {
            if (error.isJoi === true) return next(createError.BadRequest("Invalid Username/Password"));
            next(error)
        }
    },
    adminRefreshTokens: async function(req, res, next) {
        try {
            const { refreshToken } = req.body
            if (!refreshToken) throw createError.BadRequest()

            const accountId = await adminVerifyRefreshToken(refreshToken)
            const accessToken = await adminSignAccessToken(accountId)
            const refToken = await adminSignRefreshToken(accountId)

            res.send({ accessToken: accessToken, refreshToken: refToken })
        } catch (error) {
            next(error)
        }
    },
    adminLogout: async function(req, res, next) {
        try {
            const {refreshToken} = req.body
            if (!refreshToken) throw createError.BadRequest()

            const accountId = await adminVerifyRefreshToken(refreshToken)
            client.DEL(accountId, (err, value) => {
                if (err) {
                    throw createError.InternalServerError()
                }
                res.sendStatus(204)
            })
        } catch (error) {
            next(error)
        }
    }
}
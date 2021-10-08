const JWT = require('jsonwebtoken');
const createError = require('http-errors');
const client = require('./redis.config'); // use whenever a refresh token is generated to store token inside redis cache

module.exports = {

// TODO Currently only refresh tokens are saved to the server, can also save access tokens for extra security, though 1h expiry on accessTokens only allows for 1h without relogging anyway

    signAccessToken: (accountId) => {
        return new Promise((resolve, reject) => {
            const payload = {}
            const secret = process.env.ACCESS_TOKEN_SECRET
            const options = {
                expiresIn: '1h',
                issuer: 'websiteNameHere.com', // TODO get domain ?
                audience: accountId,
            }
            JWT.sign(payload, secret, options, (err, token) => {
                if (err) {
                    console.log(err.message)
                    reject(createError.InternalServerError())
                    return;
                }
                resolve(token);
            })
        })
    },
    signRefreshToken : (accountId) => {
        return new Promise((resolve, reject) => {
            const payload = {}
            const secret = process.env.REFRESH_TOKEN_SECRET
            const options = {
                expiresIn: '1y',
                issuer: 'websiteNameHere.com', // TODO get domain ?
                audience: accountId,
            }
            JWT.sign(payload, secret, options, (err, token) => {
                if (err) {
                    console.log(err.message)
                    reject(createError.InternalServerError())
                    return;
                }
                client.SET(accountId, token, 'EX', 365*24*60*60, (err, reply) => { // set expiry time for redis record = same as what gets signed (1y)
                    if (err) {
                        reject(createError.InternalServerError())
                        return;
                    }
                    resolve(token)
                })
            })
        })
    },
    verifyAccessToken: (req, res, next) => {
        if (!req.headers['authorization']) return next(createError.Unauthorized()) // If no token present in header

        const authHeader = req.headers['authorization'] // get token from req header (Bearer keyHere)
        const bearerToken = authHeader.split(' ') // separate Bearer from token
        const token = bearerToken[1] // 0 = Bearer, 1 = token
        JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => { // verify token against private key
            if (err) {
                const message = err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message
                return next(createError.Unauthorized(message))
            }
            req.payload = payload
            next()
        })
    },
    verifyRefreshToken: (refreshToken) => {
        return new Promise((resolve, reject) => {
            JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
                if (err) return reject(createError.Unauthorized())
                const accountId = payload.aud // TODO GETTING ACCOUNTID FROM PAYLOAD

                client.GET(accountId, (err, result) => {
                    if (err) { // Log internal server errors
                        console.log(err.message)
                        reject(createError.internalServerError())
                        return
                    }
                    // If tokens arent equal (users token and redis db roken record), user is not authorized
                    if (refreshToken === result) return resolve(accountId)
                    reject(createError.Unauthorized())
                })
            })
        })
    },

    adminSignAccessToken: (accountId) => {
        return new Promise((resolve, reject) => {
            const payload = {}
            const secret = process.env.ADMIN_ACCESS_TOKEN_SECRET
            const options = {
                expiresIn: '1h', // 1 hour route access without refreshing
                issuer: 'websiteNameHere.com', // TODO enter domain here and configure dns records ?
                audience: accountId,
            }
            JWT.sign(payload, secret, options, (err, token) => {
                if (err) {
                    console.log(err.message)
                    reject(createError.InternalServerError())
                    return
                }
                resolve(token);
            })
        })
    },
    adminSignRefreshToken : (accountId) => {
        return new Promise((resolve, reject) => { // Refresh Token conf
            const payload = {}
            const secret = process.env.ADMIN_REFRESH_TOKEN_SECRET
            const options = {
                expiresIn: '1y',
                issuer: 'websiteNameHere.com',
                audience: accountId,
            }
            JWT.sign(payload, secret, options, (err, token) => { // takes in a token, if successful, signs the token which generates new refresh/access keys
                if (err) { // check for errors during JWT sign
                    console.log(err.message)
                    reject(createError.InternalServerError())
                    return
                }

                // Send to redis-server
                client.SET(accountId, token, 'EX', 365*24*60*60, (err, reply) => { // save accountId and refresh token to redis db
                    if (err) { // err handling during Client SET to redis server
                        reject(createError.InternalServerError())
                        return;
                    }
                    resolve(token) // if no errors, 
                })
            })
        })
    },
    adminVerifyAccessToken: (req, res, next) => {
        if (!req.headers['authorization']) return next(createError.Unauthorized()) // If no token present in header

        const authHeader = req.headers['authorization'] // get header from request
        const bearerToken = authHeader.split(' ') // separate Bearer from token
        const token = bearerToken[1] // 0 = Bearer, 1 = token
        JWT.verify(token, process.env.ADMIN_ACCESS_TOKEN_SECRET, (err, payload) => { // verify token against private key
            if (err) {
                if (err.name === 'JsonWebTokenError') {
                    return next(createError.Unauthorized())
                } else {
                    return next(createError.Unauthorized(err.message))
                }
            }
            req.payload = payload
            next()
        })
    },
    adminVerifyRefreshToken: (refreshToken) => {
        return new Promise((resolve, reject) => {
            JWT.verify(refreshToken, process.env.ADMIN_REFRESH_TOKEN_SECRET, (err, payload) => {
                if (err) return reject(createError.Unauthorized())
                const accountId = payload.aud

                // Check if key exists in redis database
                client.GET(accountId, (err, result) => {
                    if (err) { // Log internal server errors
                        console.log(err.message)
                        reject(createError.internalServerError())
                        return
                    }
                    // If tokens arent equal (users token and redis db token record), user is not authorized
                    if (refreshToken === result) return resolve(accountId)
                    reject(createError.Unauthorized())
                })
            })
        })
    }
};
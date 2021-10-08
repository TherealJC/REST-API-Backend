const crypto = require('crypto');

const adminAccessTokenKey = crypto.randomBytes(32).toString('hex');
const adminRefreshTokenKey = crypto.randomBytes(32).toString('hex');

const accessTokenKey = crypto.randomBytes(32).toString('hex');
const refreshTokenKey = crypto.randomBytes(32).toString('hex');

console.table({accessTokenKey, refreshTokenKey, adminAccessTokenKey, adminRefreshTokenKey})
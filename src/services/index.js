'use strict';

const welcome = require('./welcome');
const auth=require('./auth-service');
module.exports = {
    welcome,
    generateToken:auth.generateToken,
    validateToken:auth.validateToken
}
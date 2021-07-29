const jwt = require('jsonwebtoken');
const moment = require('moment');
const JWT_SECRET_KEY = require('../../../config').JWT_SECRET_KEY;
const JWT_EXPIRES_AT = require('../../../config').JWT_EXPIRES_AT;
const AUTH0_CLIENT_ID = require('../../../config').AUTH0_CLIENT_ID;
// const AUTH0_CLIENT_ID= process.env.AUTH0_CLIENT_ID;
// const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
// const JWT_EXPIRES_AT = process.env.JWT_EXPIRES_AT;
function generateToken(payload) {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, JWT_SECRET_KEY, {
            expiresIn: JWT_EXPIRES_AT
        }, (err, token) => {
            if (err) {
                return reject(err);
            }
            resolve(token);
        })
    })
};

function validateToken(mode, token) {
    if (mode.toUpperCase() === "JWT") {
        return new Promise((resolve, reject) => {
            jwt.verify(token, JWT_SECRET_KEY, (err, authData) => {
                if (err) {
                    if (err.name === 'TokenExpiredError') {
                        return reject({
                            success: false,
                            status: "TOKEN_EXPIRED",
                            message: "Generate the token again"
                        })
                    } else {
                        return reject({
                            success: false,
                            status: "TOKEN_INVALID",
                            message: "Please enter the token generated using jwt"
                        });
                    }
                } else {
                    return resolve({
                        success: true,
                        status: "VALIDATED",
                        res: authData
                    });
                }
            });
        })
    } else if (mode.toUpperCase() === "AUTH0") {
        return new Promise((resolve, reject) => {
            try {
                const decoded = jwt.decode(token, {
                    complete: true,
                });
                const expAt = decoded.payload.exp;
                const tokenNotValid = moment(expAt * 1000).isBefore();
                if (tokenNotValid) {
                    return reject({
                        success: false,
                        status: "TOKEN_EXPIRED",
                        message: "Generate the token again",
                    });
                }
                if (decoded.payload.aud === AUTH0_CLIENT_ID) {
                    decoded.payload.aud = undefined;
                    return resolve({
                        success: true,
                        status: "VALIDATED",
                        res: decoded.payload
                    });
                } else {
                    return reject({
                        success: false,
                        status: "INVALID_TOKEN",
                        message: "This is not an AUTH token"
                    });
                }
            } catch (error) {
                return reject({
                    success: false,
                    status: "MALFORMED",
                    message: `This AUTH token is tampered`,
                });
            }
        })
    } else {
        return new Promise((resolve, reject) => {
            return reject({
                success: false,
                status: "INCORRECT_MODE",
                message: "The mode should contain either 'jwt' or 'auth0'"
            })
        })
    }
}


module.exports = {
    generateToken,
    validateToken
}
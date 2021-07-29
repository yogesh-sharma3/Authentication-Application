const express = require("express");
const router = express.Router();
const passport = require("passport");
const services = require("../../../services");
const middlewares = require("../../../middlewares");
const {
    validateToken: rules
} = require("../../../../rules");
const utilites = require("../../../utilities");
const sanitize = middlewares.sanitize;
const validate = middlewares.validate;
const validateSource =middlewares.validateSource;
const generateToken = services.generateToken;
const validateToken = services.validateToken;
const safePromise = utilites.safePromise;
const AUTH0_DOMAIN = require("../../../../config").AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = require("../../../../config").AUTH0_CLIENT_ID;
const HOST = require("../../../../config").HOST;
const loginScope = {
    scope: "openid email profile"
};
// const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
// const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;
// const HOST = process.env.HOST;
router.get("/guide", (req, res) => {
    res.json({
        instructions: {
            "For JWT": {
                A: `To generate token using jwt hit POST on ${HOST}/auth/api/generateToken with a payload`,
                B: `To validate generated token hit POST on ${HOST}/auth/api/validateToken with mode="jwt" and token="copied_token"`,
            },
            "For AUTH0": {
                A: `To authorize yourself and generate jwt token using auth0 hit ${HOST}/auth/api/login`,
                B: `To validate generated token hit POST on ${HOST}/auth/api/validateToken with mode="jwt" and token="copied_token"`,
            },
        },
    });
});
router.post("/generateToken", async (req, res) => {
    const body = req.body;
    const [error, result] = await safePromise(generateToken(body));
    if (error) {
        const resp = {
            success: false,
            message: error.message,
        };
        return res.json(resp);
    }
    const resp = {
        success: true,
        status: "OK",
        res: result,
    };
    res.json(resp);
});

router.post("/validateToken",validateSource, sanitize, validate(rules), async (req, res) => {
    const payload = req.payload;
    const mode = payload.mode;
    const token = payload.token;
    if (mode && token) {
        const [error, result] = await safePromise(validateToken(mode, token));
        if (error) {
            return res.json(error);
        }
        res.json(result);
    } else {
        res.json({
            success: false,
            message: "'mode' or 'token' is missing",
        });
    }
});

router.get("/logoutStatus", (req, res) => {
    res.send("<h1>Logged out!</h1>");
});

router.get("/login", passport.authenticate("auth0", loginScope), function (req, res) {
    res.redirect("/");
});

router.get("/callback", function (req, res, next) {
    passport.authenticate("auth0", function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user.profile) {
            return res.redirect("/auth/api/login");
        }
        req.logIn(user.profile, function (err) {
            if (err) {
                return next(err);
            }
            const returnTo = req.session.returnTo;
            delete req.session.returnTo;
            res.json({
                jwt_Token: user.auth_jwt,
            });
        });
    })(req, res, next);
})

router.get("/logout", (req, res) => {
    const domain = AUTH0_DOMAIN;
    const client_id = AUTH0_CLIENT_ID;
    const returnTo = `${HOST}/auth/api/logoutStatus`;
    res.redirect(
        `https://${domain}/v2/logout?client_id=${client_id}&returnTo=${returnTo}`
    );
});

module.exports = router;
const env = process.env.NODE_ENV;
if(env === 'production'){
  try {
    require('./prodModules');
  } catch(e) {
    // eslint-disable-next-line no-console
    console.log('ERROR in prodModules file', e);
  } 
}

const express = require('express');
const httpContext = require('express-http-context');
const cookieParser = require('cookie-parser');
const uuid = require('node-uuid');
const swaggerMiddleware = require('./src/docs/swagger/swagger');
const logger = require('./src/utilities/logger');
const helpers = require('./helpers');
const config = require('./config');
var passport = require('passport');
var Auth0Strategy = require('passport-auth0');
var session = require('express-session');

global.helper = {
  config,
  module: helpers.module
}

const boot =  require('./boot');
const routes = require('./src/controllers/routes');


const log = logger('app:main');



const app = express();
var strategy = new Auth0Strategy(
  {
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL:
      process.env.AUTH0_CALLBACK_URL || `${config.HOST}/auth/api/callback`,
  },
  function (accessToken, refreshToken, extraParams, profile, done) {
    // accessToken is the token to call Auth0 API (not needed in the most cases)
    // extraParams.id_token has the JSON Web Token
    // profile has all the information from the user
    const data={profile,accessToken,refreshToken,auth_jwt:extraParams.id_token};
    return done(null, data);
  }
);

passport.use(strategy);
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});
// config express-session
var sess = {
  secret: 'CHANGE THIS SECRET',
  cookie: {},
  resave: false,
  saveUninitialized: true
};


app.use(session(sess));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(httpContext.middleware);

app.use((req, res, next) => {
  httpContext.ns.bindEmitter(req);
  httpContext.ns.bindEmitter(res);
  const ApiHash = req.headers.ApiHash || req.headers.apihash || req.headers.apiID || uuid.v4();
  httpContext.set("ApiHash", ApiHash);
  next();
});

boot.default(app);

const MOUNT_POINT = config.MOUNT_POINT;
app.use(MOUNT_POINT, routes);

if(config.ENABLE_SWAGGER){
  swaggerMiddleware(app);
}

app.use(function (req, res, next) {
  next({code: 404, msg: "API Not found."})
})
app.use(function (err, req, res , next)  {
  log.error("err", err);
  let code = err.code || 500;
  res.status(code).json({
    success: false,
    msg: err.msg || err.message,
  });
})

process.on("uncaughtException", function(error) {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
})

process.on("unhandledRejection", function (error) {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
})


module.exports = app;

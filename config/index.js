 require('dotenv').config()

const config = {
  MOUNT_POINT: process.env.MOUNT_POINT,
  SERVER: process.env.SERVER,
  PORT: process.env.PORT,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  DB_POOL_MAXSIZE: process.env.DB_POOL_MAXSIZE,
  DB_POOL_MINSIZE: process.env.DB_POOL_MINSIZE,
  DB_POOL_ACQUIRE: process.env.DB_POOL_ACQUIRE,
  DB_POOL_IDLE: process.env.DB_POOL_IDLE,
  DB_CONNECT_TIMEOUT: process.env.DB_CONNECT_TIMEOUT,
  JWT_SECRET_KEY:process.env.JWT_SECRET_KEY,
  JWT_EXPIRES_AT:process.env.JWT_EXPIRES_AT,
  AUTH0_CLIENT_ID:process.env.AUTH0_CLIENT_ID,
  AUTH0_DOMAIN:process.env.AUTH0_DOMAIN,
  AUTH0_CLIENT_SECRET:process.env.AUTH0_CLIENT_SECRET,
  HOST:process.env.HOST
}

function checkIfAllEnvKeysPresent(config, scope="") {
  const configKeys = Object.keys(config);
  configKeys.forEach((key) => {
    if (!config[key]) {
      //console.log(error);
      throw new Error(`"${scope} ${key}" is blank in .env or related configuration file`)
    }
    if(typeof config[key] === "object"){
      checkIfAllEnvKeysPresent({...config[key]}, key);
    }
  });
}

checkIfAllEnvKeysPresent(config);

module.exports = config;
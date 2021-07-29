const SERVER_CREDENTIALS = {
    ASSETS_API: process.env.ASSETS_API_TOKEN,
    NOTIFICATION_API: process.env.NOTIFICATION_API_TOKEN,
    DOCSERVICE_API: process.env.DOCSERVICE_API_TOKEN,
    TIMEZONE_API: process.env.TIMEZONE_API_TOKEN,
    MASTER_SERVICE_API: process.env.MASTER_SERVICE_API_TOKEN,
    PARSER_API: process.env.PARSER_API_TOKEN,
    AUTH_API: process.env.AUTH_API_TOKEN
}

const validateSource = (req, res, next) => {
    const serverName = req.headers['server-name'];
    const XServerToken = req.headers['x-server-token'];
    if ((serverName && XServerToken) && (XServerToken === SERVER_CREDENTIALS[serverName])) {
        return next();
    }
    res.json({
        success: false,
        message: "You are not an authorized service to validate the jwt token"
    })
}

module.exports=validateSource;
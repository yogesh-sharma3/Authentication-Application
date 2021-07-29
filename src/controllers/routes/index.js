const helper  = global.helper;
const express = helper.module.express;
const router  = express.Router();
const HOST = require('../../../config').HOST;
router.use('/',require(`./welcome`));
router.use('/',require(`./auth-service`));

//Write a loader here to avoid adding manual routes.

//index route
router.get('/', (req, res) => {
  res.json({
    message:`Please go to ${HOST}/auth/api/guide for authentication service guide`
  });
});

router.get('/health-check', (req, res) => {
  res.json({
    alive: `${req.path}`
  });
});

module.exports = router;
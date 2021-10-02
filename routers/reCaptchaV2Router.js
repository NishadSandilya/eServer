const { validateCaptcha } = require('../controllers/reCaptchaV2Controller')

//Modules
const router = require('express').Router()

//Captcha validation Request base call
router
    .route('/')
    .post(validateCaptcha)

//Default export router
module.exports = router
//Modules
const axios = require('axios')
const AppErrors = require('../utils/AppErrors')
const { asyncHandler } = require('../utils/asyncHandler')
const querystring = require('querystring')
const { respond } = require('../utils/response')

//Send verification code to google reCaptcha servers
exports.validateCaptcha = asyncHandler(async(req, res, next) => {
    //Check if captcha token is present in the req body
    const token = req.body.token

    if(!token) return next(new AppErrors(`Missing reCaptcha token`, 400))

    //Else, send the token to Google servers for validation
    const results = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, querystring.stringify({
        secret: process.env.RECAPTCHV2SECRET,
        response: token
    }), {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })

    //Send response based on validation results
    if(!results.data.success) return next(new AppErrors('Captcha validation failed', 400))

    respond(200, 'Captcha validation successful', null, res)
})
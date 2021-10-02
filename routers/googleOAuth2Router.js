//Modules
const { googleOAuth2BaseCall, googleOAuth2RedirectCallback } = require('../controllers/googleOAuth2Controller')

const router = require('express').Router()

//googleOAuth2 base call by client
router
    .route('/')
    .get(googleOAuth2BaseCall)

//Route to handle the redirect uri(callback)
router
    .route('/callback')
    .get(googleOAuth2RedirectCallback)

//Default export router
module.exports = router
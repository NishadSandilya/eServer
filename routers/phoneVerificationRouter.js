//Modules
const { auth } = require('../controllers/authController')
const { updateMePhone } = require('../controllers/meController')
const { sendOTP, verifyOTP, loginWithPhoneAndOtp, sameNumberUpdate } = require('../controllers/phoneVerificationController')

const router = require('express').Router()

//Accept numbers for verification
router
    .route('/send-OTP')
    .post(sendOTP)

router
    .route('/send-OTP-update-number')
    .post(auth, sameNumberUpdate, sendOTP)

//Check if OTP is valid
router
    .route('/login-with-phone-and-otp')
    .post(verifyOTP, loginWithPhoneAndOtp)

router
    .route('/update-phone')
    .patch(auth, verifyOTP, updateMePhone)

//Default exporting router
module.exports = router
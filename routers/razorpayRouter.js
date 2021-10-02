const { auth } = require('../controllers/authController')
const { newPayment, webhookCapture } = require('../controllers/razorpayController')

const router = require('express').Router()

router
    .route('/create-order')
    .post(auth, newPayment)

router
    .route('/verifyPayment')
    .post(webhookCapture)

module.exports = router
const { auth } = require('../controllers/authController')
const { newPayment, webhookCapture } = require('../controllers/razorpayController')
const { asyncHandler } = require('../utils/asyncHandler')

const router = require('express').Router()

router
    .route('/create-order')
    .post(auth, newPayment)

router
    .route('/verifyPayment')
    .post(webhookCapture)

router
    .route('/handle-redirect')
    .post(asyncHandler(async(req, res, next) => {
        //redirect to erida
        res
            .header("Access-Control-Allow-Origin", "https://erida.in")
            .header('Access-Control-Allow-Credentials', true)
            .header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
            .redirect('https://erida.in/#/orders')
    }))

module.exports = router
//This is the orders router

const { auth } = require('../controllers/authController')
const { createNewOrder } = require('../controllers/orderController')

//Required modules here
const router = require('express').Router()

router
    .route('/new-order')
    .post(auth, createNewOrder)

//export default router
module.exports = router
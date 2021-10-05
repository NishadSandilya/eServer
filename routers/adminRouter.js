const { auth, admin } = require('../controllers/authController')
const { detailsMe, searchOrdersByPhone, searchOrderById, searchByOrderID, getAllOrdersAdmin } = require('../controllers/meController')
const { updateOrder } = require('../controllers/orderController')


//Modules
const router = require('express').Router()

//admin login(same as user login, uses the same controller)
router
    .route('/')
    .get(auth, admin, detailsMe)

router
    .route('/search-order-by-phone')
    .post(auth, admin, searchOrdersByPhone)

router
    .route('/search-order-by-ID')
    .post(auth, admin, searchOrderById)

router
    .route('/update-order')
    .post(auth, admin, updateOrder)

router
    .route('/search-by-orderID')
    .post(auth, admin, searchByOrderID)

    router
    .route('/all-orders')
    .get(auth, admin, getAllOrdersAdmin)

//Default exporting router
module.exports = router
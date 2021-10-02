//Current user router

const { auth } = require('../controllers/authController')
const { detailsMe, logOut, updateMeName, updateUserAvatar, getUserOrders } = require('../controllers/meController')

//Modules
const router = require('express').Router()

router  
    .route('/')
    .get(auth, detailsMe)

router
    .route('/log-out')
    .get(logOut)

router
    .route('/update-name')
    .patch(auth, updateMeName)

// router
//     .route('/update-avatar')
//     .patch(auth, updateUserAvatar)

router
    .route('/orders')
    .get(auth, getUserOrders)

//Default export router
module.exports = router
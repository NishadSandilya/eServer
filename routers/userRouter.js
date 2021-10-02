const { manualSignup, verifyUserEmail, userLogin, updateUser, addItemsToCart, removeItemsFromCart, getUserCart, emptyUserCart } = require('../controllers/userController')

//Modules
const router = require('express').Router()
const cors = require('cors')
const { auth } = require('../controllers/authController')

//Route to signup w/o oauth2
// router
//     .route('/signup')
//     .post(manualSignup)

// //Route to verify user email
// router
//     .route('/verify-email/:token', cors())
//     .get(verifyUserEmail) //Frontend redirects

// //User Generic Login
// router
//     .route('/login')
//     .post(userLogin)

// //Add items to cart
// router
//     .route('/cart/add-to-cart')
//     .patch(auth, addItemsToCart)

// //Removing items from cart
// router
//     .route('/cart/remove-from-cart')
//     .patch(auth, removeItemsFromCart)

// //Getting cart and stats
// router
//     .route('/cart')
//     .get(auth, getUserCart)

// //Emptying user cart
// router
//     .route('/cart/empty-cart')
//     .patch(auth, emptyUserCart)

//Default exporting router 
module.exports = router
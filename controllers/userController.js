//Modules
const User = require('../models/User')
const AppErrors = require('../utils/AppErrors')
const { asyncHandler } = require('../utils/asyncHandler')
const { respondWithJwtAndCookie } = require('../utils/jwtResponse')
const { respond } = require('../utils/response')
const crypto = require('crypto')
const Mailer = require('../utils/Mailer')
const { sendSMS } = require('../utils/smsService')

//SignUp without oauth2
exports.manualSignup = asyncHandler(async (req, res, next) => {
    //Create a new user with mongoose
    const newUser = await User.create(req.body)

    //Get token from schema prototype method
    const token = newUser.setEmailVerificationToken()

    //Save changes to database
    await newUser.save({ validateBeforeSave: false })

    //Send the token as a part of the URL to the user for verification
    // await sendMail(newUser, `http://007ae211d114.ngrok.io/v1/users/verify-email/${token}`)
    await new Mailer(newUser, `http://92e1736d8625.ngrok.io/v1/users/verify-email/${token}`)
        .sendInitialVerificationEmail()

    //Response with JWT
    respondWithJwtAndCookie(201, `User Created, verification email sent`, { id: newUser._id }, res, next)
})

//Verify user email
exports.verifyUserEmail = asyncHandler(async (req, res, next) => {

    //Convert gotten token
    const token = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex')

    //Find in database if such a user exist
    const user = await User
        .findOne({
            emailVerificationToken: token,
            emailVerificationTokenExpiresAt: { $gt: Date.now() }
        })

    //If no document exist, return error
    if (!user) return next(new AppErrors('Invalid verification token/ token expired/ Email already verified', 400))

    //Else, update changes in document
    user.verifyUserEmail()
    user.save({ validateBeforeSave: false })

    respond(202, 'Email Verified', {}, res)
})

//User Generic login
exports.userLogin = asyncHandler(async (req, res, next) => {
    const userEmail = req.body.email
    const userPassword = req.body.password

    //Throw error if one is absent
    if(!userEmail || !userPassword) return next(new AppErrors('Missing user Email or Password', 400))

    //Look in database for an email 
    const user = await User.findOne({email: userEmail}).select('+password +email +userType')

    //Throw error if user not present in erida
    if(!user) return next(new AppErrors('Account doesnot exist', 400))

    //Exception for google logins
    if(user.password === undefined || user.password === null) return next(new AppErrors('Seems like you logged in with google last time and have not set your password for your erida account. Please login through google or click on forget password'))

    //else match passwords
    if(!await user.isPasswordCorrect(userPassword, user.password)) return next(new AppErrors('Incorrect password'))

    //Finally, when user is successfully authenticated, send the cookie along with the jwt
    respondWithJwtAndCookie(200, 'User logged in', {id: user._id}, res, next)
})

//Update a user
exports.updateUser = asyncHandler(async (req, res, next) => {
    //Else, update the document
    const user = await User.findByIdAndUpdate(req.decodedJwt._id, req.body, { upsert: true, new: true })

    if (!user) return next(new AppErrors('User not found', 404))

    respond(200, "Updates Saved", null, res)
})

//Add items to user's cart
exports.addItemsToCart = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.decodedJwt.id, {$push: {"cart": req.body}}, { upsert: true, new: true }).select('cart totalCartItems totalCartValue')

    //Update cart stats and save
    user.updateCartStats()
    user.save({validateBeforeSave: false})

    if (!user) return next(new AppErrors('User not found', 404))

    respond(200, "itemAdded", user, res)
})

//Remove items from the cart
exports.removeItemsFromCart = asyncHandler( async(req, res, next) => {

    //Pull items from the cart if available
    const user = await User.findByIdAndUpdate(req.decodedJwt.id, {$pull: {"cart": req.body}}, { upsert: true, new: true }).select('cart totalCartItems totalCartValue')

    //Update cart stats and save
    user.updateCartStats()
    user.save({validateBeforeSave: false})

    if (!user) return next(new AppErrors('User not found', 404))

    respond(200, "itemRemoved", user, res)
})


//Get cart and stats
exports.getUserCart = asyncHandler(async (req, res, next) => {
    //Get the user first
    const user = await User.findById(req.decodedJwt.id).select('cart totalCartItems totalCartValue')

    //Throw error if user not found
    if(!user) return next(new AppErrors('User not found', 404))

    //Else send the cart info
    respond(200, 'Cart Information', user, res)
})

//Empty User Cart
exports.emptyUserCart = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.decodedJwt.id).select('cart totalCartItems totalCartValue')

    //Throw error if user not found
    if(!user) return next(new AppErrors('User not found', 404))

    //else modify the cart and save changes
    user.emptyCart()
    user.save({validateBeforeSave: false})

    //Respond back with the updated cart
    respond(200, 'Cart Emptied', user, res)
})
//Current user controller
//Modules


const Order = require("../models/Order");
const User = require("../models/User");
const AppErrors = require("../utils/AppErrors");
const { asyncHandler } = require("../utils/asyncHandler");
const { respond } = require("../utils/response");

//Get the current user
exports.detailsMe = asyncHandler(async (req, res, next) => {
    //Get the current user from the database
    const user = await User.findById(req.decodedJwt.id).select('+firstname +lastname +phone +avatar -_id +userType')

    respond(200, "OK", user, res)
})

exports.logOut = asyncHandler(async (req, res, next) => {
    res
        .header("Access-Control-Allow-Origin", "http://www.erida.in")
        .header('Access-Control-Allow-Credentials', true)
        .header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
        .status(200)
        .clearCookie('ESS')
        .json({
            message: "Logged out"
        })
})

exports.updateMeName = asyncHandler(async (req, res, next) => {
    //Find user and update

    //Check if the body has adequate data
    if (!req.body.firstname || !req.body.lastname) return new AppErrors('Did you forget to enter your first and last name?')

    //Get the user first
    const user = await User.findById(req.decodedJwt.id)
    //Throw error if user not found or has been inactivated
    if (!user) return next(new AppErrors('Ops! we could not find the user', 404))

    //check if user name is the same
    if (await user.isUserNameSame(req.body.firstname, req.body.lastname)) return next(new AppErrors('New and old user names are the same', 403))

    user.updateUserName(req.body.firstname, req.body.lastname)
    user.save({ validateBeforeSave: false })

    respond(200, 'Your name has been updated successfully', null, res)
})

exports.updateMePhone = asyncHandler(async (req, res, next) => {
    //Find the user first
    const user = await User.findById(req.decodedJwt.id)

    //Throw error if user not found
    if (!user) return next(new AppErrors('Ops! We could not find the user', 404))

    //Check if the new number is the same
    if (user.isPhoneSame(req.body.numbers)) return next(new AppErrors('New and old numbers are the same', 403))

    //Else update
    user.updatePhone(req.body.numbers)
    user.save({ validateBeforeSave: false })

    respond(200, 'Your phone has been updated successfully', null, res)
})

exports.getUserOrders = asyncHandler(async (req, res, next) => {
    const orders = await Order.find({ userId: req.decodedJwt.id }).sort('-createdAt')
    //Throw error if user not found
    if (!await User.findById(req.decodedJwt.id)) return next(new AppErrors('Ops! We could not find the user', 404))

    respond(200, "orders fetched", orders, res)
})

exports.searchOrdersByPhone = asyncHandler(async(req, res, next) => {
    //throw error if numbers not present in the req body
    if(!req.body.numbers) return next(new AppErrors('Phone number not found in the request', 400))
    //else get all the latest orders
    const orders = await Order.find({phone: `${req.body.numbers}`}).sort('-createdAt')

    respond(200, 'OK', orders, res)
})
exports.searchOrderById = asyncHandler(async(req, res, next) => {
    //throw error if numbers not present in the req body
    if(!req.body.orderId) return next(new AppErrors('Order ID not found in the request', 400))
    //else get all the latest orders
    const order = await Order.findById(req.body.orderId)

    respond(200, 'OK', order, res)
})

exports.searchByOrderID = asyncHandler(async(req, res, next) => {
    //Throw error if order ID not present in the request body
    if(!req.body.orderId) return next(new AppErrors('OrderId not found in the request', 400))

    //else send the order back to the client
    const order = await Order.findOne({orderId: req.body.orderId})

    respond(200, "OK", order, res)
})
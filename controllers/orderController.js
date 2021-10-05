//This is the order controller

//Required Modules here
const { asyncHandler } = require('../utils/asyncHandler')
const { respond } = require('../utils/response')
const Item = require('../models/Item')
const User = require('../models/User')
const Order = require('../models/Order')
const AppErrors = require('../utils/AppErrors')
const { sendSMS } = require('../utils/smsService')
const SelfMail = require('../utils/SelfMail')

//Create new order function
exports.createNewOrder = asyncHandler(async (req, res, next) => {
    //Prep the order details
    let orderDetails = {
        firstname: req.body.firstname ? req.body.firstname : undefined,
        lastname: req.body.lastname ? req.body.lastname : undefined,
        email: req.body.email ? req.body.email : undefined,
        phone: req.body.numbers,
        address: req.body.address ? req.body.address : undefined,
        userNotes: req.body.issue ? req.body.issue : undefined,
        orderType: req.body.orderType,
        orderStatus: req.body.orderStatus ? req.body.orderStatus : undefined,
        paymentCompleted: req.body.paymentCompleted ? req.body.paymentCompleted : undefined,
        paymentMode: req.body.paymentMode ? req.body.paymentMode : undefined        
    }

    //Check if the req body contain an ITEM SKU(For user created orders) to add items

    if (req.body.itemSKU) {
        const itemDetails = await Item.findOne({ SKU: req.body.itemSKU }).select('+name +value')
        //Throw error if sku tampered with
        if(!itemDetails) return next(new AppErrors('SKU Tempered with. Please try again'))
        orderDetails = {
            ...orderDetails,
            items: [{
                item: itemDetails.name,
                value: itemDetails.value
            }]
        }
    }
    else {
        orderDetails = {
            ...orderDetails,
            items: req.body.items
        }
    }

    if(req.body.location){
        orderDetails = {
            ...orderDetails,
            "location.coordinates": req.body.location
        }
    }

    //Assign user ID if user is placing the order
    const user = await User.findById(req.decodedJwt.id).select('+userType +_id')

    if (user.userType === "admin") {
        //Find if the phone number already exists in erida servers.

        const tempUser = await User.findOne({ phone: req.body.numbers })

        if (!tempUser) {
            //create user and bind the order to the user
            const newUser = await User.create({ phone: req.body.numbers })

            orderDetails = {
                ...orderDetails,
                userId: newUser?._id
            }
        }
        else {
            orderDetails = {
                ...orderDetails,
                userId: tempUser?._id
            }
        }
    }
    else {
        orderDetails = {
            ...orderDetails,
            userId: user?._id
        }
    }

    //Finally Create order
    const order = await Order.create(orderDetails)

    //send user sms
    await sendSMS(order.phone, `Thank you for your order with erida. Please keep the order ID safe, ${order.orderId}`)
    respond(200, "Order Placed Successfully. Thank you for choosing erida", null, res)

    //send self mail
    await new SelfMail(order).sendEmailNotification()
})

exports.updateOrder = asyncHandler(async( req, res, next) => {
    //Check if the order id is there in the request
    if(!req.body.id) return next(new AppErrors('Order Id missing in the request body', 400))

    //Update if everyting is alright
    const order = await Order.findByIdAndUpdate(req.body.id, req.body)

    respond(200, 'Order Updated', null, res)
})
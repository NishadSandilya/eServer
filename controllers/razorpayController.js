const Order = require('../models/Order')
const AppErrors = require('../utils/AppErrors')
const { asyncHandler } = require('../utils/asyncHandler')
const rpInstance = require('../utils/razorpayClient')
const { respond } = require('../utils/response')
const crypto = require('crypto')
const { sendSMS } = require('../utils/smsService')


exports.newPayment = asyncHandler(async (req, res, next) => {
    //Check if the order id exists in the request
    if (!req.body.orderId) return next(new AppErrors('Invalid Payment request', 400))

    //If orderId is present, fetch details form the actual order
    const order = await Order.findById(req.body.orderId)

    //Create the razorpayOrder
    const rpOrder = await rpInstance.orders.create({
        amount: order.orderValue * 100,
        currency: 'INR',
        payment_capture: true
    })

    //Add/Update razorpayOrderId of if paid by Razorpay
    order.addRPOrder(rpOrder.id)
    order.save({ validateBeforeSave: false })

    //Prepare the final object to be sent
    const finalOrderData = {
        key: process.env.RPKEY,
        razorpayOrder: rpOrder,
        prefill: {
            name: `${order.firstname ? order.firstname + " " + order.lastname : ""}`,
            email: `${order.email ? order.email : ""}`,
            contact: order.phone,
        }
    }

    respond(200, "Order Initiated", finalOrderData, res)
})

exports.webhookCapture = asyncHandler(async (req, res, next) => {

    //verify integrity of the webhook
    const encrypted = crypto.createHmac('sha256', process.env.RPWHSECRET)
        .update(JSON.stringify(req.body))
        .digest('hex')

    if (req.headers['x-razorpay-signature'] === encrypted) {
        const order = await Order.findOne({ razorpayOrderId: req.body.payload.payment.entity.order_id })

        if (!order) return res.json({ status: "ok" })

        order.paymentCaptured(req.body.payload.payment.entity.id)
        order.save({ validateBeforeSave: false })
        await sendSMS(order.phone, `Thank you for your order with erida. We have received your payment for order ID ${order.orderId} by ${order.PaymentMode}`)
    }

    res.json({
        status: "ok"
    })
})
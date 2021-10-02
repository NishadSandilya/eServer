//This is the order Model. The most important module of erida v1

//Required modules
const mongoose = require('mongoose')
const otpGenerator = require('otp-generator')
const validator = require('validator')
const { sendSMS } = require('../utils/smsService')

//Create order schema
const schema = new mongoose.Schema({
    orderId: {
        type: Number,
        unique: true,
        default: function() {
            return otpGenerator.generate(8, {
                digits: 1,
                alphabets: 0,
                upperCase: 0,
                specialChars: 0
            })
        }
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "User"
    },
    firstname: {
        type: String,
        trim: true,
        validate: {
            validator: function (val) {
                return validator.isAlpha(val)
            },
            message: 'Invalid First Name'
        }
    },
    lastname: {
        type: String,
        trim: true,
        validate: {
            validator: function (val) {
                return validator.isAlpha(val)
            },
            message: 'Invalid Last Name'
        }
    },
    email: {
        type: String,
        trim: true,
        validate: {
            validator: function (val) {
                return validator.isEmail(val)
            },
            message: 'Invalid Email Address'
        }
    },
    phone: {
        type: String,
        trim: true,
        requried: [true, "Phone Number is required"],
        validate: {
            validator: function (val) {
                return validator.isMobilePhone(val, 'en-IN')
            },
            message: 'Invalid Phone Number'
        },
    },
    address: {
        type: String,
        trim: true,
    },
    location: {
        type: {
            type: String,
            default: "Point"
        },
        coordinates: {
            type: [Number],
            default: [0,0]
        }
    },
    items: [{
        item: {
            type: String
        },
        quantity: {
            type: Number,
            default: 1
        },
        value: {
            type: Number
        }
    }],
    orderStatus: {
        type: String,
        default: "Processing",
        enum: {
            values: ['Processing', 'Completed'],
            message: 'Invalid Order Status'
        },
    },
    orderValue: {
        type: Number,
    },
    paymentCompleted: {
        type: Boolean,
        default: false
    },
    paymentMode: {
        type: String,
        enum:{
            values: ["Cash", "UPI Apps", "Razorpay"],
            message: "Invalid Payment Mode"
        }
    },
    razorpayOrderId: {
        type: String
    },
    isOrderEditable: {
        type: Boolean,
        default: true
    },
    razorpayPaymentId: {
        type: String
    },
    userNotes: {
        type: String
    },
    orderType: {
        type: String,
        enum: {
            values: ["Onsite Service", "Remote Assist", "Gaming Session", "Custom Order"]
        },
        required: [true, "Order Type is required"]
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

//Document middleware
schema.pre('save', function(next){
    let tempVal = 0
    this.items.map(item => {
        tempVal += (item.value * item.quantity)
    })
    this.orderValue = tempVal
    next()
})

schema.pre(/^find/, function(next){
    this.populate({
        path: "userId",
        select: "-firstname -lastname -email -phone -avatar -_id -__v"
    })
    next()
})

//Query Middleware
schema.pre('findOneAndUpdate', async function(next){
    let tempVal = 0
    this.getUpdate().items.map(item => {
        tempVal += (item.value * item.quantity)
    })
    this.getUpdate().orderValue = tempVal
    if(this.getUpdate().paymentCompleted) {
        this.getUpdate().isOrderEditable = false
        await sendSMS(this.getUpdate().phone, `Thank you for your order with erida. We have received your payment for order`)
    }
    next()
})

//Prototype Methods
schema.methods.addRPOrder = function(orderId){
    this.razorpayOrderId = orderId
}

schema.methods.paymentCaptured = function(paymentId){
    this.paymentCompleted = true,
    this.razorpayPaymentId = paymentId,
    this.paymentMode = 'Razorpay',
    this.isOrderEditable = false
}

//Create Indexes
schema.index({location: "2dsphere"})


//Complie schema into a model
const Order = new mongoose.model('Order', schema)

//Default export Model
module.exports = Order
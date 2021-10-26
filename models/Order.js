//This is the order Model. The most important module of erida v1

//Required modules
const mongoose = require('mongoose')
const validator = require('validator')
const AppErrors = require('../utils/AppErrors')
const { sendSMS } = require('../utils/smsService')
const Affiliate = require('./Affiliate')
const User = require('./User')
const orderid = require('order-id')(process.env.RPWHSECRET)

//Create order schema
const schema = new mongoose.Schema({
    orderId: {
        type: String,
        unique: true,
        default: function() {
            return orderid.generate()
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
    promo: {
        type: String
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

    if(this.isNew){
        if(this.paymentCompleted) this.isOrderEditable = false
    }

    let tempVal = 0
    this.items.map(item => {
        tempVal += (item.value * item.quantity)
    })
    this.orderValue = tempVal
    next()
})

//Implementing the Promo Code algorithm
schema.pre('save', async function(next){
    //Promo code validations
    //If there is a promocode, check if its valid
    if(this.promo){
        //Check if promo is used only with a gaming order
        if(this.orderType !== 'Gaming Session') return next(new AppErrors('Promo Codes can only be used with Gaming Session Orders', 400))
        //Check if the promo code is valid
        if(!await Affiliate.findOne({code: this.promo})) return next(new AppErrors('Promo Code is not valid', 400))
        //Check if the promo code has already been used by the user
        if(await User.findOne({promosUsed: this.promo})) return next(new AppErrors("Promo Code Already Used Once", 400))
        //Apply the promocode if everything's valid
        const promoDiscount = this.orderValue * 0.1
        this.orderValue -= promoDiscount
        //Modify the Affiliate's Profile
        //Get affiliate first
        const affiliate = await Affiliate.findOne({code: this.promo})
        //Update Affiliate's Unpaid Earnings
        const affiliateEarning = this.orderValue - (this.orderValue * affiliate.rewardPercentage / 100)
        affiliate.unpaidEarnings += affiliateEarning
        affiliate.totalEarnings += affiliateEarning
        await affiliate.save({validateBeforeSave: false})
    }
    next()
})

// schema.post('save', async function(next){
//     //Update the user after the order's done
//     if(this.promo){
//         const user = await User.findOne({phone: this.phone})
//         user.promosUsed.addToSet(this.promo)
//         await user.save({validateBeforeSave: false})
//     }
//     next()
// })

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
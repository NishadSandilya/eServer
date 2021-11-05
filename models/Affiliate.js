//The affiliate model
//All required modules here
const mongoose = require('mongoose')
const validator = require('validator')

//Declare the schema first
const schema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, "The Affiliate's Name is required"],
        validate: {
            validator: function (val) {
                return validator.isAlpha(val, 'en-IN', {ignore: " "})
            },
            message: "Enter a valid Affiliate's Full name"
        }
    },
    phone: {
        type: String,
        unique: true,
        trim: true,
        requried: [true, "Phone Number is required"],
        validate: {
            validator: function (val) {
                return validator.isMobilePhone(val, 'en-IN')
            },
            message: 'Invalid Phone Number'
        },
    },
    discount: {
        type: Number,
        required: [true, "The Discount percentage of the Affiliate is Required"]
    },
    brand: {
        type: String,
        required: [true, "The name of the Store or Brand is Required"]
    },
    code: {
        type: String,
        required: [true, "The Affiliate's Promo Code is required"],
        minLength: [6, "Promo Code should be a fixed 6 letter string"],
        maxLength: [6, "Promo Code should be a fixed 6 letter string"],
    },
    rewardPercentage: {
        type: Number,
        required: [true, "The reward percentage of the affiliate is required"],
        min: [5, "The minimum reward percentage of an affiliate should be atleast 5%"],
        max: [10, "The maximum reward percentage of an affiliate shouldnot be greater than 10%"],
    },
    unpaidEarnings: {
        type: Number,
        default: 0
    },
    totalEarnings: {
        type: Number,
        default: 0
    }
})

//Compile schema to model
const Affiliate = new mongoose.model('Affiliate', schema)

//Default export model
module.exports = Affiliate
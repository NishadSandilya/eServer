//Modules 
const mongoose = require('mongoose')
const validator = require('validator')
const otpGenerator = require('otp-generator')
const crypto = require('crypto')

//Declaring the schema here
const schema = new mongoose.Schema({
    phone:{
        type: String,
        trim: true,
        validate: {
            validator: function(val){
                return validator.isMobilePhone(val, 'en-IN')
            },
            message: `Invalid Phone Number`
        },
    },
    otp: {
        type: String,
    },
    otpExpiresAt: {
        type: Date,
    }, 
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

//Middleware here

//Query Middleware

//Document Midddleware

//Prototype Functions here
schema.methods.generateOTP = function () {

    //Generate OTP with
    const otp = otpGenerator.generate(4, {
        digits: 1,
        alphabets: 0,
        upperCase: 0,
        specialChars: 0
    })

    //Store the OTP in an encrypted form in the database
    this.otp = crypto
        .createHash('sha256')
        .update(otp)
        .digest('hex')

    //Assign the otpexpiry
    this.otpExpiresAt = Date.now() + 5 * 60 * 1000

    //Send the decrypted OTP to the user
    return otp
}

//Static Functions here

//Indexes here
// schema.index({createdAt: 1}, {expireAfterSeconds: 300})

//Compile the schema into a model
const TempPhoneVeri = new mongoose.model('TempPhoneVeri', schema)

//Default export model
module.exports = TempPhoneVeri

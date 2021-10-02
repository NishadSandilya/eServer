//Modules
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

//Schema
const schema = new mongoose.Schema({
    //Primary fields
    firstname: {
        type: String,
        trim: true,
        validate: {
            validator: function (val) {
                return validator.isAlpha(val)
            },
            message: 'First Name should not contain number or special characters'
        }
    },
    lastname: {
        type: String,
        trim: true,
        validate: {
            validator: function (val) {
                return validator.isAlpha(val)
            },
            message: 'Last Name should not contain number or special characters'
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
        },
        select: false
    },
    phone: {
        type: String,
        trim: true,
        requried: [true, "User phone is a must for logging in"],
        validate: {
            validator: function (val) {
                return validator.isMobilePhone(val, 'en-IN')
            },
            message: 'Invalid Phone Number'
        },
        unique: true
    },
    password: {
        type: String,
        select: false
    },
    avatar: {
        type: String,
        default: 'http://www.erida.herokuapp.com/cdn/profilePictures/userDefault.png',
    },
    //Embedded fields
    // addresses: [
    //     {
    //         fullname: {
    //             type: String,
    //             trim: true,
    //             required: [true, "A name on the Billing/Serviceable address is required"],
    //             validate: {
    //                 validator: function (val) {
    //                     return validator.isAlpha(val, 'en-IN', {ignore: " "})
    //                 },
    //                 message: 'Invalid Name (Names should not contain numbers or any special characters)'
    //             }
    //         },
    //         phone: {
    //             type: String,
    //             trim: true,
    //             required: [true, "A phone number on the Billing/Servicable address is requried"],
    //             validate: {
    //                 validator: function (val) {
    //                     return validator.isMobilePhone(val, 'en-IN')
    //                 },
    //                 message: 'Invalid Phone Number'
    //             }
    //         },
    //         fullAddress: {
    //             type: String,
    //             trim: true,
    //             requried: [true, "The full address of the Billing/Servicable area is requried"]
    //         },
    //         houseNo: {
    //             type: String,
    //             trim: true
    //         },
    //         city: {
    //             type: String,
    //             default: "Nagaon"
    //         },
    //         state: {
    //             type: String,
    //             default: "Assam"
    //         },
    //         country: {
    //             type: String,
    //             default: "India"
    //         },
    //         pinCode: {
    //             type: String,
    //             trim: true,
    //             validate: {
    //                 validator: function (val) {
    //                     return validator.isPostalCode(val, 'IN')
    //                 },
    //                 message: 'Invalid Pin Code'
    //             }
    //         },
    //         location: {                
    //             type: {
    //                 type: String,
    //                 default: 'Point'
    //             },
    //             coordinates: [Number],
    //         }
    //     }
    // ],
    //Helper fields    
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    userType: {
        type: String,
        enum: {
            values: ['user', 'admin'],
            message: 'Invalid user privileges'
        },
        default: 'user',
        select: false
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
        select: false
    },
    isPhoneVerified: {
        type: Boolean,
        default: undefined,
        select: false
    },
    emailVerificationToken: { type: String, select: false },
    emailVerificationTokenExpiresAt: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetTokenExpiresAt: { type: Date, select: false },
    emailLastModified: { type: Date, select: false },
    passwordLastModified: { type: Date, select: false },
    phoneLastModified: {type: Date, select: false}
},{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

//Middleware

//Document middlewares

//Encrypting user passwords
// schema.pre('save', async function (next) {
//     if (this.isModified('password')) {
//         this.password = await bcrypt.hash(this.password, 8)
//         this.confirmPassword = undefined
//     }
//     next()
// })

//Query Middleware

//Static Methods

//Prototype Methods

//Check if user name is the same
schema.methods.isUserNameSame = function(firstname, lastname){
    return this.firstname === firstname && this.lastname === lastname
}

//Change username
schema.methods.updateUserName = function(firstname, lastname){
    this.firstname = firstname
    this.lastname = lastname
}
//Check if user name is the same
schema.methods.isPhoneSame = function(number){
    return this.phone === number
}

//Change username
schema.methods.updatePhone = function(number){
    this.phoneLastModified = Date.now() - 1000
    this.phone = number
}

schema.methods.isPhoneModifiedRecently = function(jwtIssue) {
    if(this.phoneLastModified){
        return parseInt(this.phoneLastModified.getTime() / 1000, 10) > jwtIssue;
    }
    return false
}

//Prototype function to set an encryption token to the emailVerificationToken in the schema
// schema.methods.setEmailVerificationToken = function () {

//     //Set email Verified flag to false
//     this.isEmailVerified = false

//     //Initialize a token first
//     const token = crypto
//         .randomBytes(32)
//         .toString('hex')

//     //Encrypt and store the token as the emailVerificationToken
//     this.emailVerificationToken = crypto
//         .createHash('sha256')
//         .update(token)
//         .digest('hex')

//     //Set the token expiration time
//     this.emailVerificationTokenExpiresAt = Date.now() + 10 * 60 * 1000

//     //Function returns the token to be sent to the user as a part of the verification URL
//     return token
// }

//Validate user email
// schema.methods.verifyUserEmail = function () {
//     this.isEmailVerified = true
//     this.emailVerificationTokenExpiresAt = undefined
//     this.emailVerificationToken = undefined
// }

// //Match passwords for login
// schema.methods.isPasswordCorrect = async function (inputPassword, actualPassword) {
//     if (await bcrypt.compare(inputPassword, actualPassword)) return true
//     return false
// }


//Schema methods

//Function to check if the token is fresh after a phone change
schema.methods.isPhoneChangedAfterAJwtIssue = function(jwtIat) {
    if(this.phoneLastModified){
        console.log(parseInt(this.phoneLastModified.getTime() / 1000, 10), jwtIat)
        return parseInt(this.phoneLastModified.getTime() / 1000, 10) > jwtIat;
    }
    return false;
}

// schema.virtual('orders', {
//     ref: 'Order',
//     foreignField: 'userId',
//     localField: '_id'
// })
// schema.methods.updatePhone = function(number){
//     if(number === this.phone){
//         return false
//     }
//     this.phone = number
//     this.phoneLastModified = Date.now() - 1000
//     return true
// }

//Indexes
schema.index({ "addresses.location": '2dsphere' })

// schema.index({ "phone": 1 }, { sparse: true, unique: true })

// schema.index({ "email": 1 }, { sparse: true, unique: true })

//Compile Schema to model
const User = new mongoose.model('User', schema)

//Default export model
module.exports = User
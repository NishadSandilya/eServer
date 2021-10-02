//Moduels
const TempPhoneVeri = require('../models/TempPhoneVeri')
const User = require('../models/User')
const AppErrors = require('../utils/AppErrors')
const { asyncHandler } = require('../utils/asyncHandler')
const { respond } = require('../utils/response')
const { sendSMS } = require('../utils/smsService')
const crypto = require('crypto')
const { respondWithJwtAndCookie } = require('../utils/jwtResponse')

//Confirm similarities between old and new number before sending OTP
exports.sameNumberUpdate = asyncHandler(async(req, res, next) => {
    //Find the user first
    const user = await User.findById(req.decodedJwt.id)

    //Throw error if user not found
    if(!user) return next(new AppErrors('We couldnot find the user in our servers', 401))

    //Else checkif user number is the same
    if(user.isPhoneSame(req.body.numbers)) return next(new AppErrors('New and old phone numbers are the same', 403))

    next()
})

//Initial sending of OTPs
exports.sendOTP = asyncHandler(async(req, res, next) => {
    const numbers = req.body.numbers
    if(!numbers){
        return next(new AppErrors('Phone number required to send an OTP', 400))
    }

    //Future v2
    // //Check for existing number in the user collection
    // const existingUser = await User.findOne({
    //     phone: numbers
    // })

    // if(existingUser) {
    //     return next(new AppErrors('User already exists, please login', 400))
    // }

    //Check if user is resending OTP without verifying the previous
    const existingNumberLog = await TempPhoneVeri.findOne({phone: numbers})

    //First time user
    if(!existingNumberLog){
        const newNumberLog = await TempPhoneVeri.create({phone: numbers})
        //Generate otp and get it here
        const otp = newNumberLog.generateOTP()
        newNumberLog.save({validateBeforeSave: false})
        //Generate Message
        const message = `${otp} is your OTP to access erida's user console`

        // console.log(message)
        // //Send the message
        await sendSMS(numbers, message)
    }
    else{
        const otp = existingNumberLog.generateOTP()
        existingNumberLog.save({validateBeforeSave: false})
        //Generate Message
        const message = `${otp} is your OTP to access erida's user console`

        // console.log(message)
        // //Send the message
        await sendSMS(numbers, message)
    }

    respond(200, 'OTP sent successfully, valid for 5 mins', null, res)
})

//Verify OTP and pass it to the next middleware (User phone auth middleware in erida v1)
exports.verifyOTP = asyncHandler(async (req, res, next) => {
    let otp = req.body.otp
    const numbers = req.body.numbers
    //Send error if OTP not present in the request
    if(!otp || !numbers){
        return next(new AppErrors('Did you forget to enter your OTP Or your Number?', 400))
    }

    //Encrypt OTP to match the one stored in database
    otp = crypto.createHash('sha256').update(otp).digest('hex')

    //Check if OTP is Valid
    const numberLog = await TempPhoneVeri.findOne({
        phone: numbers,
        otp,
        otpExpiresAt: {$gt: Date.now()}
    })
    //Return error if OTP is invalid or expired
    if(!numberLog){
        return next(new AppErrors('Seems like your OTP has expired or is invalid. Please try again'))
    }

    //Else send verification confirnation with a 200 code and update database
    await numberLog.deleteOne()

    //Stick the number to the request and pass it onto the next middleware
    req.userNumber = numbers
    next()
})

//Login with phone and OTP
exports.loginWithPhoneAndOtp = asyncHandler(async (req, res, next) => {
    //Since the phone verification has been done earlier, we now just need to get the user in (or perhaps create a new one)
    const phone = req.userNumber

    //if phone is not present, throw error
    if(!phone) return next(new AppErrors("User OTP verification required", 401))

    //Find if user already exists
    const user = await User.findOne({phone})

    //If user is not present, create a new one
    if(!user){
        const newUser = await User.create({phone})
        respondWithJwtAndCookie(200, "Hi there! Welcome to erida", {id: newUser._id}, res, next)
    }
    else{
        //Return the user
        respondWithJwtAndCookie(200, "Welcome back, there!", {id: user._id}, res, next)
    }
})
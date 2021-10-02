//Modules

const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const User = require('../models/User')
const AppErrors = require('../utils/AppErrors')
const { asyncHandler } = require('../utils/asyncHandler')

//Authenticate user
exports.auth = asyncHandler(async (req, res, next) => {
    //Check if httpOnly cookie (ESS) is present in the request headers
    if (!req.cookies.ESS) return next(new AppErrors('Secured session expired or not established. Please Log-in again', 498))

    // //Check if the authorization body starts with Bearer
    // if (!req.headers.authorization.startsWith('Bearer') || !req.headers.authorization.split(" ")[1]) return next(new AppErrors('Invalid Authorization', 401))


    //If everything is alright, store the jwt
    const token = req.cookies.ESS

    //Decode jwt
    const decodedJwt = await promisify(jwt.verify)(token, process.env.JWTSECRET)

    //Get the user first
    const user = await User.findById(decodedJwt.id).select('+phoneLastModified')

    //Throw error if user recently deleted
    if(!user) return next(new AppErrors('There was an issue with the account. Please contact support', 499))

    const cookieOptions = {
        sameSite: "none",
        path: '/',
        httpOnly: true,
        secure: true
    }

    //Check if phone has been changed recently
    if (user.isPhoneModifiedRecently(decodedJwt.iat)) return res
        .header("Access-Control-Allow-Origin", "https://erida.in")
        .header('Access-Control-Allow-Credentials', true)
        .header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
        .status(498)
        .clearCookie('ESS', cookieOptions)
        .send("Phone number changed recently, loggin-out!")
//store the jwt in a session variable
req.decodedJwt = decodedJwt

//proceed with the next middleware
next()
})

exports.admin = asyncHandler(async (req, res, next) => {
    //check if the user is legit admin
    const user = await User.findById(req.decodedJwt.id).select('+userType')
    if(user.userType !== 'admin') return next(new AppErrors('Hey, there is nothing here. You are on a restricted page. Please navigate elsewhere', 499))
    //else pass
    next()
})
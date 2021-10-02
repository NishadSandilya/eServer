const User = require('../models/User')
const AppErrors = require('../utils/AppErrors')
const { asyncHandler } = require('../utils/asyncHandler')
const { respond } = require('../utils/response')
const jwt = require('jsonwebtoken')
const { promisify } = require('util')

const router = require('express').Router()

router
    .get('/', asyncHandler(async (req, res, next) => {
        //Execute code if sst not present in the browser        
        if (!req.cookies.ESS) return next(new AppErrors('Ping Fail', 403))

        //Execute code if sst present, but something's wrong with the use account, or user unexpectedly deleted (Preflight auth)
        //If everything is alright, store the jwt
        const token = req.cookies.ESS

        //Decode jwt
        const decodedJwt = await promisify(jwt.verify)(token, process.env.JWTSECRET)

        //Get the user first
        const user = await User.findById(decodedJwt.id).select('+phoneLastModified')

        //Throw error if user recently deleted
        if (!user) return next(new AppErrors('There was an issue with the account. Please contact support', 499))

        respond(200, "Ping Successful", {}, res)
    }))

module.exports = router
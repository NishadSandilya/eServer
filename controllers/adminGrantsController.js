//This is an auth controller that grants access to certain actions for erida database manipulation
//Modules

const User = require("../models/User");
const AppErrors = require("../utils/AppErrors");
const { asyncHandler } = require("../utils/asyncHandler");

//Admin auth middleware
exports.adminAccess = asyncHandler(async(req, res, next) => {
    //Check if user is an admin
    const admin = await User.findById(req.decodedJwt.id).select('+userType')

    //Throw error if user is not an admin
    if(!admin.userType === 'admin') return next(new AppErrors('Unauthorized access', 401))

    //else, proceed to the next middleware
    next()
})
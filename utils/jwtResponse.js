//Modules
const jwt = require('jsonwebtoken')

//JWT response function
exports.respondWithJwtAndCookie = async (statusCode, message, payload, res, next) => {
    //Sending the cookie first 
    const cookieOptions = {
        sameSite: "strict",
        path: '/',
        expires: new Date(Date.now() + process.env.COOKIEEXPIRES * 24 * 60 * 60 * 1000),
        httpOnly: true
    }
    //Set secure https on production
    if (process.env.NODE_ENV === 'production') { cookieOptions[secure] = true }

    try {
        //Creating the token
        const token = await jwt.sign(payload, process.env.JWTSECRET, { expiresIn: process.env.JWTEXPIRES })

        //send token along with cookies
        res
            .header("Access-Control-Allow-Origin", "https://www.erida.in")
            .header('Access-Control-Allow-Credentials', true)
            .header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
            .status(statusCode)
            .cookie('ESS', token, cookieOptions)
            .json({
                message,
            })
    }
    catch (err) {
        next(err)
    }
}
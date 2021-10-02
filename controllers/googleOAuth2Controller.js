//Modules

const axios = require("axios");
const User = require("../models/User");
const { asyncHandler } = require("../utils/asyncHandler");
const googleOAuth2Client = require('../utils/googleOAuth2Client');
const { respondWithJwtAndCookie } = require("../utils/jwtResponse");
const Mailer = require("../utils/Mailer");

//Handling the base googleOAuth2 Call from the client
exports.googleOAuth2BaseCall = asyncHandler(async (req, res, next) => {
    //Redirect the call to the googleOAuth2 Consent Screen

    //Declaring access scopes first
    const scope = ['profile', 'openid', 'email']

    //Generate the oauth2 consent screen link
    const consentScreenUri = await googleOAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope
    })

    //Finally redirect the client call to the OAuth2 consent screen
    res.redirect(consentScreenUri)
})

//Handling the redirect callback after the user grants access to all the scopes
exports.googleOAuth2RedirectCallback = asyncHandler(async (req, res, next) => {
    //Extract code first from the response
    const code = req.query.code

    //Decrypt access tokens and idtokens from the above code
    const { tokens } = await googleOAuth2Client.getToken(code)

    //Set credentials to the client
    googleOAuth2Client.setCredentials(tokens)

    //use access token and id token inside tokens to send req to the google authorization servers and fetch the required user information based on the scopes provided
    const googleUser = await axios({
        url: `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleOAuth2Client.credentials.access_token}`,
        headers: {
            Authorization: `Bearer ${googleOAuth2Client.credentials.id_token}`
        }
    })

    //Database Works
    const existingUser = await User.findOne({
        email: googleUser.data.email
    })

    //Create a new user if googleuser not found in erida's database
    if (!existingUser) {
        const user = await new User({
            name: googleUser.data.name,
            email: googleUser.data.email,
            isEmailVerified: googleUser.data.verified_email,
            avatar: googleUser.data.picture
        })
        user.save({ validateBeforeSave: false })
        //Send user email verification link if user's email is not verified in google
        if (!user.isEmailVerified) {
            const token = user.setEmailVerificationToken();
            user.save({ validateBeforeSave: false })

            await new Mailer(user, `http://localhost:8000/v1/users/verify-email/${token}`)
                .sendInitialVerificationEmail()
        }

        //Send jwt and log the user in
        respondWithJwtAndCookie(201, 'Google user added to erida', {id: user._id}, res, next)
    }
    else{
        respondWithJwtAndCookie(200, 'Google user exists in erida', {id: existingUser._id}, res, next)
    }
})


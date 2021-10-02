//Modules here
const { google } = require('googleapis')

//Initialize the global oAuth2 client
const googleOAuth2Client = new google.auth.OAuth2({
    clientId: process.env.OAUTHCLIENTID,
    clientSecret: process.env.OAUTHCLIENTSECRET,
    redirectUri: process.env.OAUTHREDIRECT
})

//Set this above client as a global default auth client for erida
google.options({
    auth:googleOAuth2Client
})

//Default export client
module.exports = googleOAuth2Client
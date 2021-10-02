//Modules here
const axios = require('axios')

//Initializing the smpp uri
const smppUri = `https://www.fast2sms.com/dev/bulkV2`

//Initializing the smsEngine
exports.sendSMS = async (numbers, message) => {
    try {
        //send a post req to the smppuri
        await axios({
            method: 'post',
            url: smppUri,
            data: {
                route: "v3",
                sender_id: "TXTIND",
                message,
                language: "english",
                flash: 0,
                numbers
            },
            headers:{
                authorization:process.env.FAST2SMSAPIKEY,
                "Content-Type": "application/json"
            }
        })
    }
    catch (err) {
        next(err)
    }
}

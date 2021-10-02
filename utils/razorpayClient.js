const razorpay = require('razorpay')

//Create a new razorpay client instance
const rpInstance = new razorpay({
    key_id: process.env.RPKEY,
    key_secret: process.env.RPSECRET
})

//Default export rpInstance
module.exports = rpInstance

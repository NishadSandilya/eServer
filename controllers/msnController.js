const { asyncHandler } = require("../utils/asyncHandler");
const MSNMail = require("../utils/msnMail");
const { respond } = require("../utils/response");
const { sendSMS } = require("../utils/smsService");

//Create a controller just to send emails and sms at the same time
exports.sendAppointmentDetails = asyncHandler(async(req, res, next) => {
    //Structure the Appointment Details first
    const appointment = {
        name: req.body.name,
        phone: req.body.phone,
        age: req.body.age,
        address: req.body.address,
        sex: req.body.sex,
        date: req.body.date,
        time: req.body.time
    }
    //Send the Mail first
    await new MSNMail(appointment).sendEmailNotification()

    // //Send msn the SMS
    await sendSMS(8486887503, `Alert! New Appointment received in Mail. Please check your gmail inbox at ${'https://mail.google.com'}`)

    // //Send the user an SMS as well
    await sendSMS(req.body.phone, `Hi ${req.body.name}! Welcome to MSN Eye Hospital. We have received your online appointment and will get to you soon.`)

    respond(200, 'Successful', {}, res)
})
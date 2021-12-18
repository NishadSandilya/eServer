//This router will have only one route to send mails and sms together to the requried target

const { sendAppointmentDetails } = require('../controllers/msnController')

const router = require('express').Router()

router
    .route('/comms')
    .post(sendAppointmentDetails)

module.exports = router
//Modules
const nodemailer = require('nodemailer')

//A Mailer class to facilitate emails
class MSNMail {
    //Declaring class properties
    constructor(appointment) {
        this.to = "msncataractiolhospital@gmail.com"
        this.from = `Appointment Notification System <${process.env.NODEMAILERSENDER}>`
        this.appointment = appointment
    }

    //create a new transport
    newTransport() {
        return nodemailer.createTransport({
            service: 'SendGrid',
            auth: {
                user: process.env.SENDGRIDAPIKEY,
                pass: process.env.SENDGRIDPASSWORD
            }
        })
    }

    //Creating a sender method
    async sender(subject) {

        //Defining the mail options
        const mailOptions = {
            to: this.to,
            from: this.from,
            subject,
            text: `Appointment Details: \n Patient's Name: ${this.appointment.name} \n Patient's Age: ${this.appointment.age} \n Gender: ${this.appointment.sex} \n Address: ${this.appointment.address} \n Preferred Date: ${this.appointment.date} \n Preferred Time: ${this.appointment.time}`
        }

        //Finally send the email
        await this.newTransport().sendMail(mailOptions)
    }

    //Creating specific function methods
    async sendEmailNotification() {
        await this.sender(`Hi there at MSN! ${this.appointment.name} has placed an online appointment for ${this.appointment.date} at ${this.appointment.time}`)
    }
}

//Default export module
module.exports = MSNMail
//Modules
const nodemailer = require('nodemailer')

//A Mailer class to facilitate emails
class SelfMail {
    //Declaring class properties
    constructor(order) {
        this.to = "theesaan@gmail.com"
        this.from = `Team erida <${process.env.NODEMAILERSENDER}>`
        this.order = order
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
            text: `Order ID: ${this.order.orderId}, Order Type: ${this.order.orderType}, User Phone: ${this.order.phone}, User Notes if any: ${this.order.userNotes}`
        }

        //Finally send the email
        await this.newTransport().sendMail(mailOptions)
    }

    //Creating specific function methods
    async sendEmailNotification() {
        await this.sender(`Hi Nishad, new ${this.order.orderType}, for erida, with Order ID ${this.order.orderId}`)
    }
}

//Default export module
module.exports = SelfMail
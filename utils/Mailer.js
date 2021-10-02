//Modules
const nodemailer = require('nodemailer')
const pug = require('pug')
const path = require('path')

//A Mailer class to facilitate emails
class Mailer {
    //Declaring class properties
    constructor(user, url) {
        this.firstname = user.name.split(" ")[0]
        this.to = user.email
        this.from = `Team erida <${process.env.NODEMAILERSENDER}>`
        this.url = url
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
    async sender(emailTemplateName, subject) {

        //Initializing the pug templates
        const html = pug.renderFile(path.join(__dirname, `../views/${emailTemplateName}.pug`), {
            firstname: this.firstname,
            url: this.url
        })

        //Defining the mail options
        const mailOptions = {
            to: this.to,
            from: this.from,
            subject,
            html
        }

        //Finally send the email
        await this.newTransport().sendMail(mailOptions)
    }

    //Creating specific function methods
    async sendInitialVerificationEmail() {
        await this.sender(`greetingsWithEmailVerification`, `${this.firstname}, please verify your email`)
    }

    async sendUpdatedEmailVerificationEmail() {
        await this.sender(`emailChangeWithVerification`, `${this.firstname}, please verify your new email`)
    }

    async sendOrderPlacedEmail() {
        await this.sender('orderPlaced', `Order successfully placed`)
    }

    async sendPasswordResetLink() {
        await this.sender('passwordResetLink', `${this.firstname}, here's the link to reset your password`)
    }

    async sendPasswordChangeConfirmationEmail () {
        await this.sender('passwordChangeConfirmation', `${this.firstname}, critical account changes`)
    }
}

//Default export module
module.exports = Mailer
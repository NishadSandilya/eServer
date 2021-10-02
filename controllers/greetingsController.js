const { respond } = require("../utils/response")

//Erida Greetings controller
exports.welcome = (req, res, next) => {
    respond(200, `This is the REST API for erida. Please visit our site at: https://erida.in to learn more.`, null, res)
}
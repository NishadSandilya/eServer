//Generic response function for controllers
exports.respond = (statusCode, message, payload, res) => {
    res
        .header("Access-Control-Allow-Origin", "https://erida.in")
        .header('Access-Control-Allow-Credentials', true)
        .header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
        .status(statusCode)
        .json({
            message,
            payload
        })
}
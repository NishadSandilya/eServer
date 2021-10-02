//Express global error handler middleware
exports.errorHandler = (err, req, res, next) => {
    //Logging the actual error with the trace
    console.error(`Error, ${err}`)

    //Appending properties to the error instance(Actual client response prep)
    err.statusCode = err.statusCode || 500

    //Further modifications

    //For mongo validation errors
    if (err.name === 'ValidationError') { err.message = `Umm... your input seems invalid` }

    //For regular errors
    if (err.name === 'Error') { err.message = `Something's wrong on our side` }

    //For Type errors
    if (err.name === 'TypeError') { err.message = `Something's wrong on our side` }
    
    //For mongo errors
    if (err.name === 'MongoError') { err.message = `Something's wrong on our side` }

    //For mongo duplicate entries
    if (err.code === 11000) { err.message = `Duplicate entries found. Please recheck your input` }

    //Masking actual error
    err.name = "AppError"

    //Sending error response to the client
    res
        .status(err.statusCode)
        .json({
            error: err.message
        })
}

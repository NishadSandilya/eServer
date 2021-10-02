//Async handler to catch rejections of async functions
exports.asyncHandler = callbackFunction => {
    return (req, res, next) => {
        callbackFunction(req, res, next)
            .catch(next)
    }
}
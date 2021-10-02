//AppErrors class to create custom operational errors
class AppErrors extends Error {
    constructor(message, statusCode){
        //Calling super to invoke parent constructor
        super(message)

        //custom prototype properties
        this.statusCode = statusCode
        //Set name
        this.name = 'AppError'
    }
}

//Default exports
module.exports = AppErrors
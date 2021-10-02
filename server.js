//This is the server for Erida.

//Initializing the environment variables
process.env.NODE_ENV === 'development' && require('dotenv').config({
    path: './config.env'
})

//Handling uncaughtExceptions
process.on('uncaughtException', error => {
    //Log the error
    console.error(`UNKNOWN ERROR, Restart needed. ${error}`)

    //Exit node process immediately 
    process.exit(1)
})

//Defining all required params
const port = process.env.PORT
const app = require('./app')

//Initializing the server
const server = app.listen(port, console.log(`Server started on port ${port}`))

//Handling heroku's SIGTERM signal
process.on('SIGTERM', () => {
    //Gracefully close server
    server.close(() => {
        console.log(`Scheduled server restart by heroku`)
    })
})

//Handling unhandledRejections
process.on('unhandledRejection', error => {
    //Log error
    console.error(`FATAL ERROR, Restart needed. ${error}`)

    //Close down server gracefully
    server.close(() => {

        //Finally exit the node process and restart the heroku dyno* 
        process.exit(1)
    })
})

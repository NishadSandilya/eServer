//Modules
const express = require('express')
const { errorHandler } = require('./utils/errorHandler')
const { unhandledRouteHandler } = require('./utils/unhandledRouterHandler')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const path = require('path')
const cookieParser = require('cookie-parser')

//Secure Modules
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')

//Routers 
const greetingsRouter = require('./routers/greetingsRouter')
const userRouter = require('./routers/userRouter')
const googleOAuth2Router = require('./routers/googleOAuth2Router')
const phoneVerificationRouter = require('./routers/phoneVerificationRouter')
const reCaptchaV2Router = require('./routers/reCaptchaV2Router')
const meRouter = require('./routers/meRouter')
const adminRouter = require('./routers/adminRouter')
const orderRouter = require('./routers/orderRouter')
const itemRouter = require('./routers/itemRouter')
const razorpayRouter = require('./routers/razorpayRouter')
const ping = require('./routers/ping')
const courseRouter = require('./routers/courseRouter')
const msnRouter = require('./routers/msnRouter')

//Initialize a rate limiter to prevent brute force and DOS attacks
const limiter = rateLimit({
    max: 5000,
    windowMs: 60 * 60 * 1000,
    message: `Number of requests exceeded for you at the moment. Please try again in an hour`
})

//Connect to database
require('./utils/dbConnection')

//Random Playground

//Middlewares

//Enabling cors only for erida (Browser only)
//Setting cors options
// const corsOptions = {
//     origin: 'https://nishadsandilya.github.io',
//     optionsSuccessStatus: 200
// }

// const whitelist = ['http://localhost:3000', 'https://nishadsandilya.github.io']

// const corsOptions = {
//     origin: function(origin, callback){
//         if(whitelist.indexOf(origin) !== -1)
//             callback(null, true)
//         else
//             callback(new Error('Not allowed by cors'))
//     },
//     optionsSuccessStatus: 200
// }

const whitelist = ['https://nishadsandilya.github.io','http://localhost:3000', 'https://erida.in']

const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    optionsSuccessStatus: 200,
    credentials: true,
}

//Return no favico
app.get('/favicon.ico', (req, res) => { res.status(204) })

//using cors on all routes
app.use(cors(corsOptions))
//using cors options on all routes(Preflight)
app.options('*', cors(corsOptions))

//Set secure HTTP Headers
app.use(helmet())

//Morgan for development environment
process.env.NODE_ENV === 'development' && app.use(morgan('dev'))

//Use the rate limiter
app.use('/', limiter)

//cookie Parser
app.use(cookieParser())

//JSON parser
app.use(express.json({ limit: '10kb' }))

//Form-data parser
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

//Set views and view engine
// app.set('view engine', 'pug')
// app.set('views', path.join(__dirname, 'views'))

//Serve static files
app.use(express.static(path.join(__dirname, 'public')))

//Data sanitization against noSQL Query Injections
app.use(mongoSanitize())

//Data sanitization against XSS
app.use(xss())

//Prevent parameter polution/ duplication
app.use(hpp())

//Use Routers
app.use(greetingsRouter)
app.use('/v1', ping)
app.use('/v1/users', userRouter)
app.use('/v1/courses', courseRouter)
app.use('/v1/auth/googleOAuth2', googleOAuth2Router)
app.use('/v1/users/phone', phoneVerificationRouter)
app.use('/v1/secure/reCaptcha-validation', reCaptchaV2Router)
app.use('/v1/users/me', meRouter)
app.use('/v1/admin', adminRouter)
app.use('/v1/orders', orderRouter)
app.use('/v1/payments', razorpayRouter)
app.use('/v1/appointment-service', msnRouter)
// app.use('/v1/items', itemRouter)

//Handling unhandled routes
app.all('*', unhandledRouteHandler)

//Express global error handler
app.use(errorHandler)

//Export app
module.exports = app
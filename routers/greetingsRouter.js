const { welcome } = require('../controllers/greetingsController')

//Modules
const router = require('express').Router()

//Initializing the basic erida welcome route
router
    .route('/')
    .get(welcome)

//Default export
module.exports = router
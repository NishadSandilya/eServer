//Required modules here
const router = require('express').Router()

router
    .route('/')
    .get(getAllCourses)

//Default export router
module.exports = router
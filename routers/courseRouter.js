const { getAllCourses, getParticularCourse } = require('../controllers/courseController')

//Required modules here
const router = require('express').Router()

router
    .route('/')
    .get(getAllCourses)

router
    .route('/:name')
    .get(getParticularCourse)

//Default export router
module.exports = router
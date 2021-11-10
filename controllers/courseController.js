const Tempcourse = require("../models/Tempcourse");
const AppErrors = require("../utils/AppErrors");
const { asyncHandler } = require("../utils/asyncHandler");
const { respond } = require("../utils/response");

//Required modules here
exports.getAllCourses = asyncHandler(async(req, res, next) => {
    const courses = await Tempcourse.find().select('-__v')
    respond(200, "Courses fetched!", courses, res)
})

exports.getParticularCourse = asyncHandler(async(req, res, next) => {
    const course = await Tempcourse.find({name: req.params.name})
    if(!course || !course.length) {
        return next(new AppErrors('Sorry, we couldnot find the course you are looking for'))
    }
    respond(200, "Course fetched!", course, res)
})
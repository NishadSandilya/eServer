const Tempcourse = require("../models/TempCourse");
const { asyncHandler } = require("../utils/asyncHandler");
const { respond } = require("../utils/response");

//Required modules here
exports.getAllCourses = asyncHandler(async(req, res, next) => {
    const courses = await Tempcourse.find().select('-__v')
    respond(200, "Courses fetched!", courses, res)
})
const Item = require("../models/Item");
const AppErrors = require("../utils/AppErrors");
const { asyncHandler } = require("../utils/asyncHandler");
const { respond } = require("../utils/response");

exports.addItem = asyncHandler(async(req, res, next)=> {
    if(!req.body.SKU || !req.body.name || !req.body.value) return next(new AppErrors('Missing data fields', 400))

    //Else add the item to the items collection
    await Item.create(req.body)

    respond(200, "New item added", null, res)
})
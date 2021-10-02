//Factory controllers for various verbs for different collections

//Modules
const { asyncHandler } = require("../utils/asyncHandler");
const AppErrors = require('../utils/AppErrors')
const { respond } = require("../utils/response");
const APIFeatures = require("../utils/APIFeatures");

//Update a document
exports.updateDocument = model => {
    return asyncHandler(async (req, res, next) => {

        //Else, update the document
        const doc = await model.findByIdAndUpdate(req.params.docId, req.body, { upsert: true, new: true })

        if (!doc) return next(new AppErrors('Document not found', 404))

        respond(200, "updated", doc, res)
    })
}

//Create a document
exports.createDocument = model => {
    return asyncHandler(async (req, res, next) => {
        await model.create(req.body)
        //Send response to the client
        respond(201, "Document Inserted", null, res)
    })
}

//Get all docs
exports.getAllDocs = model => {
    return asyncHandler(async (req, res, next) => {
        let initialQuery = new APIFeatures(model.find(), req.query)

        //perform prototype methods
        initialQuery.filter().sort().fields().page()

        const docs = await initialQuery.query

        //get results lentgh
        const docsReturned = docs.length

        const results = {
            docsReturned,
            docs
        }

        respond(200, 'docs fetched', results, res)
    })
}
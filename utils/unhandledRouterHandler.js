const AppErrors = require("./AppErrors");

//Initializing the unhandled route handler
exports.unhandledRouteHandler = (req, res, next) => { next(new AppErrors(`Requested route not found in Erida Servers`, 404)) }
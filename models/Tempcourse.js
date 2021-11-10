//Temp file to store utkarsh's courses file
//Required modules
const mongoose = require('mongoose')

//Create a new schema
const schema = new mongoose.Schema({
    name: String,
    rating: Number,
    cover: String,
    desc: String
})

//Compile the schema
const Tempcourse = new mongoose.model('Tempcourse', schema)

//Export default model
module.exports = Tempcourse
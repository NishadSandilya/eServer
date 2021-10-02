const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    SKU: {
        type: String,
        required: [true, "SKU is required"],
        unique: true,
        trim: true
    },
    value: {
        type: Number,
        required: [true, "Item value is required"]
    },
    name: {
        type: String,
        required: [true, "Item name is required"],
        trim: true
    }
})

//compile schema
const Item = new mongoose.model('Item', schema)

module.exports = Item
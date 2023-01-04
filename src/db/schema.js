const {Schema, model} = require('mongoose');

// const historialSchema = new Schema({
//     query: String,
//     domain: String,
//     url : String,
//     page: Number,
//     searchEngine: String,
//     success: Boolean,
//     date: { type: Date, default: Date.now },
// })


const historialSchema = new Schema({
    query: String,
    domain: String,
    search: [{  
    url : String,
    page: Number,
    searchEngine: String,
    success: Boolean
}],
    date: { type: Date, default: Date.now },
})

module.exports = model("historial", historialSchema);
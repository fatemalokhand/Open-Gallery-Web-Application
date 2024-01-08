// requiring mongoose
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// creating the artwork schema
let artworkSchema = Schema({
    Title: {
        type: String,
        required: true
    },
    Artist: {
        type: String,
        required: true
    },
    Year: {
        type: String,
        required: true
    },
    Category: {
        type: String,
        required: true
    },
    Medium: {
        type: String,
        required: true
    },
    Description: {
        type: String,
        required: false
    },
    Poster: {
        type: String,
        required: true
    },
    Reviews: [{text: {type: String}, reviewer: {type: String}}],
    Likes: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

// creating the model called Artwork
module.exports = mongoose.model('Artwork', artworkSchema);
// requiring mongoose
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// creating the user schema
let userSchema = Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    reviews: [{text: {type: String}, reviewer: {type: String}}],
    likes: [{ type: Schema.Types.ObjectId, ref: 'Artwork' }],
    artworks: [{type: String}],
    workshops: [{type: String}],
    notifications: [{type: String}],
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

// creating a model called User
module.exports = mongoose.model('User', userSchema);
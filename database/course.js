const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    title: String,
    description: String,
    instructor: String,
    price: Number,
    thumbnail: String,
    video: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Course", courseSchema);
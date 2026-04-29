const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, required: true },
    password: String,
    role: { type: String, default: "student" },

    googleId: {
        type: String,
        default: null
    },

    profilePic: {
        type: String,
        default: null
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("User", userSchema);
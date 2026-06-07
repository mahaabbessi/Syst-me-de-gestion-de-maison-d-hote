const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    phone: {
        type: String,
        required: false,
    },
    role: {
        type: String,
        enum: ["client", "owner"],
        default: "client"
    }
}, { timestamps: true });


module.exports = mongoose.model("user", UserSchema);
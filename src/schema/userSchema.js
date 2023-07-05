    const mongoose = require("mongoose");

    const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    userType: { type: String, required: true },// Ensure userType is defined as a String and required
    fotgotOtpCode:{type:String,default:''}
    });

    module.exports = mongoose.model("users", userSchema);

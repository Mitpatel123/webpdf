// const mongoose = require('mongoose')
// const userType=require ('../common/enum')


// const userSchema = new mongoose.Schema({
//     name: { type: String, require: true },
//     phoneNumber: { type: String, require: true },
//     userType: { type: Number, require: true, enum: userType },
//     city: { type: String, require: true },
//     schoolName: { type: String, require: true },
//     otp: { type: String },
//     avtar: { type: String },
//     email:{type: String},
//     password:{type: String},
//     otpVerificationCode: { type: String },
//     fotgotOtpCode:{ type: String },
//     rewardPoints: { type: Number, default: 0 },
//     isActive: { type: Boolean, default: true },
//     isDelete: { type: Boolean, default: false },
//     isVerified: { type: Boolean, default: false },
//     createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "userModel" },
//     updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "userModel" },
// }, { timestamps: true }
// )
// module.exports = mongoose.model("Users", userSchema);

const mongoose = require('mongoose');
const userType = require('../common/enum');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  userType: { type: String, required: true, enum: Object.values(userType) },
  otp: String,
  avatar: String,
  email: String,
  password: String,
  otpVerificationCode: String,
  forgotOtpCode: {type:String,default:''},
  isActive: { type: Boolean, default: true },
  isDelete: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
}, { timestamps: true });

  module.exports = mongoose.model("Users", userSchema); //Users te database ma Users name nu collection banave chhe 

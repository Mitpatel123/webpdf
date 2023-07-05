const mongoose = require('mongoose');
const userType = require('../common/enum');

const userpdfSchema = new mongoose.Schema({
  userid: { type: String, required: true },
  path: { type: Array, required: true },
  actionofdocument:{type:String,require:true},
  userType: { type: String, required: true, enum: Object.values(userType) },
  isDelete: { type: Boolean, default: false },

}, { timestamps: true });

  module.exports = mongoose.model("userpdfaction", userpdfSchema); //Users te database ma Users name nu collection banave chhe 


// const mongoose = require('mongoose');
// const userType = require('../common/enum');

// const userpdfSchema = new mongoose.Schema(
//   {
//     userid: { type: String, required: true },
//     actionofdocument: { type: String, required: true },
//     userType: { type: String, required: true, enum: Object.values(userType) },
//     isDelete: { type: Boolean, default: false },
//   },
//   { timestamps: true }
// );
// const MAX_NUMBER_OF_PATHS = 10;

// // Dynamically add path fields based on the number of split paths
// for (let i = 1; i <= MAX_NUMBER_OF_PATHS; i++) {
//   userpdfSchema.add({
//     [`path${i}`]: { type: String, required: true },
//   });
// }

// module.exports = mongoose.model('userpdfaction', userpdfSchema);

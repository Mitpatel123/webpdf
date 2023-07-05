const mongoose = require('mongoose');
const excelDataSchema = new mongoose.Schema({
    // Define your schema fields here
    // For example:
    name: String,
    age: Number,
    email: String,
  });

  module.exports = mongoose.model("excel", excelDataSchema);

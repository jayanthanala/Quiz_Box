const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  teacherid: String,
  access:String   //access code
});

module.exports = mongoose.model("Exam",examSchema);

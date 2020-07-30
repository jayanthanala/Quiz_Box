const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  teacherid: String,
  access:String,   //access code
  status:String,
  title:String
});

module.exports = mongoose.model("Exam",examSchema);

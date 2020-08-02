const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  teacherid: String,
  access:String,   //access code
  status:String,
  title:String,
  marks:Number,
  noquestions:Number,
  date:Date,
  students:[]
});

module.exports = mongoose.model("Exam",examSchema);

const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  q:String,   //question
  options: [],
  ans:Number,
  unattempted:Number,
  wrongans:Number,
  ans:Number,
  examid:String,
  marks:Number
});

module.exports = mongoose.model("Question",questionSchema);

const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  qtype:Number,
  q:String,   //question
  options: [],
  optioncount:[Number],
  ans:Number,
  unattempted:Number,
  wrongans:Number,
  rightans:Number,
  examid:String,
  marks:Number
});

module.exports = mongoose.model("Question",questionSchema);

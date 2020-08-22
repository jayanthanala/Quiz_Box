const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  q:String,   //question
  options: [],
  optioncount:[],
  ans:Number,
  unattempted:Number,
  wrongans:Number,

  rightans:Number,

  examid:String,
  marks:Number
});

module.exports = mongoose.model("Question",questionSchema);

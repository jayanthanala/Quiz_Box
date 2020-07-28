const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  q:String,   //question
  options: [],
  ans:Number,
  unattempted:Number,
  wrongans:Number,
  rightans:Number,
  examid:String
});

module.exports = mongoose.model("Question",questionSchema);

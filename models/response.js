const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema({
  answers:[],
  marks:Number,
  userid:String,
  examid:String
});

module.exports = mongoose.model("Response",responseSchema);

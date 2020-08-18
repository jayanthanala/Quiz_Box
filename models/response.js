const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema({
  answers:[
    {
      id:String,
      marked:Number
    }
  ],
  marks:Number,
  userid:String,
  examid:String
});

module.exports = mongoose.model("Response",responseSchema);

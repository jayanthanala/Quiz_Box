const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema({
  answers:[
    {
      type:Number,
      id:String,
      marked:Number,
      link:String,
      marksAlloted:Number
    }
  ],
  marks:Number,
  userid:String,
  examid:String
});

module.exports = mongoose.model("Response",responseSchema);

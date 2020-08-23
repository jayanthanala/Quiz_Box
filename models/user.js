const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  username:String,
  name:String,
  email:String,
  password:String,
  examid:[],
  attempted:[],
  role: Number
});

userSchema.plugin(passportLocalMongoose);

var User = mongoose.model("User",userSchema);

module.exports = User;

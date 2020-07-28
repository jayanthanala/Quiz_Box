const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const teacherSchema = new mongoose.Schema({
  username:String,
  password:String
});

teacherSchema.plugin(passportLocalMongoose);

var Teacher = mongoose.model("Teacher",teacherSchema);

module.exports = Teacher;

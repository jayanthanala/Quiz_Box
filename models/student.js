const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const studentSchema = new mongoose.Schema({
  username:String,
  name:String,
  email:String,
  password:String,
  examid:[]
});

studentSchema.plugin(passportLocalMongoose);

var Student = mongoose.model("Student",studentSchema);

module.exports = Student;

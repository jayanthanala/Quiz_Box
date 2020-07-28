const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const studentSchema = new mongoose.Schema({
  username:String,
  password:String
});

studentSchema.plugin(passportLocalMongoose);

var Student = mongoose.model("Student",studentSchema);

module.exports = Student;

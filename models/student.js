const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  username:String,
  password:String
});

var Student = mongoose.model("Student",teacherSchema);

module.exports = Student;

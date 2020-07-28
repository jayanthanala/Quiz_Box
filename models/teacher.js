const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  username:String,
  password:String
});

var Teacher = mongoose.model("Teacher",teacherSchema);

module.exports = Teacher;

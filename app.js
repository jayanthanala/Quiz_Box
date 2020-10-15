require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const excel = require("read-excel-file/node");
const fs = require("fs");
const axios = require("axios");
const socket = require("socket.io");
const methodOverride = require("method-override");
const User = require("./models/user.js");
const Exam = require("./models/exam.js");
const Response = require("./models/response.js");
const Question = require("./models/question.js");
const upload = require("./multert.js");
const examUpload = require("./multers.js");
const moment = require("moment");
// const pdf = require("pdf-lib");
const seed = require("./seed.js");
const formidable = require("formidable");
const { PDFDocument } = require('pdf-lib');

//seed();


app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(methodOverride("_method"));

//setting up the passport package and express-session package
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

//databse setup
mongoose.connect("mongodb://localhost/QuizDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});
mongoose.set("useCreateIndex", true);

//passport config
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

////////////////////////////////////////////////////////////////////   GETS    //////////////////////////////////////////////////////////////
app.get("/", (req, res) => {
  res.render("landing");
});


app.get("/login", (req, res) => {
  res.render("login");
});

/////////////////////////////////////////////////////  Teacher ROUTES  ///////////////////////////////////

app.get("/te/register", (req, res) => {
  res.render("teregister")
});



app.get("/te/logout", authenticatedTeacher, (req, res) => {
  req.logout();
  res.redirect("/");
});

app.get("/te/index", authenticatedTeacher, (req, res) => {
  res.render("teindex");
})

app.get("/te/exam/new", authenticatedTeacher, (req, res) => {
  res.render("newexam");
});

app.get("/te/exam/completed", authenticatedTeacher, (req, res) => {
  Exam.find({status:"completed",teacherid:req.user._id},(err,exams) => {
    if(err){console.log(err);}
    else{
      res.render("completed",{exams:exams.reverse()})
    }
  })
});

app.get("/te/exam/staged", authenticatedTeacher, (req, res) => {
  Exam.find({
    status: "staged",
    teacherid: req.user._id
  }, (error, exams) => {
    if (error) console.log(error);
    else {
      //console.log(exams);
      res.render("staged", {
        exams: exams
      });
    }
  })
});

app.get("/te/exam/ready", authenticatedTeacher, (req, res) => {
  Exam.find({teacherid: req.user._id,status:{$ne:"completed"}}, (error, exams) => {
    if (error) console.log(error);
    else {
      console.log(exams);
      res.render("examready", {
        exams: exams
      });
    }
  })

});

app.get("/te/exam/:id/students", authenticatedTeacher, (req, res) => {
  Exam.findById(req.params.id, (error, exam) => {
    if (error) console.log(error);
    else {
      var students = exam.students;
      var attempted = exam.attempted;
      students.sort();
      res.render("examstudents",{students:students,attempted:attempted,id:exam._id,access:exam.access});
    }
  })
});

//in future if req , give an option for editing the title also!
app.get("/te/exam/:id/edit", (req, res) => {
  Question.find({
    examid: req.params.id
  }, (error, questions) => {
    if (error) console.log(error);
    else {
      var id = req.params.id;
      Exam.findById(req.params.id, (er, exam) => {
        //  console.log(exam.marks,exam.noquestions);
        res.render("editexam", {
          questions: questions,
          marks: exam.marks,
          qno: exam.noquestions
        });

      })

    }
  })
});


////this page has socket connection so no need to send anything
app.get("/te/exam/:id/responses", (req, res) => {
  Question.find({
    examid: req.params.id,
    qtype: 0
  }, (e, questions) => {
    Response.find({
      examid: req.params.id
    }, (er, s) => {
      //console.log("****************************************s",s);
      res.render("responses", {
        id: req.params.id,
        questions: questions,
        responses: s
      });
    })

  })

})

/*Question.deleteMany({examid:id},(e)=>{
  if(e) console.log(e);
})*/


/////////////////////////////// Student Routes ////////////////////////////////

app.get("/st/register", (req, res) => {
  res.render("stregister")
});

app.get("/st/logout", authenticatedStudent, (req, res) => {
  req.logout();
  res.redirect("/");
});

app.get("/st/index", authenticatedStudent, (req, res) => {
  Exam.find({
    students: req.user.username
  }, (err, exams) => {
    if (err) {
      console.log(err);
    } else {
      //  console.log(exams);
      res.render("stindex", {
        req: req.user,
        exams: exams
      })
    }
  });
});

app.get("/st/add/:id", authenticatedStudent, (req, res) => {
  var access = req.params.id;
  Exam.findOneAndUpdate({
    access: access
  }, {
    $push: {
      students: req.user.username
    }
  }, (err) => {
    if (err) {
      console.log(err);
    } else {
      User.updateOne({
        username: req.user.username
      }, {
        $push: {
          examid: access
        }
      }, (err) => {
        res.redirect("/st/index");
      });
    }
  });
});

app.get("/st/exam/:id", authenticatedStudent, (req, res) => {
  //console.log("exams");
  Question.find({
    examid: req.params.id
  }, (err, questions) => {
    if (err) {
      console.log(err);
    } else {
      Exam.findById(req.params.id, (e, exam) => {
        //console.log("hello");
        res.render("stexam", {
          questions: questions,
          exam:exam,
          req:req.user,
          duration: exam.duration,
          start: exam.date,
          close: exam.closedate
        });
      })

    }
  });
});

app.get("/st/completed", authenticatedStudent, (req, res) => {
  Exam.find({
    attempted: req.user.username
  }, (err, exams) => {
    if (err) {
      console.log(err);
    } else {
      res.render("stcompleted", {
        req: req.user,
        exams: exams.reverse()
      });
    }
  });
});

app.get("/st/results/:id", authenticatedStudent, (req, res) => {
  var eid = req.params.id;
  Question.find({
    examid: req.params.id
  }, (err, questions) => {
    if (err) {
      console.log(err);
    } else {
      Response.find({
        $and: [{
          'examid': eid
        }, {
          'userid': req.user.username
        }]
      }, (err, response) => {
        if (err) {
          console.log(err);
        } else {
          Exam.findById(req.params.id, (err, exam) => {
            if (err) {
              console.log(err);
            } else {
              //console.log(exam);
              res.render("stresults", {
                questions: questions,
                response: response,
                req:req.user,
                moment:moment,
                exam: exam
              });
            }

          });
        }
      });
    }
  });
});





////////////////////////////////////////////////////////////////////   POSTS    //////////////////////////////////////////////////////////////

app.post("/login", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, (error, sol) => {
    if (error) console.log(error);
    else {
      passport.authenticate("local")(req, res, () => {
        if (req.user.role == 1) {
          res.redirect("/te/index");
        } else {
          res.redirect("/st/index");
        }
      })
    }
  })
});


/////////////////////////////////////////// Teacher Routes //////////////////////

app.post("/te/register", (req, res) => {
  User.register({
    username: req.body.username,
    role: 1,
    name:req.body.name,
    email:req.body.email
  }, req.body.password, (error, sol) => {
    if (error) console.log(error);
    else {
      //  console.log(sol);

      passport.authenticate("local")(req, res, () => {
        res.redirect("/te/index");
      });
    }
  });
});



app.post("/te/exam/new", authenticatedTeacher, (req, res) => {
  var accessCode = "";
  var questions = req.body.questions;
  var options = req.body.options;

  for (var i = 1; i <= 6; i++) {
    accessCode += String.fromCharCode((Math.floor(Math.random() * 42)) + 48);
  }
  //console.log(accessCode);

  var exam = {
    teacherid: req.user._id,
    access: accessCode,
    status: "staged",
    title: req.body.title
  }
  //console.log("sdamdklsa");
  Exam.create(exam, (error, exam) => {
    if (error) console.log(error);
    else {
      //  console.log("************************************************************8");
      var marks = 0;
      questions.forEach((q, i) => {
        if (q.ans) {
          q["qtype"] = 0;
          q["options"] = options[i];
          //  console.log(options[i],options[i].length);
          let array = [];
          for (var x = 0; x <= options[i].length - 1; x++) {
            array[x] = 0;
          };
          q["optioncount"] = array;
          q["examid"] = exam._id;
          q["unattempted"] = q["wrongans"] = q["rightans"] = 0;
          marks += Number(q["marks"]);
        } else {
          console.log("filetype");
          q["qtype"] = 1;
          q["examid"] = exam._id;
          marks += Number(q["marks"]);
        }
      });
      //TRY TO REFACTOR THIS CODE LATER TO MAKE IT MORE DRY AND FAST!!
      var noquestions = questions.length;
      Question.insertMany(questions, (e, q) => {
        if (e) console.log(e);
        else {
          console.log(q);
          exam["marks"] = marks;
          exam["noquestions"] = noquestions;
          exam.save((er, ex) => {
            if (er) console.log(er);
            else {
              //console.log(q);
              //  console.log("sdamdklsa");
              res.redirect("/te/exam/staged");
            }
          })
        }
      })
    }

  })
});

//date-time local doesn't work in mozilla


//posting from the staged area setting the studentid's
app.post("/te/exam/:id/staged", authenticatedTeacher, upload.single("excel"), (req, res) => {
  id = req.params.id;
  if (req.file) {
    file = req.file;
    excel(file.destination + "/" + file.filename).then(async (rows) => {

      var students = await new Promise((resolve, reject) => {
        var s = [];
        var i = 0;
        //console.log(rows);
        //condition for checking roll number
        i = rows[0].indexOf("rollno");
        //console.log(i);
        for (var i; i <= rows.length - 2; i++) {
          s[i] = rows[i + 1][0];
        }
        console.log(file.destination + "/" + file.filename);
        fs.unlink(req.file.destination + "/" + req.file.filename, (e) => {
          if (e) console.log(e);
          else console.log("deleted");
        })
        resolve(s);

      });
      //  console.log(students);
      students.forEach((s) => {
        User.findOne({
          username: s
        }, (e, st) => {
          if (e) console.log(e);
          else if (st) {
            st.examid.push(id);
            st.save((e, stu) => {
              console.log(e);
            });
          }
        })
      })

      Exam.findById(id, (error, exam) => {
        if (error) console.log(error);
        else {
          var array = req.body.scheduled.date.split("-");
          var time = req.body.scheduled.time.split(":");
          //console.log("/////////////////////************",req.body.scheduled.date,req.body.scheduled.time);
          var date = new Date(Number(array[0]), Number(array[1]) - 1, Number(array[2]), Number(time[0]), Number(time[1]));
          //console.log(date);
          var array2 = req.body.scheduled.date2.split("-");
          var time2 = req.body.scheduled.time2.split(":");
          var date2 = new Date(Number(array2[0]), Number(array2[1]) - 1, Number(array2[2]), Number(time2[0]), Number(time2[1]));
          exam.closedate = date2;
          exam.date = date;
          exam.status = "ready";
          exam.duration = req.body.scheduled.duration;
          exam.students = students;
          //console.log("came");
          exam.save((e, s) => {
            if (e) console.log(e);
            else {
              addExam(s);
              res.redirect("/te/exam/ready")
            }
          })
        }
      })
    }).catch((error) => {
      console.log(error);
    });
  } else {
    Exam.findById(id, (error, exam) => {
      if (error) console.log(error);
      else {
        var array = req.body.scheduled.date.split("-");
        var time = req.body.scheduled.time.split(":");
        var date = new Date(Number(array[0]), Number(array[1]) - 1, Number(array[2]), Number(time[0]), Number(time[1]));
        //console.log(date);
        var array2 = req.body.scheduled.date2.split("-");
        var time2 = req.body.scheduled.time2.split(":");
        var date2 = new Date(Number(array2[0]), Number(array2[1]) - 1, Number(array2[2]), Number(time2[0]), Number(time2[1]));
        exam.closedate = date2;
        exam.date = date;
        exam.status = "ready";
        exam.duration = req.body.scheduled.duration;
        exam.save((e, s) => {
          if (e) console.log(e);
          else {
            //console.log(s);
            addExam(s);
            res.redirect("/te/exam/ready")
          }
        })
      }
    })
  }
});


app.post("/te/exam/:id/students", authenticatedTeacher, (req, res) => {
  Exam.findById(req.params.id, (error, exam) => {
    if (error) console.log(error);
    else {
      if (exam.students.indexOf(req.body.student)) {
        exam.students.push(req.body.student);
        exam.save((e, s) => {
          if (e) console.log(e);
          else {
            //console.log(s);
            User.findOne({
              username: req.body.student
            }, (e, st) => {
              if (e) console.log(e);
              else {
                if (st) {
                  st.examid.push(exam._id);
                  st.save((e, stu) => {});
                  ////////////////////////////////////////////////////////////////////////////////send a toast saying added successfully!!///////////////////////////////////
                  res.redirect("/te/exam/" + req.params.id + "/students");
                } else {
                  res.redirect("/te/exam/" + req.params.id + "/students"); ////////////////////////////send a toast saying can't be found!!!!!///////////////////////////////////
                }
              }
            })

          }
        })
      } else {
        //send a flash message saying it is already present!
        res.redirect("/te/exam/" + req.params.id + "/students");
      }

    }
  })
});





/////////////////////////////////////////////////////delete routes


//////////////////////////////$pull used for pulling out a specific element from an array when used in find by id and update or others where update is used!!!!
app.delete("/te/exam/:id/students", (req, res) => {
  Exam.findByIdAndUpdate(req.params.id, {
    $pull: {
      students: req.body.student
    }
  }, (err) => {
    if (err) {
      console.log(err);
    } else {
      User.findOneAndUpdate({
        username: req.body.student
      }, {
        $pull: {
          examid: req.params.id
        }
      }, (error) => {
        if (error) console.log(error);
        else {
          res.redirect("/te/exam/" + req.params.id + "/students");
        }
      })

    }
  });
});



/////////////////////////////////////////////patch routes
app.patch("/te/exam/:id/start", (req, res) => {
  Exam.findById(req.params.id, (e, exam) => {
    if (e) console.log(e);
    else {
      start(exam._id);
      examStarted(exams.pop(exam));
      res.redirect("/te/exam/ready");
    }
  })
})


app.patch("/te/exam/:id/edit", (req, res) => {
  Question.deleteMany({
    examid: req.params.id
  }, (e) => {
    if (e) console.log(e);
    else {
      var questions = req.body.questions;
      var options = req.body.options;
      var marks = 0;
      questions.forEach((q, i) => {
        q["options"] = options[i];
        //console.log(options[i],options[i].length);
        let array = [];
        for (var x = 0; x <= options[i].length - 1; x++) {
          array[x] = 0;
        };
        q["optioncount"] = array;
        q["examid"] = req.params.id;
        q["unattempted"] = q["wrongans"] = q["rightans"] = 0;
        marks += Number(q["marks"]);
      });
      //TRY TO REFACTOR THIS CODE LATER TO MAKE IT MORE DRY AND FAST!!
      var noquestions = questions.length;
      Question.insertMany(questions, (e, q) => {
        if (e) console.log(e);
        else {
          Exam.findById(req.params.id, (error, exam) => {
            if (error) console.log(error);
            else {
              exam["marks"] = marks;
              exam["noquestions"] = noquestions;
              exam.save((er, ex) => {
                if (er) console.log(er);
                else {
                  res.redirect("/te/exam/staged");
                }
              })
            }

          })
        }
      })

    }
  });
});
///////////////////////////////student routes//////////////

app.post("/st/register", (req, res) => {
  var user = {
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
    role: 0
  }
  User.register(user, req.body.password, (error, sol) => {
    if (error) console.log(error);
    else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/st/index");
      });
    }
  });
});

// function attach(req,res,next){
//   var fields = [];
//   Question.find({examid:req.params.id,type:1},(err,questions)=>{
//     if(err) console.log(err);
//     else{
//      questions.forEach((q,i)=>{
//        fields[i]={
//          name:"q["+q._id+"]",
//          maxCount: 10
//        }
//
//      });
//      cpupload = fields;
//      next();
//     }
//   })
// }
// var cpupload

app.post("/st/submit/:id",authenticatedStudent,examNotAttempted, (req, res) => {
  const form = formidable({ multiples: true, uploadDir:"./examuploads" });
  var file;
  var field;
  form.parse(req, (err, fields, files) => {
  //console.log('fields:', fields);
//  console.log('files:', files);
//  console.log(req);
  var arr1 = Object.keys(fields);
  var arr2 = Object.values(fields);
  var arr3 = [];
  Question.find({
    examid: req.params.id
  }, (err, questions) => {
    if (err) {
      console.log(err);
    } else {
      var marks = 0;
      var obj = [];
      questions.forEach(async(q, i) => {

        if(q.qtype==0){

          q.optioncount[Number(arr2[i]) - 1] = q.optioncount[Number(arr2[i]) - 1] + 1;
          if (Number(arr2[i]) != -1) {
            if (q.ans == Number(arr2[i])) {
              marks += q.marks;
              q.rightans += 1;
            } else {
              q.wrongans += 1;
            }
          } else {
            q.unattempted += 1;
          }
          Question.findByIdAndUpdate(q._id, {
            optioncount: q.optioncount,
            rightans: q.rightans,
            wrongans: q.wrongans,
            unattempted: q.unattempted
          }, (e, s) => {
            if (e) console.log(e);
            else {
              //console.log(s);
            }
          });
          obj[i] = {
            qtype:0,
            id: q._id,
            marked: Number(arr2[i]),
            link:null,
            marksAlloted:null
          }
        }else if(q.qtype==1){
          console.log("arrayy"+i);
           let pdfdoc = await PDFDocument.create();
           let array = files["q["+q._id+"]"];
           //console.log("////////////////////////////////////",array,files["q["+q._id+"]"]);
           var data;
           let imgbytes;
           //console.log(array);
           array.forEach(async (a,i)=>{
             console.log("***********************************arrayy",a,i);
              path=a.path.substring(12);
              data = fs.readFileSync("./examuploads/"+path,(err)=>{
                if(err) console.log(err);
                console.log("fileread");
              });
              imgbytes=data;
              console.log("data:",data);
              if(a.type=='image/jpeg'){
                let jpgImage = await pdfdoc.embedJpg(imgbytes);
                let scaledjpgImage = jpgImage.scale(1.0);
                let page = pdfdoc.addPage();
                page.drawImage(jpgImage, {
                 x: 5,
                 y: page.getHeight() / 2 - scaledjpgImage.height / 2,
                width: scaledjpgImage.width,
                height: scaledjpgImage.height,
              });

            }else{
            //  console.log("EEEEEEEEEEEEEEEEEE/////////////////////////////////");
              let pngImage = await pdfdoc.embedPng(imgbytes);
              let scaledpngImage = pngImage.scale(1.0);
              let page = pdfdoc.addPage();
              page.drawImage(pngImage, {
               x: 5,
               y: page.getHeight() / 2 - scaledpngImage.height / 2,
              width: scaledpngImage.width,
              height: scaledpngImage.height,
            });
            }

           });
           const pdfbytes = await pdfdoc.save();

           fs.writeFileSync("./pdfs/"+q._id+"-"+Date.now()+".pdf",pdfbytes,(err)=>{
             if(err) console.log(err);
             else{
               console.log("filesaved");
             }
           })
      //   console.log("EEEEEEEEEEEEEEEEEE/////////////////////////////////");
           obj[i]={
             qtype:1,
             id:q._id,
             marked: null,
             link:null,
             marksAlloted:null

           }

        }
      });

      const p = new Promise((resolve,reject)=>{
          // console.log("sadddddddddddddd",obj);
        setTimeout(()=>{
          resolve(1);

        },100);
      })
      p.then((a)=>{
        Response.create({
          answers: obj,
          marks: marks,
          userid: req.user.username,
          examid: req.params.id
        }, (err, s) => {
          if (err) console.log(err);
          else {
            //res.redirect("/st/completed");
          //console.log("NO ERROR");
          Exam.updateOne({
              _id: req.params.id
            }, {
              $push: {
                attempted: req.user.username
              }
            }, (err) => {
              if (err) {
                console.log(err);
              } else {
              //  console.log("noERROR2");
                Exam.findOneAndUpdate({
                  _id: req.params.id
                }, {
                  $pull: {
                    students: req.user.username
                  }
                }, (err) => {
                  if (err) {
                    console.log(err);
                  } else {
                  //  console.log("noERROR3");
                    res.redirect("/st/completed");
                  }
                });
              }
            });
          }
        });
      })

    }
  });
});

});



//   for(var i=0;i<keys.length;i++){
//     var response = {
//       id:keys[i],
//       marked:values[i]
//     }
//     answers.push(response);
//   }
//
//   const responses = new Response({
//     answers:answers,
//     examid:req.params.id,
//     userid:req.user.username
//   });
//   responses.save();
//   console.log(responses);
//   Exam.findOneAndUpdate({_id:req.params.id},{$pull:{students:req.user.username}},(err) => {
//     if(err){console.log(err);}
//     else{
//       Question.find({examid:req.params.id},(err,questions) => {
//         if(err){console.log(err);}
//         else{
//           console.log(questions);

//           });
//         }
//       })
//
// }});




///////////////////automated routes////////////////////////////////////


Exam.find({
  status: "ready"
}, (error, exam) => {
  if (error) console.log(error);
  else {
    exam.forEach((e) => {
      addExam(e);
    })
  }
});
Exam.find({
  status: "started"
}, (error, exam) => {
  if (error) console.log(error);
  else {
    //console.log("dasdsa",exam);
    exam.forEach((e) => {
      examStarted(e);
    })
  }
});


//////////////arrays for holding all the exams which either started or ready!/////////////////////////////////////
examsrunning = [];
exams = [];


var stop, stop2;

////////////////////////////////////////////////////////////////////run() => checks for exams which needs to be started! once started moves that exam to examsrunning and calls checkduration
//////////////////////////////////////////////////////////////////// checkDuration() => checks whether the exams time is up or not!!!!
function run() {
  stop = setInterval(() => {
    for (var i = 0; i <= exams.length - 1; i++) {
      obj = new Date();
      //console.log("/////////",exams[i].date.getTime(),obj.getTime(),exams[i].date,obj,"///////////");
      //console.log(exams[i].date.getTime()<=obj.getTime() && (exams[i].date.getDate()<=obj.getDate() && exams[i].date.getMonth()<=obj.getMonth() && exams[i].date.getYear()<=obj.getYear()));
      if (exams[i].date.getTime() <= obj.getTime() && (exams[i].date.getDate() <= obj.getDate() && exams[i].date.getMonth() <= obj.getMonth() && exams[i].date.getYear() <= obj.getYear())) {
        start(exams[i]._id);
        console.log("exam of id : " + exams[i]._id + " has started");
        examStarted(exams.splice(i, 1)[0]);

      }
    }
    //  console.log(exams.length);
    if (exams.length == 0) clearInterval(stop);
  }, 1000);
}

//console.log(exams);
//console.log(examsrunning);
//console.log(examsrunning);
//add a functionality such that when the duration of the test stops
function checkDuration() {
  //console.log(examsrunning[0].date.getTime());
  stop2 = setInterval(() => {
    for (var i = 0; i <= examsrunning.length - 1; i++) {
      obj = new Date();
      //    var mins = Number(examsrunning[i].duration)*60*1000;
      // console.log(examsrunning[i],examsrunning[i].date.getTime()+"//////");
      //    console.log("*********",examsrunning[i].date.getTime()+mins,obj.getTime(),examsrunning[i].date,obj,"*********");
      //    console.log((examsrunning[i].date.getTime()+mins)<=obj.getTime() && (examsrunning[i].date.getDate()<=obj.getDate() && examsrunning[i].date.getMonth()<=obj.getMonth() && examsrunning[i].date.getYear()<=obj.getYear()));
      if (examsrunning[i].closedate.getTime() <= obj.getTime() && examsrunning[i].closedate.getDate() <= obj.getDate() && examsrunning[i].closedate.getMonth() <= obj.getMonth() && examsrunning[i].closedate.getYear() <= obj.getYear()) {
        completed(examsrunning[i]._id);
        console.log("exam of exam id: " + examsrunning[i]._id + " has completed!!");
        examsrunning.splice(i, 1);
      }
    }
  }, 1000);
};

////////////////////////////functions for handling the event: Exams started and for

function examStarted(exam) {
  clearInterval(stop2);
  //console.log("dsdfd",exam);
  if (exam) {
    examsrunning.push(exam);
    checkDuration();
  }
}

function addExam(exam) {
  clearInterval(stop);
  if (exam.date) exams.push(exam);
  //  console.log(exams);
  run();

}
//////////////////////////////////////////functions for findind the exams ofstatus== started || completed ///////////used for adding the exams directly to the arrray whenever server reloads
function start(id) {
  Exam.findById(id, (error, exam) => {
    exam.status = "started";
    //code left
    exam.save((e, exa) => {
      if (e) console.log(e);
      else {
        console.log("success");
      }
    });
  });
}

function completed(id) {
  Exam.findById(id, (error, exam) => {
    exam.status = "completed";
    //code left
    exam.save((e, exa) => {
      if (e) console.log(e);
      else {
        console.log("success");
      }
    });
  });
}



////////////////////////////////////////////////////////////////////   Middle Ware    //////////////////////////////////////////////////////////


function authenticatedTeacher(req, res, next) {
  if (req.isAuthenticated() && req.user.role == 1) {
    next();
  } else {
    res.redirect('/');
  }
}

function authenticatedStudent(req, res, next) {
  if (req.isAuthenticated() && req.user.role == 0) {
    next();
  } else {
    res.redirect('/');
  }
}

function examNotAttempted(req, res, next) {
  Exam.findById(req.params.id, (e, exam) => {
    if (e) console.log(e);
    else {
      if (exam.students.indexOf(req.user.username) != -1) {
        next();
      } else {
        res.redirect("/st/completed");
      }
    }
  })
}
/////////////////////////////////////////////////////////////server/////////////////////////////////////////////
server = app.listen(3000, () => {
  console.log("Server is up on port 3000");
});

////////////////////////////////////////////////////socket programming//////////////////////////////
const io = socket(server);

io.on("connection", (socket) => {
  //  console.log("connected");
  socket.on("sendResponses", (id) => {
       console.log("sendresponses");
       console.log(id);
    Exam.findById(id.examid, (err, exam) => {
      if (err) console.log(err);
      else {
        if (exam) {
          if (exam.status == "started") {
            setTimeout(() => {
              Response.find({
                examid: id.examid
              }, (e, s) => {
                if (e) console.log(e);
                else {
                  //console.log(s);
                  Question.find({
                    examid: id.examid,
                    qtype: 0
                  }, (er, so) => {
                    if (er) console.log(er);
                    else {
                      io.emit("responses", {
                        responses: s,
                        questions: so
                      });
                    }
                  })
                }
              })
            }, 200);
          } else {
            socket.emit("final", "examclosed");
          }
        }
      }
    })
  });

  socket.on("viewed",(info) => {
    io.emit("view",{student:info.userid,status:"Viewed"});
  });

})

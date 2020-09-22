var multer = require("multer");


var upload = multer(
  {
    storage:multer.diskStorage({
      destination: (req, file,cb)=>{
          cb(null, "./uploads");
      },
      filename: (req,file, cb)=>{
        cb(null, file.fieldname+Date.now());
      }
    }),
  //   fileFilter:(req,file,cb)=>{
  //     if(file.mimetype=="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") cb(null,true);
  //     else{
  //     cb(new Error("File format is not supported"));
  //     }
  //   }
  }
);

module.exports = upload;

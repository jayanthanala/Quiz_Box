const multer = require("multer");

var storage = multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,"./examuploads");
  },
  filename: (req,file,cb)=>{
    cb(null,file.fieldname + '-' + Date.now());
  }
});

fileFilter = (req, file, cb) => {
  if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
    cb(null, true);
  } else {
    cb(new Error("Image of JPEG and PNG formats are only accepted"), false);
  }
}


var examUpload = multer({
  storage:storage,
  fileFilter:fileFilter
});

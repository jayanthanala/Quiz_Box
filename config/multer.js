var multer = require("multer");
var multerS3 = require("multer-s3");
var s3 = require("./aws.js");


fileFilter = (req, file, cb) => {
  if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
    cb(null, true);
  } else {
    cb(new Error("Image of JPEG and PNG formats are only accepted"), false);
  }
}



var upload = multer({
  fileFilter: fileFilter,
  storage: multerS3({
    s3: s3,
    acl: 'public-read',
    bucket: 'test-bucket-j',
    metadata: (req, file, cb) => {
      cb(null, {
        fieldname: file.fieldname
      }) //sets the fieldname present in the meta data section of the bucket properties to fiel.fieldname
    },
    key: (req, file, cb) => {
      cb(null, Date.now().toString()+".jpg"); //this will make the image name on the bucket as the date created.
    }
  })

});

module.exports = upload;
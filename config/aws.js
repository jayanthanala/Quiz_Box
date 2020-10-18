var aws = require("aws-sdk");
var dotenv = require("dotenv");

dotenv.config();

const s3 = new aws.S3({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  Bucket: "test-bucket-j"
});


module.exports = s3;
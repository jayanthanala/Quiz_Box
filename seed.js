const Response = require("./models/response.js");

module.exports = ()=>{
  Response.deleteMany({},(e)=>{
  setInterval(()=>{
    Response.create({
      marks:10,
      examid:"5f3bfe16a05e9281e08e9e8b",
      userid:"19BCE2012"

    },(e,s)=>{
      if(e) console.log(e);
      console.log("created!!!");
    });
  },6000);
  })
}

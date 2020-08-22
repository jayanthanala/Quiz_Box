const socket = io();
console.log(socket);

var a = document.querySelector("h1");
var id = a.textContent;
console.log(id);

var responses = [];

/////////////socket emit

setInterval(()=>{
  socket.emit("sendResponses",id);
  console.log("hello");
},7000);


socket.on("responses",(data)=>{
  addData(data);
});




function addData(data){
  if(responses.length==0){
    data.responses.forEach((d)=>{
      responses.push(d);
      console.log("pushed");
    });
    // console.log(data);
    // console.log(data.responses);
      addStudents(data.responses);

  }else{
    if(responses.length<data.responses.length){
      var newResponses = data.responses.slice(responses.length)
      addStudents(newResponses);
      console.log("added new");
    }

  }
}


var container = document.getElementsByClassName("students")[0];

function addStudents(data){
  console.log(data.length);
  data.forEach((x)=>{
    let row = document.createElement("div");
    row.classList.add("row");
    let first = document.createElement("div");
    first.classList.add("col-md-6");
    let second = document.createElement("div");
    second.classList.add("col-md-6");
    first.innerHTML=x.userid;
    second.innerHTML=x.marks;
    let hr = document.createElement("hr");
    row.appendChild(first);
    row.appendChild(second);
    row.appendChild(hr);
    container.appendChild(row);
  })
}


///////////////////////////////////////////////////////////////charts.js

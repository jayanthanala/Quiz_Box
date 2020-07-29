function createQuestion(n){
   var container = document.createElement("div");
   container.classList.add("container");

   var row = document.createElement("div");
   row.classList.add("row");

   var column1 = document.createElement("div");
   column1.classList.add("col","m10");

   var questiondiv = document.createElement("div");
   questiondiv.classList.add("input-field", "col", "s12");

   var questionInput = document.createElement("input");
   questionInput.classList.add("validate");
   questionInput.setAttribute("type","text");
   questionInput.setAttribute("name","questions["+(n-1)+"][q]");
   questionInput.id="q"+(n-1);

   var questionLabel = document.createElement("label");
   questionLabel.setAttribute("for","q"+(n-1));
   questionLabel.innerHTML = "Question";
   questiondiv.appendChild(questionInput);
   questiondiv.appendChild(questionLabel);
   var r = document.createElement("div");
   r.classList.add("row");
   r.appendChild(questiondiv);

    var row2 = document.createElement("div");
    row2.classList.add("row");

   var inputField = document.createElement("div");
   inputField.classList.add("input-field", "col", "s6");

   var inputField2 = document.createElement("div");
   inputField2.classList.add("input-field", "col", "s6");

   var optionNo = document.createElement("input");
   optionNo.setAttribute("type","number");
   optionNo.setAttribute("min","1");
   optionNo.classList.add("validate");
   optionNo.id="optionNo"+(n-1);

   var optionNoLabel = document.createElement("label");
   optionNoLabel.setAttribute("for","optionNo"+(n-1));
   optionNoLabel.innerHTML="Number Of Options";

   inputField.appendChild(optionNo);
   inputField.appendChild(optionNoLabel);

   //adding marks input to input field;

   var marks = document.createElement("input");
   marks.setAttribute("type","number");
   marks.setAttribute("min","1");
   marks.classList.add("validate");
   marks.setAttribute("name","questions["+(n-1)+"][marks]");
   marks.id="marks"+(n-1);

   var marksLabel = document.createElement("label");
   marksLabel.setAttribute("for","marks"+(n-1));
   marksLabel.innerHTML="Marks for this question";

   inputField2.appendChild(marks);
   inputField2.appendChild(marksLabel);

   row2.appendChild(inputField);
   row2.appendChild(inputField2);

   var label = document.createElement("label");
   label.innerHTML="Options:"

//creating options and nesting them inside rowOptions
   var rowOptions = document.createElement("div");
   rowOptions.classList.add("row","options");
  for(var i=1;i<=4;i++){
    let inputF = document.createElement("div");
    inputF.classList.add("input-field", "col", "s6");

    let input = document.createElement("input");
    input.classList.add("validate");
    input.setAttribute("type","text");
    input.setAttribute("name","questions["+(n-1)+"][option["+i+"]]");
    input.id=""+i+(4*(n-1));

    let label = document.createElement("label");
    label.setAttribute("for",""+i+(4*(n-1)));
    label.innerHTML=""+i;

    inputF.appendChild(input);
    inputF.appendChild(label);

    rowOptions.appendChild(inputF);
  }
  column1.appendChild(r);
  column1.appendChild(row2);
  column1.appendChild(label);
  column1.appendChild(rowOptions);
  //creating and nesting buttons claass div
  var btnDiv = document.createElement("div");
  btnDiv.classList.add("col-md-2", "d-flex", "justify-content-around", "align-items-center");

  var button1 = document.createElement("button");
  button1.classList.add("plus");
  button1.innerHTML = "+";
  button1.id="plus"+(n-1);

  var button2 = document.createElement("button");
  button2.classList.add("minus");
  button2.innerHTML = "-";
  button2.id="minus"+(n-1);

  btnDiv.appendChild(button1);
  btnDiv.appendChild(button2);

 //nesting the div's
 row.appendChild(column1);
 row.appendChild(btnDiv);

 container.appendChild(row);

 return container;
}
$("#qno").html($("#cf").children().length);

$("#cf").on("click",".plus",(e)=>{
  e.preventDefault();
  var containers = $("#cf").children();
 var length = containers.length;
  console.log(length);
  var container = createQuestion(length+1);
  $("#plus"+(length-1)).hide();
 $("#minus"+(length-1)).hide();
  $("#cf").append(container);
  $("#qno").html(length+1);
  var marks= Number($("#marks"+(length-1)).val());
  $("#marks").html(Number($("#marks").html())+marks);
});

$("#cf").on("click",".minus",(e)=>{
  e.preventDefault();
  var containers = $("#cf").children();
  if(containers.length!=1){
    var marks= Number($("#marks"+(containers.length-1)).val());
    containers.last().remove();
    length=$("#cf").children().length;
    $("#plus"+(length-1)).show();
   $("#minus"+(length-1)).show();
   $("#qno").html(length);
   if(length!=1)$("#marks").html(Number($("#marks").html())-marks);
   else{
     $("#marks").html(0);
   }

  }

})

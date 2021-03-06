function createQuestion(n){
   var container = document.createElement("div");
   container.classList.add("container");

   var row = document.createElement("div");
   row.classList.add("row");

   var column1 = document.createElement("div");
   column1.classList.add("col","m10");

   var switchdiv = document.createElement("div");
   var switchlabel1 = document.createElement("label");
   var switchdiv2 = document.createElement("div");
   var switchinput = document.createElement("input");
   var switchlabel2 = document.createElement("label");


   switchdiv.classList.add("row","d-flex","justify-content-end");
   switchlabel1.classList.add("mr-2");
   switchlabel1.innerHTML="MCQ";
   switchdiv2.classList.add("custom-control","custom-switch");
   switchinput.setAttribute("type","checkbox");
   switchinput.classList.add("custom-control-input","mr-3","cs");
   switchinput.id="cs"+(n-1);
   switchlabel2.classList.add("custom-control-label");
   switchlabel2.setAttribute("for","cs"+(n-1));
   switchlabel2.innerHTML="FILE UPLOAD";

   switchdiv2.appendChild(switchinput);
   switchdiv2.appendChild(switchlabel2);
   switchdiv.appendChild(switchlabel1);
   switchdiv.appendChild(switchdiv2);


   var questiondiv = document.createElement("div");
   questiondiv.classList.add("input-field", "col", "s10");

   var questionInput = document.createElement("input");
   questionInput.classList.add("validate");
   questionInput.setAttribute("type","text");
   questionInput.setAttribute("name","questions["+(n-1)+"][q]");
   questionInput.id="q"+(n-1);
   questionInput.required=true;

   var questionLabel = document.createElement("label");
   questionLabel.setAttribute("for","q"+(n-1));
   questionLabel.innerHTML = "Question";
   questiondiv.appendChild(questionInput);
   questiondiv.appendChild(questionLabel);
   var r = document.createElement("div");

   var sdiv = document.createElement("div");
   var slabel1 = document.createElement("label");
   var sdiv2 = document.createElement("div");
   var sinput = document.createElement("input");
   var slabel2 = document.createElement("label");


   sdiv.classList.add("col","s1");
   slabel1.innerHTML="Text";
   sdiv2.classList.add("custom-control","custom-switch");
   sinput.setAttribute("type","checkbox");
   sinput.classList.add("custom-control-input","qs");
   sinput.id="qs"+(n-1);
   slabel2.classList.add("custom-control-label");
   slabel2.setAttribute("for","qs"+(n-1));
   slabel2.innerHTML="UPLOAD";

   sdiv2.appendChild(sinput);
   sdiv2.appendChild(slabel2);
   sdiv.appendChild(slabel1);
   sdiv.appendChild(sdiv2);
   //////
   r.classList.add("row");


   r.appendChild(questiondiv);
   r.appendChild(sdiv);


    var row2 = document.createElement("div");
    row2.classList.add("row");

   var inputField = document.createElement("div");
   inputField.classList.add("input-field", "col", "s6");

   var inputField2 = document.createElement("div");
   inputField2.classList.add("input-field", "col", "s6");

   var optionNo = document.createElement("input");
   optionNo.setAttribute("type","number");
   optionNo.setAttribute("min","2");
   optionNo.classList.add("optionno","validate");
   optionNo.id="optionNo"+(n-1);
   optionNo.required=true;

   var optionNoLabel = document.createElement("label");
   optionNoLabel.setAttribute("for","optionNo"+(n-1));
   optionNoLabel.innerHTML="Number Of Options";

   inputField.appendChild(optionNo);
   inputField.appendChild(optionNoLabel);

   //adding marks input to input field;

   var marks = document.createElement("input");
   marks.setAttribute("type","number");
   marks.setAttribute("min","1");
   marks.classList.add("validate","marks");
   marks.setAttribute("name","questions["+(n-1)+"][marks]");
   marks.id="marks"+(n-1);
   marks.required=true;

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
   rowOptions.classList.add("options","col","s12");
  for(var i=0;i<=3;i++){
    let inputF = document.createElement("div");
    inputF.classList.add("input-field", "col", "s6");

    let input = document.createElement("input");
    input.classList.add("validate");
    input.setAttribute("type","text");
    input.setAttribute("name","options["+(n-1)+"]["+i+"]");
    input.id=""+i+(4*(n-1));
    input.required=true;

    let label = document.createElement("label");
    label.setAttribute("for",""+i+(4*(n-1)));
    label.innerHTML=""+i;

    inputF.appendChild(input);
    inputF.appendChild(label);

    rowOptions.appendChild(inputF);
  }

  var row3 = document.createElement("div");
  row3.classList.add("row");
  var inputdiv = document.createElement("div");
  inputdiv.classList.add("input-field", "col", "s12");
  var inp = document.createElement("input");
  inp.required=true;
  inp.classList.add("validate");
  inp.setAttribute("type","number");
  inp.setAttribute("name","questions["+(n-1)+"][ans]");
  inp.id="c"+(n-1);
  var lab = document.createElement("label");
  lab.setAttribute("for","c"+(n-1));
  lab.innerHTML="Correct option Number";
  inputdiv.appendChild(inp);
  inputdiv.appendChild(lab);
  row3.appendChild(inputdiv);

  column1.appendChild(switchdiv);
  column1.appendChild(r);
  column1.appendChild(row2);
  column1.appendChild(label);
  column1.appendChild(rowOptions);
  column1.appendChild(row3);
  //creating and nesting buttons claass div
  var btnDiv = document.createElement("div");
  btnDiv.classList.add("col-md-2", "d-flex", "justify-content-around", "align-items-center");

  var button1 = document.createElement("button");
  button1.classList.add("plus");
  button1.classList.add("btn");
  button1.innerHTML = "+";
  button1.id="plus"+(n-1);

  var button2 = document.createElement("button");
  button2.classList.add("minus");
  button2.classList.add("btn");
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
   console.log(length);
   $("#marks").html(Number($("#marks").html())-marks);


  }

});


function createOption(n,n2){
  var div = document.createElement("div");
  div.classList.add("input-field","col","s6");
  input=document.createElement("input");
  input.setAttribute("type","text");
  input.setAttribute("name","options["+n2+"]["+n+"]");
  input.id="o"+(n+1);
  var label = document.createElement("label");
  label.setAttribute("for","o"+(n+1));
  label.textContent=(n+1);
  div.appendChild(input);
  div.appendChild(label);
  return div;
}

function appendOptions(n,n2,options){
    options.empty();
    console.log(options);
    for(var i=0;i<=n-1;i++){
      options.append(createOption(i,n2));
    }

}


$("#cf").on("change",".optionno",(e)=>{
 var o=$(e.target);
 var number = o.val();
 var string= o.attr("id");
 console.log(o);
 console.log(number,string);
 var number2=Number(string.substr(8));
 var object=o.parent().parent().next().next();

 appendOptions(number,number2,object);
});

var marks = $("#marks");

var mark=0;
$("#cf").on("focus",".marks",(e)=>{
  let element=e.target;
  mark = element.value;
})
$("#cf").on("change",".marks",(e)=>{
    let element = e.target;
    marks.html((Number(marks.html())-mark)+Number(element.value));
  });

$("#cf").on("click",".cs",(e)=>{
  console.log("clicked");
  let element = e.target;
  if(element.checked==true){
    // let children = $("#cf")[0].childNodes;
    let index = Number(element.id.substring(2));

    var optionNo = $("#optionNo"+index)[0];
    optionNo.required=false;
    var div = $("#optionNo"+index);
    div.parent().css("display","none");

    var n = div.parent().parent().next().next().children().length;

    for(var i=0;i<=n-1;i++){
      $("input[name=\'options["+index+"]["+i+"]\']")[0].required=false;
    }

    div.parent().parent().next().css("display","none")
    div.parent().parent().next().next().css("display","none");


    $("#c"+index)[0].required=false;
        div.parent().parent().next().next().next().css("display","none");
    // console.log(container);
    // container.childNodes.forEach((x,i)=>{
    //   console.log(x,i);
    //   if(i==5){
    //     console.log(x.childNodes);
    //     console.log(x.childNodes[0],x.childNodes[1]);
    //   //  x.childNodes[0].css("display","none");
    //     let y= x.childNodes[1]
    //     y.style.display="none";
    //     y.required=false;
    //   }
    //   if(i>6 && i%2!=0){
    //     x.style.display="none";
    //     x.required=false;
    //   }


  }else{
    let index = Number(element.id.substring(2));

    var optionNo = $("#optionNo"+index)[0];
    optionNo.required=true;
    var div = $("#optionNo"+index);
    div.parent().css("display","block");

    var n = div.parent().parent().next().next().children().length;


    for(var i=0;i<=n-1;i++){
      $("input[name=\'options["+index+"]["+i+"]\']")[0].required=true;
    }

    div.parent().parent().next().css("display","block")
   div.parent().parent().next().next().css("display","block");


    $("#c"+index)[0].required=true;
        div.parent().parent().next().next().next().css("display","block");
  }
})


$("#cf").on("click",".qs",(e=>{
  console.log("clicked")
  let element = e.target;
  let index = Number(element.id.substring(2));
  let question = $("#q"+index);
  let questionLabel = question.next();

  if(question.attr("type")=="text"){
    question.attr("type","file");
    question.attr("name","qupload")
    questionLabel.css("display","none");
   // question.prop('multiple',true);
  }else{
    question.attr("type","text");
    questionLabel.css("display","block");
    question.attr("name","questions["+index+"][q]");
  }

}))
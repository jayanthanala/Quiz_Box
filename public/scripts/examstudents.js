const icon = document.querySelector("#share");
const value = document.querySelector("#copy");

icon.addEventListener("click",()=>{
  value.select();
  value.setSelectionRange(0, 99999);
    document.execCommand("copy");
})

const PASSWORDS={
sales:"1111",
pack:"2222",
qc:"3333",
ship:"4444",
account:"5555"
};

// ===== LOGIN =====
function login(){
let user=document.getElementById("username").value;
let role=document.getElementById("role").value;
let pass=document.getElementById("password").value;

if(pass===PASSWORDS[role]){
localStorage.setItem("user",user);
localStorage.setItem("role",role);
window.location="home.html";
}else{
alert("Wrong password");
}
}

function logout(){
localStorage.clear();
window.location="index.html";
}

// ===== DATA =====
function getBills(){
return JSON.parse(localStorage.getItem("bills")||"{}");
}

function saveBills(data){
localStorage.setItem("bills",JSON.stringify(data));
}

// ===== CORE FLOW ใหม่ =====
function updateBill(code, action){

let role=localStorage.getItem("role");
let user=localStorage.getItem("user");
let bills=getBills();

if(!bills[code]) bills[code]=[];

let last=bills[code][bills[code].length-1];

// SALES
if(role==="sales"){
if(bills[code].length>0){
alert("มีบิลแล้ว");
return;
}
bills[code].push({stage:"sales",user,time:new Date().toLocaleString()});
}

// PACK
if(role==="pack"){
if(!last || (last.stage!=="sales" && last.result!=="reject")){
alert("ต้องมาจาก Sales หรือ QC Reject");
return;
}
bills[code].push({stage:"pack",user,time:new Date().toLocaleString()});
}

// QC
if(role==="qc"){
if(!last || last.stage!=="pack"){
alert("ต้องมาจาก Pack");
return;
}

if(action==="reject"){
bills[code].push({stage:"qc",result:"reject",user,time:new Date().toLocaleString()});
bills[code].push({stage:"pack",user:"REWORK",time:new Date().toLocaleString()});
}

if(action==="pass"){
bills[code].push({stage:"qc",result:"pass",user,time:new Date().toLocaleString()});
}
}

// SHIP
if(role==="ship"){
if(!last || last.stage!=="qc" || last.result!=="pass"){
alert("ต้องผ่าน QC ก่อน");
return;
}
bills[code].push({stage:"ship",status:action,user,time:new Date().toLocaleString()});
}

// ACCOUNT
if(role==="account"){
if(!last || last.stage!=="ship" || last.status!=="received"){
alert("ต้องส่งของก่อน");
return;
}
bills[code].push({stage:"account",status:"done",user,time:new Date().toLocaleString()});
}

saveBills(bills);
}

// ===== SCAN =====
function startScan(action){
let scanned=false;

function onScanSuccess(decodedText){
if(scanned) return;
scanned=true;

updateBill(decodedText, action);
window.location="timeline.html?bill="+decodedText;
}

let scanner=new Html5QrcodeScanner("reader",{fps:10,qrbox:250});
scanner.render(onScanSuccess);
}

// ===== TIMELINE =====
if(document.getElementById("timeline")){
let url=new URLSearchParams(window.location.search);
let bill=url.get("bill");

let bills=getBills();
let html="";

if(bills[bill]){
bills[bill].forEach(e=>{
html+=`<div class="timeline-item">
<b>${e.stage}</b> ${e.result||e.status||""}<br>
${e.user}<br>
${e.time}
</div>`;
});
}

document.getElementById("timeline").innerHTML=html;
}

// ===== LIST =====
if(document.getElementById("list")){
showList();
}

function showList(){
let bills=getBills();
let html="";

for(let b in bills){
html+=`<div class="card">
${b}<br>
<a href="timeline.html?bill=${b}">ดู</a>
</div>`;
}

document.getElementById("list").innerHTML=html;
}

// ===== PWA INSTALL =====
let deferredPrompt;

window.addEventListener('beforeinstallprompt',(e)=>{
e.preventDefault();
deferredPrompt=e;
document.getElementById("installBtn").style.display="block";
});

function installApp(){
deferredPrompt.prompt();
}
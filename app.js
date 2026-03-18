import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, onSnapshot, collection } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "ใส่ของคุณ",
  authDomain: "ใส่ของคุณ",
  projectId: "ใส่ของคุณ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// LOGIN
window.login=function(){
localStorage.setItem("user",username.value);
localStorage.setItem("role",roleSelect.value);
location="home.html";
}

window.logout=function(){
localStorage.clear();
location="index.html";
}

// FIRESTORE
async function getBill(code){
const snap = await getDoc(doc(db,"bills",code));
return snap.exists()?snap.data().data:[];
}

async function saveBill(code,data){
await setDoc(doc(db,"bills",code),{data});
}

// UPDATE
window.updateBill=async function(code,action){
let role=localStorage.getItem("role");
let user=localStorage.getItem("user");

let data=await getBill(code);
let last=data[data.length-1];

if(role==="sales"){
if(data.length>0) return alert("มีบิลแล้ว");
data.push({stage:"sales",user,time:new Date().toLocaleString()});
}

if(role==="pack"){
if(!last||(last.stage!=="sales"&&last.result!=="reject")) return alert("ผิดขั้นตอน");
data.push({stage:"pack",user,time:new Date().toLocaleString()});
}

if(role==="qc"){
if(!last||last.stage!=="pack") return alert("ต้องมาจาก pack");

if(action==="reject"){
data.push({stage:"qc",result:"reject",user,time:new Date().toLocaleString()});
data.push({stage:"pack",user:"REWORK",time:new Date().toLocaleString()});
}

if(action==="pass"){
data.push({stage:"qc",result:"pass",user,time:new Date().toLocaleString()});
}
}

if(role==="ship"){
if(!last||last.stage!=="qc"||last.result!=="pass") return alert("ต้องผ่าน QC");
data.push({stage:"ship",status:action,user,time:new Date().toLocaleString()});
}

if(role==="account"){
if(!last||last.stage!=="ship"||last.status!=="received") return alert("ต้องส่งก่อน");
data.push({stage:"account",status:"done",user,time:new Date().toLocaleString()});
}

await saveBill(code,data);
}

// TIMELINE realtime
if(document.getElementById("timeline")){
let bill=new URLSearchParams(location.search).get("bill");

onSnapshot(doc(db,"bills",bill),(snap)=>{
let data=snap.data()?.data||[];
let html=`<h3>${bill}</h3>`;
data.slice().reverse().forEach(e=>{
html+=`<div class="track">
<div class="dot"></div>
<div><b>${e.stage}</b> ${e.result||e.status||""}<br>${e.user}<br>${e.time}</div>
</div>`;
});
timeline.innerHTML=html;
});
}

// LIST realtime
if(document.getElementById("list")){
onSnapshot(collection(db,"bills"),(snap)=>{
let html="";
snap.forEach(d=>{
html+=`<div class="card">${d.id}<br>
<a href="timeline.html?bill=${d.id}">ดู</a></div>`;
});
list.innerHTML=html;
});
}

// DASHBOARD
if(document.getElementById("dash")){
onSnapshot(collection(db,"bills"),(snap)=>{
let s={sales:0,pack:0,qc_pass:0,qc_reject:0,ship:0,cancel:0,acc:0};

snap.forEach(doc=>{
(doc.data().data||[]).forEach(e=>{
if(e.stage==="sales")s.sales++;
if(e.stage==="pack")s.pack++;
if(e.stage==="qc"&&e.result==="pass")s.qc_pass++;
if(e.stage==="qc"&&e.result==="reject")s.qc_reject++;
if(e.stage==="ship"&&e.status==="received")s.ship++;
if(e.stage==="ship"&&e.status==="cancel")s.cancel++;
if(e.stage==="account")s.acc++;
});
});

dash.innerHTML=`
<div class="card">Sales ${s.sales}</div>
<div class="card">Pack ${s.pack}</div>
<div class="card">QC Pass ${s.qc_pass}</div>
<div class="card red">QC Reject ${s.qc_reject}</div>
<div class="card">Ship ${s.ship}</div>
<div class="card red">Cancel ${s.cancel}</div>
<div class="card">Account ${s.acc}</div>
`;
});
}

// INSTALL
let deferredPrompt;
window.addEventListener("beforeinstallprompt",e=>{
e.preventDefault();
deferredPrompt=e;
installBtn.style.display="block";
});
window.installApp=function(){deferredPrompt.prompt();}
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
getFirestore, doc, setDoc, getDoc,
onSnapshot, collection
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "ใส่ของคุณ",
  authDomain: "ใส่ของคุณ",
  projectId: "ใส่ของคุณ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

//////////////////////
// USER (กำหนดเอง)
//////////////////////
const USERS = {
  "admin": {password:"1234",role:"sales"},
  "pack1": {password:"1234",role:"pack"},
  "qc1": {password:"1234",role:"qc"},
  "ship1": {password:"1234",role:"ship"},
  "acc1": {password:"1234",role:"account"}
};

//////////////////////
// LOGIN
//////////////////////
window.login=function(){

let u=username.value;
let p=password.value;
let r=roleSelect.value;

if(!USERS[u]) return alert("ไม่มี user");
if(USERS[u].password!==p) return alert("รหัสผิด");
if(USERS[u].role!==r) return alert("เลือกตำแหน่งผิด");

localStorage.setItem("user",u);
localStorage.setItem("role",r);

location="home.html";
}

window.logout=function(){
localStorage.clear();
location="index.html";
}

//////////////////////
// BILL
//////////////////////
async function getBill(code){
const snap = await getDoc(doc(db,"bills",code));
return snap.exists()?snap.data().data:[];
}

async function saveBill(code,data){
await setDoc(doc(db,"bills",code),{data});
}

//////////////////////
// UPDATE FLOW
//////////////////////
window.updateBill=async function(code,action){

let role=localStorage.getItem("role");
let user=localStorage.getItem("user");

let data=await getBill(code);
let last=data[data.length-1];

let now=new Date().toLocaleString();

if(role==="sales"){
if(data.length>0) return alert("มีแล้ว");
data.push({stage:"เปิดบิล",user,time:now});
}

if(role==="pack"){
if(!last) return alert("ยังไม่เปิดบิล");
data.push({stage:"จัดของ",user,time:now});
}

if(role==="qc"){
if(action==="reject"){
data.push({stage:"QC ไม่ผ่าน",user,time:now});
data.push({stage:"กลับไปจัดของ",user:"SYSTEM",time:now});
}
if(action==="pass"){
data.push({stage:"QC ผ่าน",user,time:now});
}
}

if(role==="ship"){
data.push({
stage: action==="received"?"ส่งของสำเร็จ":"ยกเลิก",
user,time:now
});
}

if(role==="account"){
data.push({stage:"บัญชีรับบิล",user,time:now});
}

await saveBill(code,data);
}

//////////////////////
// TIMELINE REALTIME
//////////////////////
if(document.getElementById("timeline")){
let bill=new URLSearchParams(location.search).get("bill");

onSnapshot(doc(db,"bills",bill),(snap)=>{
let data=snap.data()?.data||[];

let html=`<h3 style="text-align:center">${bill}</h3>`;

data.slice().reverse().forEach(e=>{
html+=`
<div class="track">
<div class="dot"></div>
<div>
<b>${e.stage}</b><br>
👤 ${e.user}<br>
🕒 ${e.time}
</div>
</div>`;
});

timeline.innerHTML=html;
});
}

//////////////////////
// LIST + SEARCH
//////////////////////
if(document.getElementById("list")){
onSnapshot(collection(db,"bills"),(snap)=>{
let html="";
snap.forEach(d=>{
html+=`
<div class="card">
<b>${d.id}</b><br>
<a href="timeline.html?bill=${d.id}">ดูสถานะ</a>
</div>`;
});
list.innerHTML=html;
});
}

//////////////////////
// DASHBOARD
//////////////////////
if(document.getElementById("dash")){
onSnapshot(collection(db,"bills"),(snap)=>{
let total=0;

snap.forEach(()=> total++);

dash.innerHTML=`
<div class="card big">📦 ทั้งหมด ${total} บิล</div>
`;
});
}
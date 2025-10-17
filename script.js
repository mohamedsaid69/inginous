/* ---------- Storage keys ---------- */
const STORAGE_USER = 'v3_user_info';
const STORAGE_EVENTS = 'v2_events';
const STORAGE_AUTH = 'v3_auth';
const ADMIN_SHORTCUT = {alt:true,key:'z'};

/* ---------- DOM ---------- */
const overlay = document.getElementById('overlay');
const modal = document.getElementById('modal');
const eventsGrid = document.getElementById('eventsGrid');
const addEventSection = document.getElementById('addEventSection');
const eventForm = document.getElementById('eventForm');
const closeAdd = document.getElementById('closeAdd');
const cancelAdd = document.getElementById('cancelAdd');
const userIdPill = document.getElementById('userIdPill');

const viewQRBtn = document.getElementById('viewQRBtn');
const qrPopup = document.getElementById('qrPopup');
const qrName = document.getElementById('qrName');
const qrEmail = document.getElementById('qrEmail');
const qrPhone = document.getElementById('qrPhone');
const logoutBtn = document.getElementById('logoutBtn');

let adminMode = false;

/* ---------- Events ---------- */
function loadEvents(){ return JSON.parse(localStorage.getItem(STORAGE_EVENTS)||'[]'); }
function saveEvents(arr){ localStorage.setItem(STORAGE_EVENTS,JSON.stringify(arr)); }
function renderEvents(){
  const events = loadEvents();
  eventsGrid.innerHTML='';
  if(events.length===0){
    eventsGrid.innerHTML=`<div class="card" style="text-align:center;color:#888">No events yet (Admin: Alt+Z)</div>`;
    return;
  }
  events.forEach((ev,idx)=>{
    const card=document.createElement('div'); card.className='card';
    card.innerHTML=`
      <h3>${ev.title}</h3>
      <p>${ev.description}</p>
      <div class="small-muted">${ev.location||'Online'} · ${new Date(ev.datetime).toLocaleString()}</div>
      <div class="actions">
        ${adminMode?`<button data-action="delete" data-idx="${idx}">Delete</button>`:''}
      </div>
    `;
    eventsGrid.appendChild(card);
  });
}

/* ---------- Admin ---------- */
function toggleAdminMode(on){ adminMode=!!on; addEventSection.classList.toggle('hidden',!adminMode); renderEvents(); }
document.addEventListener('keydown',e=>{ if(e.altKey && e.key.toLowerCase()==='z') toggleAdminMode(!adminMode); });

eventForm.addEventListener('submit',e=>{
  e.preventDefault();
  const title=document.getElementById('ev_title').value.trim();
  const datetime=document.getElementById('ev_datetime').value;
  const location=document.getElementById('ev_location').value.trim();
  const description=document.getElementById('ev_description').value.trim();
  if(!title||!datetime) return alert('Provide title & date');
  const events=loadEvents();
  events.push({title,datetime,location,description});
  saveEvents(events);
  eventForm.reset(); addEventSection.classList.add('hidden'); renderEvents();
});

closeAdd.addEventListener('click',()=>addEventSection.classList.add('hidden'));
cancelAdd.addEventListener('click',()=>addEventSection.classList.add('hidden'));

/* ---------- Login system ---------- */
function getUser(){ return JSON.parse(localStorage.getItem(STORAGE_USER)||'null'); }
function setUser(user){ localStorage.setItem(STORAGE_USER,JSON.stringify(user)); }
function isAuth(){ return !!localStorage.getItem(STORAGE_AUTH); }
function setAuth(){ localStorage.setItem(STORAGE_AUTH,'true'); }
function logout(){ localStorage.removeItem(STORAGE_AUTH); qrPopup.style.display='none'; alert('Logged out'); }

function showLogin(){
  const u=getUser();
  if(u){ setAuth(); return; }
  const name=prompt('Enter your full name:');
  if(!name) return showLogin();
  const email=prompt('Enter your email:');
  if(!email) return showLogin();
  const phone=prompt('Enter your phone:');
  if(!phone) return showLogin();
  const pass=prompt('Enter a password:');
  if(!pass) return showLogin();
  const user={name,email,phone,password:pass};
  setUser(user); setAuth();
}
if(!isAuth()) showLogin();

/* ---------- QR popup ---------- */
viewQRBtn.addEventListener('click',()=>{
  const u=getUser(); if(!u) return alert('Login required');
  qrName.textContent=`👤 Name: ${u.name}`;
  qrEmail.textContent=`📧 Email: ${u.email}`;
  qrPhone.textContent=`📞 Phone: ${u.phone}`;
  const qr = new QRious({element:document.getElementById('qrCode'), value:`Name:${u.name};Email:${u.email};Phone:${u.phone}`, size:200});
  qrPopup.style.display='block';
});
logoutBtn.addEventListener('click',logout);







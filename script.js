/* Inginous v2.1 script
   - Admin mode toggled by Alt+Z (shows add event panel and Delete buttons)
   - Auto-generate 350 IDs (ING-001 .. ING-350) stored in localStorage
   - Assign visitor an ID on first visit (stored in 'inginous_user_id')
   - Clicking an event -> login popup (prefilled with assigned ID)
   - On valid ID -> Access granted, then show event details (modal)
   - QR generation uses QRious (loaded via CDN in index.html)
*/

/* ---------- Helpers ---------- */
const STORAGE_EVENTS = 'inginous_events_v2';
const STORAGE_IDS = 'inginous_id_pool_v2';
const STORAGE_USER_ID = 'inginous_user_id_v2';
const STORAGE_AUTH = 'inginous_auth_v2';
const ADMIN_SHORTCUT = { alt: true, key: 'z' };

const overlay = document.getElementById('overlay');
const modal = document.getElementById('modal');
const eventsGrid = document.getElementById('eventsGrid');
const addEventSection = document.getElementById('addEventSection');
const eventForm = document.getElementById('eventForm');
const closeAdd = document.getElementById('closeAdd');
const cancelAdd = document.getElementById('cancelAdd');
const userIdPill = document.getElementById('userIdPill');

let adminMode = false;

/* ---------- ID pool & assignment ---------- */
function initIdPool(){
  const raw = localStorage.getItem(STORAGE_IDS);
  if(raw) return JSON.parse(raw);
  const pool = [];
  for(let i=1;i<=350;i++){
    const num = String(i).padStart(3,'0');
    pool.push({ id:`ING-${num}`, used:false });
  }
  localStorage.setItem(STORAGE_IDS, JSON.stringify(pool));
  return pool;
}

function assignUserId(){
  const existing = localStorage.getItem(STORAGE_USER_ID);
  if(existing) return existing;
  const pool = initIdPool();
  // pick first unused
  const idx = pool.findIndex(p => p.used === false);
  if(idx === -1){
    // fallback: generate new id beyond 350
    const gen = `ING-${String(350 + Math.floor(Math.random()*10000)).padStart(3,'0')}`;
    localStorage.setItem(STORAGE_USER_ID, gen);
    return gen;
  }
  const assigned = pool[idx].id;
  pool[idx].used = true;
  localStorage.setItem(STORAGE_IDS, JSON.stringify(pool));
  localStorage.setItem(STORAGE_USER_ID, assigned);
  return assigned;
}

function getAssignedUserId(){
  return localStorage.getItem(STORAGE_USER_ID) || assignUserId();
}

/* ---------- event storage ---------- */
function loadEvents(){
  try{
    return JSON.parse(localStorage.getItem(STORAGE_EVENTS)) || [];
  }catch(e){
    return [];
  }
}
function saveEvents(arr){
  localStorage.setItem(STORAGE_EVENTS, JSON.stringify(arr));
}

/* ---------- render events ---------- */
function renderEvents(){
  const events = loadEvents();
  eventsGrid.innerHTML = '';
  if(events.length === 0){
    eventsGrid.innerHTML = `<div class="card" style="grid-column:1/-1;text-align:center;color:var(--muted)">No events yet. (Admins: press Alt + Z to add.)</div>`;
    return;
  }
  events.forEach((ev, idx) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${escapeHtml(ev.title)}</h3>
      <p>${escapeHtml(ev.description)}</p>
      <div class="meta">
        <div class="small-muted">${ev.location || 'Online'} · ${new Date(ev.datetime).toLocaleString()}</div>
        <div class="actions">
          <button class="btn" data-action="view" data-idx="${idx}">View</button>
          <button class="btn secondary" data-action="share" data-idx="${idx}">Share</button>
          ${adminMode ? `<button class="btn delete" data-action="delete" data-idx="${idx}">Delete</button>` : ''}
        </div>
      </div>
      <div style="margin-top:10px"><img class="qr-img" alt="QR" id="qr-${idx}"></div>
    `;
    eventsGrid.appendChild(card);

    // create QR image for this event (link to hosted page fragment)
    const url = location.origin + location.pathname + `#event-${idx}`;
    // wait for QRious to be available
    if(window.QRious){
      const qr = new QRious({value:url, size:240, level:'H', background:'transparent', foreground:'#66fcf1'});
      const img = card.querySelector(`#qr-${idx}`);
      if(img) img.src = qr.toDataURL();
    } else {
      // fallback: simple canvas after library loads - set later
      setTimeout(() => {
        if(window.QRious){
          const qr = new QRious({value:url, size:240, level:'H', background:'transparent', foreground:'#66fcf1'});
          const img = document.getElementById(`qr-${idx}`);
          if(img) img.src = qr.toDataURL();
        }
      }, 500);
    }
  });
}

/* ---------- utilities ---------- */
function escapeHtml(s){ if(!s) return ''; return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

/* ---------- admin add/delete handling ---------- */
function toggleAdminMode(on){
  adminMode = !!on;
  if(adminMode){
    addEventSection.classList.remove('hidden');
  } else {
    addEventSection.classList.add('hidden');
  }
  renderEvents(); // to toggle delete buttons
}

/* form submit */
eventForm.addEventListener('submit', (ev)=>{
  ev.preventDefault();
  const title = document.getElementById('ev_title').value.trim();
  const datetime = document.getElementById('ev_datetime').value;
  const location = document.getElementById('ev_location').value.trim();
  const description = document.getElementById('ev_description').value.trim();
  if(!title || !datetime){ alert('Please provide title and date/time'); return; }
  const events = loadEvents();
  events.push({ title, datetime, location, description, created: new Date().toISOString() });
  saveEvents(events);
  eventForm.reset();
  // auto-hide the add panel
  addEventSection.classList.add('hidden');
  renderEvents();
});

/* close & cancel */
closeAdd.addEventListener('click', ()=> addEventSection.classList.add('hidden'));
cancelAdd.addEventListener('click', ()=> addEventSection.classList.add('hidden'));

/* hide add panel when clicking outside */
document.addEventListener('click', (e)=>{
  const isInside = addEventSection.contains(e.target);
  if(!isInside && !addEventSection.classList.contains('hidden')){
    addEventSection.classList.add('hidden');
  }
});

/* Admin shortcut Alt + Z */
document.addEventListener('keydown', (e)=>{
  if(e.altKey && e.key.toLowerCase() === 'z'){
    toggleAdminMode(!adminMode);
  }
});

/* ---------- modal utilities ---------- */
function showOverlay(){
  overlay.classList.remove('hidden');
  modal.classList.remove('hidden');
}
function hideModal(){
  overlay.classList.add('hidden');
  modal.classList.add('hidden');
  modal.innerHTML = '';
}

/* click overlay to close modal */
overlay.addEventListener('click', hideModal);

/* ---------- authentication ---------- */
function isAuthenticated(){
  return !!localStorage.getItem(STORAGE_AUTH);
}
function setAuthenticated(id){
  localStorage.setItem(STORAGE_AUTH, id);
}
function logoutAuth(){
  localStorage.removeItem(STORAGE_AUTH);
}

/* ---------- event click handling ---------- */
eventsGrid.addEventListener('click', (e)=>{
  const btn = e.target.closest('button');
  if(!btn) return;
  const action = btn.dataset.action;
  const idx = Number(btn.dataset.idx);
  if(action === 'view'){
    handleEventView(idx);
  } else if(action === 'share'){
    // copy share link
    const url = location.origin + location.pathname + `#event-${idx}`;
    navigator.clipboard?.writeText(url).then(()=> alert('Share link copied'), ()=> alert(url));
  } else if(action === 'delete'){
    // admin-only delete
    if(!adminMode){ alert('Enable admin (Alt+Z) to delete.'); return; }
    if(!confirm('Delete this event?')) return;
    const arr = loadEvents();
    arr.splice(idx,1);
    saveEvents(arr);
    renderEvents();
  }
});

/* when an event card's view is requested */
function handleEventView(idx){
  const events = loadEvents();
  const ev = events[idx];
  if(!ev) return alert('Event not found');
  // if already authenticated -> show details directly
  if(isAuthenticated()){
    showAccessGrantedThenDetails(localStorage.getItem(STORAGE_AUTH), ev);
    return;
  }
  // show login modal (prefill with assigned user id)
  const assigned = getAssignedUserId();
  modal.innerHTML = `
    <div class="login-box">
      <h3>Member login required</h3>
      <div class="small-muted">Enter your Inginous ID to view event details.</div>
      <div class="input-row">
        <input id="loginInput" type="text" value="${assigned}" />
        <button id="loginBtn" class="primary">Enter</button>
      </div>
      <div id="loginMsg" class="small-muted" style="margin-top:10px"></div>
      <div style="margin-top:12px" class="small-muted">If you don't know your ID: one was assigned to you when you first visited. It is prefilled above.</div>
    </div>
  `;
  showOverlay();
  // listeners
  document.getElementById('loginBtn').addEventListener('click', ()=>{
    const val = document.getElementById('loginInput').value.trim();
    validateAndProceed(val, ev);
  });
  document.getElementById('loginInput').addEventListener('keydown', (e)=>{
    if(e.key === 'Enter'){
      e.preventDefault();
      document.getElementById('loginBtn').click();
    }
  });
}

/* validate ID against pool */
function validateAndProceed(val, ev){
  if(!val){ setLoginMsg('Enter an ID'); return; }
  const pool = JSON.parse(localStorage.getItem(STORAGE_IDS) || '[]');
  const exists = pool.some(p => p.id === val);
  if(!exists){
    setLoginMsg('❌ Invalid ID', true);
    return;
  }
  // valid => authenticate and show details
  setAuthenticated(val);
  setLoginMsg(`✅ Access granted — logged in as ${val}`, false);
  // small delay then show details
  setTimeout(()=>{
    showAccessGrantedThenDetails(val, ev);
  }, 700);
}
function setLoginMsg(msg, isError){
  const el = document.getElementById('loginMsg');
  if(!el) return;
  el.textContent = msg;
  el.style.color = isError ? '#ff9f9f' : '#bfffe9';
}

/* show details modal after success */
function showAccessGrantedThenDetails(id, ev){
  modal.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div>
        <h3 style="margin:0">${escapeHtml(ev.title)}</h3>
        <div class="small-muted">${new Date(ev.datetime).toLocaleString()} · ${escapeHtml(ev.location || 'Online')}</div>
      </div>
      <div style="text-align:right">
        <div class="small-muted">Logged in as</div>
        <div style="font-weight:800;color:var(--neon)">${id}</div>
      </div>
    </div>
    <div style="margin-top:12px;color:var(--muted)">${escapeHtml(ev.description)}</div>
    <div style="display:flex;gap:12px;margin-top:14px;flex-wrap:wrap;align-items:center">
      <div><img id="modalQR" style="width:160px;height:160px;border-radius:10px" alt="QR"></div>
      <div style="min-width:220px">
        <div style="font-weight:700;color:var(--neon)">Shareable link</div>
        <input id="shareLink" readonly style="margin-top:8px;padding:8px;border-radius:8px;border:1px solid rgba(102,252,241,0.03);width:100%;background:transparent;color:#cfeef0" value="${location.origin + location.pathname + '#event-' + (function(){ return loadEvents().indexOf(ev); })() }" />
        <div style="margin-top:8px;display:flex;gap:8px">
          <button id="copyLink" class="btn">Copy link</button>
          <button id="closeModal" class="ghost">Close</button>
        </div>
      </div>
    </div>
  `;
  // generate QR
  const url = location.origin + location.pathname + `#event-${loadEvents().indexOf(ev)}`;
  if(window.QRious){
    const qr = new QRious({value:url, size:320, level:'H', background:'transparent', foreground:'#66fcf1'});
    const img = document.getElementById('modalQR');
    if(img) img.src = qr.toDataURL();
  }
  // copy handler
  document.getElementById('copyLink').addEventListener('click', ()=>{
    const v = document.getElementById('shareLink').value;
    navigator.clipboard?.writeText(v).then(()=> alert('Link copied'), ()=> alert('Copy failed — select manually.'));
  });
  document.getElementById('closeModal').addEventListener('click', hideModal);
  showOverlay();
}

/* ---------- initial setup ---------- */
(function init(){
  // initialize ID pool (if missing)
  initIdPool();
  // assign user id if missing
  const assigned = getAssignedUserId();
  if(userIdPill) userIdPill.textContent = `ID: ${assigned}`;

  // render events
  renderEvents();

  // hide modal on ESC
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape') hideModal();
  });

  // if there is fragment like #event-<idx>, open it (but respect auth)
  if(location.hash && location.hash.startsWith('#event-')){
    const idx = Number(location.hash.replace('#event-',''));
    // small delay to let UI render
    setTimeout(()=> {
      handleEventView(idx);
    }, 300);
  }
})();


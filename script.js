/* Inginous v2.2 script
   - Login with email, name, and phone (shows login popup)
   - After login, generate a QR code with user info
   - Admin mode toggled by Alt+Z (shows add event panel and Delete buttons)
   - Events stored in localStorage
   - QR generation uses QRious
*/

/* ---------- Helpers ---------- */
const STORAGE_EVENTS = 'inginous_events_v2';
const STORAGE_USER_INFO = 'inginous_user_info_v2';  // Stores {name, email, phone}
const STORAGE_AUTH = 'inginous_auth_v2';  // Simple flag for authentication
const ADMIN_SHORTCUT = { alt: true, key: 'z' };

const overlay = document.getElementById('overlay');
const modal = document.getElementById('modal');
const eventsGrid = document.getElementById('eventsGrid');
const addEventSection = document.getElementById('addEventSection');
const eventForm = document.getElementById('eventForm');
const closeAdd = document.getElementById('closeAdd');
const cancelAdd = document.getElementById('cancelAdd');

let adminMode = false;

/* ---------- User info storage ---------- */
function isAuthenticated() {
  return !!localStorage.getItem(STORAGE_AUTH);
}

function setAuthenticated(userInfo) {
  localStorage.setItem(STORAGE_USER_INFO, JSON.stringify(userInfo));
  localStorage.setItem(STORAGE_AUTH, 'true');  // Simple flag
}

function getUserInfo() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_USER_INFO)) || null;
  } catch (e) {
    return null;
  }
}

function logoutAuth() {
  localStorage.removeItem(STORAGE_USER_INFO);
  localStorage.removeItem(STORAGE_AUTH);
}

/* ---------- Event storage and rendering ---------- */
function loadEvents() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_EVENTS)) || [];
  } catch (e) {
    return [];
  }
}

function saveEvents(arr) {
  localStorage.setItem(STORAGE_EVENTS, JSON.stringify(arr));
}

function renderEvents() {
  const events = loadEvents();
  eventsGrid.innerHTML = '';
  if (events.length === 0) {
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
      <div style="margin-top:10px"><img class="qr-img" alt="Event QR" id="qr-${idx}"></div>
    `;
    eventsGrid.appendChild(card);

    const url = location.origin + location.pathname + `#event-${idx}`;
    if (window.QRious) {
      const qr = new QRious({ value: url, size: 240, level: 'H', background: 'transparent', foreground: '#66fcf1' });
      const img = card.querySelector(`#qr-${idx}`);
      if (img) img.src = qr.toDataURL();
    }
  });
}

function escapeHtml(s) { if (!s) return ''; return String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;'); }

/* ---------- Admin handling ---------- */
function toggleAdminMode(on) {
  adminMode = !!on;
  if (adminMode) {
    addEventSection.classList.remove('hidden');
  } else {
    addEventSection.classList.add('hidden');
  }
  renderEvents();
}

eventForm.addEventListener('submit', (ev) => {
  ev.preventDefault();
  const title = document.getElementById('ev_title').value.trim();
  const datetime = document.getElementById('ev_datetime').value;
  const location = document.getElementById('ev_location').value.trim();
  const description = document.getElementById('ev_description







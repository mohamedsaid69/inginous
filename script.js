// Elements
const loginPopup = document.getElementById('loginPopup');
const loginBtn = document.getElementById('loginBtn');
const qrPopup = document.getElementById('qrPopup');
const viewQRBtn = document.getElementById('viewQRBtn');
const logoutBtn = document.getElementById('logoutBtn');
const qrName = document.getElementById('qrName');
const qrEmail = document.getElementById('qrEmail');
const qrPhone = document.getElementById('qrPhone');
const eventList = document.getElementById('eventList');
const body = document.body;

// Admin mode
let adminMode = false;

// Check login
window.onload = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if(!user){
        loginPopup.style.display = 'flex';
    } else {
        loadEvents();
    }
}

// Login
loginBtn.onclick = () => {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    if(name && email && phone && password){
        const user = {name,email,phone};
        localStorage.setItem('user', JSON.stringify(user));
        loginPopup.style.display = 'none';
        loadEvents();
    }
}

// QR Code
viewQRBtn.onclick = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if(user){
        qrPopup.style.display = 'flex';
        qrName.textContent = user.name;
        qrEmail.textContent = user.email;
        qrPhone.textContent = user.phone;

        const qr = new QRious({
            element: document.getElementById('qrCode'),
            value: `Name: ${user.name}\nEmail: ${user.email}\nPhone: ${user.phone}`,
            size: 200,
            background: '#111',
            foreground: '#0ff'
        });
    }
}

// Logout
logoutBtn.onclick = () => {
    localStorage.removeItem('user');
    location.reload();
}

// Admin panel toggle
document.addEventListener('keydown', (e) => {
    if(e.altKey && e.key.toLowerCase() === 'z'){
        adminMode = !adminMode;
        if(adminMode){
            body.classList.add('admin-mode');
        } else {
            body.classList.remove('admin-mode');
        }
    }
});

// Events system
function loadEvents(){
    const events = JSON.parse(localStorage.getItem('events')) || [];
    eventList.innerHTML = '';
    events.forEach((event, index) => {
        const div = document.createElement('div');
        div.className = 'event-item';
        div.textContent = event;
        if(adminMode){
            const delBtn = document.createElement('span');
            delBtn.className = 'delete-btn';
            delBtn.textContent = 'Delete';
            delBtn.onclick = () => deleteEvent(index);
            div.appendChild(delBtn);
        }
        eventList.appendChild(div);
    });
}

// Delete event
function deleteEvent(index){
    const events = JSON.parse(localStorage.getItem('events')) || [];
    events.splice(index,1);
    localStorage.setItem('events', JSON.stringify(events));
    loadEvents();
}




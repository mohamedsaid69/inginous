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

let adminMode = false;

// Check login on page load
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
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value.trim();

    if(name && email && phone && password){
        const user = {name, email, phone};
        localStorage.setItem('user', JSON.stringify(user));
        loginPopup.style.display = 'none';
        loadEvents();
    } else {
        alert('Please fill all fields!');
    }
}

// View QR
viewQRBtn.onclick = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if(user){
        qrPopup.style.display = 'flex';
        qrName.textContent = user.name;
        qrEmail.textContent = user.email;
        qrPhone.textContent = user.phone;

        new QRious({
            element: document.getElementById('qrCode'),
            value: JSON.stringify(user),
            size: 200,
            background: '#0a0f1a',
            foreground: '#0ff'
        });
    }
}

// Logout
logoutBtn.onclick = () => {
    localStorage.removeItem('user');
    location.reload();
}

// Admin Mode toggle
document.addEventListener('keydown', (e) => {
    if(e.altKey && e.code === 'KeyZ'){
        adminMode = !adminMode;
        if(adminMode) body.classList.add('admin-mode');
        else body.classList.remove('admin-mode');
        loadEvents();
    }
});

// Load events
function loadEvents(){
    const events = JSON.parse(localStorage.getItem('events')) || [];
    eventList.innerHTML = '';
    events.forEach((event,index) => {
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





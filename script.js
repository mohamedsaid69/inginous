/* General Styles */
body {
    margin: 0;
    font-family: Arial, sans-serif;
    background: #0a0f1a;
    color: #fff;
}

/* Navbar */
.navbar {
    position: sticky;
    top: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(0,0,0,0.8);
    padding: 10px 20px;
    backdrop-filter: blur(10px);
    z-index: 1000;
}
.navbar .logo {
    font-size: 24px;
    color: #0ff;
    font-weight: bold;
}
.navbar .links a, .navbar .links button {
    margin-left: 20px;
    color: #0ff;
    background: none;
    border: 1px solid #0ff;
    padding: 5px 10px;
    border-radius: 5px;
    cursor: pointer;
    transition: 0.3s;
}
.navbar .links a:hover, .navbar .links button:hover {
    background: #0ff;
    color: #000;
}

/* Popup */
.popup {
    display: none;
    position: fixed;
    top:0;
    left:0;
    width:100%;
    height:100%;
    background: rgba(0,0,0,0.8);
    backdrop-filter: blur(10px);
    justify-content: center;
    align-items: center;
    z-index: 1001;
}
.popup-content {
    background: #111;
    padding: 30px;
    border-radius: 10px;
    text-align: center;
    box-shadow: 0 0 20px #0ff;
}
.popup-content input {
    display: block;
    margin: 10px auto;
    padding: 10px;
    width: 80%;
    border-radius: 5px;
    border: none;
}
.popup-content button {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    background: #0ff;
    color: #000;
    cursor: pointer;
    margin-top: 10px;
}

/* QR Popup */
#qrCode {
    margin-bottom: 20px;
}

/* Event List */
#eventList {
    margin: 20px;
}
.event-item {
    background: #111;
    margin-bottom: 10px;
    padding: 10px;
    border-left: 3px solid #0ff;
    position: relative;
}
.delete-btn {
    position: absolute;
    right: 10px;
    top: 10px;
    color: #0ff;
    cursor: pointer;
    display: none;
}

/* Admin Mode */
.admin-mode .delete-btn {
    display: inline;
}

/* Smooth scrolling */
html {
    scroll-behavior: smooth;
}



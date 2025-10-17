// === Local QR Generator (client-side) ===
// A simple embedded function to generate QR codes (no external API)
function generateQR(text) {
  const canvas = document.createElement("canvas");
  const qr = new QRious({
    element: canvas,
    value: text,
    size: 150,
    background: "transparent",
    foreground: "#66fcf1"
  });
  return canvas.toDataURL("image/png");
}

// Load QRious library dynamically (so it's local & works offline)
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/qrious@4.0.2/dist/qrious.min.js';
document.head.appendChild(script);

// === Event Management ===
const eventList = document.getElementById("event-list");
const form = document.getElementById("event-form");
const addEventSection = document.getElementById("add-event-section");

// Load events from localStorage
function loadEvents() {
  const events = JSON.parse(localStorage.getItem("inginous_events")) || [];
  eventList.innerHTML = "";

  events.forEach((e, i) => {
    const card = document.createElement("div");
    card.classList.add("event-card");
    card.innerHTML = `
      <h3>${e.title}</h3>
      <p>${e.description}</p>
      <p class="date">📅 ${e.date}</p>
      <div class="qr"><img src="${generateQR(location.origin + location.pathname + "#event-" + i)}" alt="QR Code"></div>
    `;
    eventList.appendChild(card);
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("event-title").value;
  const desc = document.getElementById("event-description").value;
  const date = document.getElementById("event-date").value;

  const events = JSON.parse(localStorage.getItem("inginous_events")) || [];
  events.push({ title, description: desc, date });
  localStorage.setItem("inginous_events", JSON.stringify(events));

  form.reset();
  addEventSection.classList.add("hidden");
  loadEvents();
});

// === Admin Shortcut (Alt + Z) ===
document.addEventListener("keydown", (e) => {
  if (e.altKey && e.key.toLowerCase() === "z") {
    addEventSection.classList.toggle("hidden");
  }
});

// Hide form when clicking outside
document.addEventListener("click", (e) => {
  if (!addEventSection.contains(e.target) && !addEventSection.classList.contains("hidden")) {
    addEventSection.classList.add("hidden");
  }
});

// Initialize events
window.addEventListener("load", loadEvents);

// ==========================
// 📍 GLOBAL VARIABLES
// ==========================
let map;
let userMarker;
let policeMarker;
let routeLine;
let trackingInterval;


// ==========================
// 🔧 REVERSE GEOCODE HELPER
// ==========================
async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
    );
    const data = await res.json();
    return data.display_name || `${lat}, ${lon}`;
  } catch {
    return `${lat}, ${lon}`;
  }
}


// ==========================
// 📍 INIT MAP
// ==========================
function initMap(containerId = 'map', lat = 12.9716, lon = 77.5946, zoom = 13) {
  if (map) {
    map.remove();
    map = null;
  }
  map = L.map(containerId).setView([lat, lon], zoom);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);
}


// ==========================
// 📍 GET USER LOCATION (index.html)
// ==========================
window.onload = function () {
  const page = document.body.dataset.page;

  if (page === 'index') {
    initMap('map');
    getLocation();
  }

  if (page === 'track') {
    const requestId = getRequestIdFromURL();
    if (requestId) {
      document.getElementById("requestId").value = requestId;
      initMap('map');
      startTracking(requestId);
    }
  }

  if (page === 'dashboard') {
    loadRequests();
    setInterval(loadRequests, 5000); // auto-refresh every 5s
  }
};


function getLocation() {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      document.getElementById("lat").value = lat;
      document.getElementById("lon").value = lon;

      // Reverse geocode to get readable address
      reverseGeocode(lat, lon).then(address => {
        document.getElementById("locationArea").value = address;
      });

      // Show user on map
      if (map) {
        map.setView([lat, lon], 15);
        if (userMarker) userMarker.remove();
        userMarker = L.marker([lat, lon])
          .addTo(map)
          .bindPopup("You are here 📍")
          .openPopup();
      }
    },
    function () {
      alert("Location access denied. Please enable location.");
    },
    { enableHighAccuracy: true }
  );
}


// ==========================
// 🎤 VOICE INPUT
// ==========================
function startVoice() {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Speech recognition not supported in this browser.");
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = document.getElementById("language").value;
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = function (event) {
    document.getElementById("message").value = event.results[0][0].transcript;
  };

  recognition.onerror = function (event) {
    alert("Voice error: " + event.error);
  };

  recognition.start();
}


// ==========================
// 📤 SUBMIT REQUEST (index.html)
// ==========================
async function submitRequest(event) {
  event.preventDefault();

  const data = {
    issueType: document.getElementById("issueType").value,
    message: document.getElementById("message").value,
    language: document.getElementById("language").value,
    locationArea: document.getElementById("locationArea").value,
    latitude: parseFloat(document.getElementById("lat").value),
    longitude: parseFloat(document.getElementById("lon").value)
  };

  try {
    const res = await fetch("http://localhost:8080/api/help/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    document.getElementById("response").innerText =
      "✅ Request Submitted! ID: " + result.requestId;

    setTimeout(() => {
      window.location.href = `track.html?requestId=${result.requestId}`;
    }, 2000);

  } catch (err) {
    document.getElementById("response").innerText = "❌ Submission failed. Try again.";
  }
}


// ==========================
// 🚓 UPDATE MAP (track.html)
// ==========================
function updateLocations(data) {
  const userLatLng = [data.latitude, data.longitude];
  const policeLatLng = [data.policeLat, data.policeLng];

  // User marker
  if (!userMarker) {
    userMarker = L.marker(userLatLng, {
      icon: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        shadowSize: [41, 41]
      })
    }).addTo(map).bindPopup("📍 Your Location");
  } else {
    userMarker.setLatLng(userLatLng);
  }

  const isMedical = data.issueType === 'MEDICAL' || data.policeGroup === 'MEDICAL_TEAM';

  // Dynamic marker icon (Medical vs Police)
  const markerIconHtml = isMedical ? `<div class="medical-dot"></div>` : `<div class="police-dot"></div>`;
  const popupLabel = isMedical ? "🚑 Medical Team En Route" : "🚓 Police En Route";

  const customIcon = L.divIcon({
    html: markerIconHtml,
    iconSize: [22, 22],
    className: ''
  });

  if (!policeMarker) {
    policeMarker = L.marker(policeLatLng, { icon: customIcon })
      .addTo(map)
      .bindPopup(popupLabel);
  } else {
    policeMarker.setLatLng(policeLatLng);
    if (!policeMarker.getPopup().getContent().includes(isMedical ? "Medical" : "Police")) {
      policeMarker.setIcon(customIcon);
      policeMarker.getPopup().setContent(popupLabel);
    }
  }

  // Route line between team and user
  if (routeLine) map.removeLayer(routeLine);
  routeLine = L.polyline([policeLatLng, userLatLng], {
    color: isMedical ? '#ef4444' : '#1a73e8',
    weight: 3,
    dashArray: '8, 8'
  }).addTo(map);

  // Fit both markers in view
  map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
}


// ==========================
// 🔄 START TRACKING (track.html)
// ==========================
async function startTracking(requestId) {
  async function poll() {
    try {
      const res = await fetch("http://localhost:8080/api/help/track/" + requestId);
      const data = await res.json();

      const statusEl = document.getElementById("result");
      if (statusEl) {
        statusEl.innerHTML = `<h3>Status: <span style="color:${
          data.status === 'RESOLVED' ? 'green' : data.status === 'IN_PROGRESS' ? 'orange' : '#333'
        }">${data.status}</span></h3>`;
      }

      if (data.status === 'IN_PROGRESS' || data.status === 'RESOLVED') {
        updateLocations(data);
      }

      if (data.status === 'RESOLVED') {
        clearInterval(trackingInterval);
        if (statusEl) statusEl.innerHTML += `<p>✅ Help has arrived!</p>`;
      }
    } catch (err) {
      console.error("Tracking error:", err);
    }
  }

  poll(); // immediate first call
  trackingInterval = setInterval(poll, 3000);
}

// Legacy support if track.html uses a button
async function track() {
  const id = document.getElementById("requestId").value;
  if (!map) initMap('map');
  startTracking(id);
}


// ==========================
// 👮 LOAD DASHBOARD (dashboard.html)
// ==========================
async function loadRequests() {
  try {
    const res = await fetch("http://localhost:8080/api/help/all");
    const data = await res.json();
    let counts = { LOW:0, MEDIUM:0, HIGH:0, CRITICAL:0 };
    let resolved = 0;
    let pending = 0;
    const tbody = document.querySelector("#requestTable tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    for (const r of data) {
      // count urgency
if (counts[r.urgencyLevel] !== undefined) {
  counts[r.urgencyLevel]++;
}

// count resolved
if (r.status === "RESOLVED") resolved++;
else pending++;
      // Reverse geocode if locationArea looks like coordinates
      let displayLocation = r.locationArea;
      const parts = r.locationArea.split(",");
      if (parts.length === 2 && !isNaN(parts[0].trim()) && !isNaN(parts[1].trim())) {
        displayLocation = await reverseGeocode(parts[0].trim(), parts[1].trim());
      }

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${r.requestId}</td>
        <td>${r.message || '-'}</td>
        <td>${displayLocation}</td>
       <td><span class="badge badge-${r.urgencyLevel.toLowerCase()}">${r.urgencyLevel}</span></td>
<td><span class="badge badge-${r.status.toLowerCase().replace('_','-')}">${r.status}</span></td>
        <td>${r.policeGroup || '-'}</td>
        <td class="action-cell"></td>
      `;

      const actionCell = row.querySelector(".action-cell");

      const assignBtn = document.createElement("button");
      assignBtn.innerText = "Assign";
      assignBtn.classList.add("btn-assign");
      assignBtn.type = "button";
      const resolveBtn = document.createElement("button");
      resolveBtn.innerText = "Resolve";
      resolveBtn.classList.add("btn-resolve");
      resolveBtn.type = "button"; 
      if (r.status === "SUBMITTED") {
        assignBtn.onclick = () => assign(r.requestId);
        resolveBtn.disabled = true;
        resolveBtn.classList.add("btn-disabled");

      } else if (r.status === "IN_PROGRESS") {
        assignBtn.disabled = true;
        assignBtn.classList.add("btn-disabled");
        resolveBtn.onclick = () => resolveReq(r.requestId);

      } else if (r.status === "RESOLVED") {
        assignBtn.disabled = true;
        resolveBtn.disabled = true;
        assignBtn.classList.add("btn-disabled");
        resolveBtn.classList.add("btn-disabled");
      }

      actionCell.appendChild(assignBtn);
      actionCell.appendChild(resolveBtn);
      tbody.appendChild(row);
    }
    drawUrgencyChart(counts);
    drawResolvedChart(resolved, pending);
  } catch (err) {
    console.error("Failed to load requests:", err);
  }
  
}


// ==========================
// 🚓 ASSIGN REQUEST
// ==========================
async function assign(requestId) {
  try {
    await fetch("http://localhost:8080/api/help/assign/" + requestId, { method: "PUT" });
    alert("🚓 Police Assigned!");
    loadRequests();
  } catch {
    alert("❌ Failed to assign.");
  }
}


// ==========================
// ✅ RESOLVE REQUEST
// ==========================
async function resolveReq(requestId) {
  try {
    await fetch("http://localhost:8080/api/help/resolve/" + requestId, { method: "PUT" });
    alert("✅ Request Resolved!");
    loadRequests();
  } catch {
    alert("❌ Failed to resolve.");
  }
}


// ==========================
// 🔗 URL HELPER
// ==========================
function getRequestIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("requestId");
}

let urgencyChart;

function drawUrgencyChart(counts){
  if(urgencyChart) urgencyChart.destroy();
  urgencyChart = new Chart(document.getElementById("urgencyChart"), {
    type: 'doughnut',
    data: {
      labels: ["Low", "Medium", "High", "Critical"],
      datasets: [{ data: [counts.LOW, counts.MEDIUM, counts.HIGH, counts.CRITICAL],
        backgroundColor: ["#639922", "#378ADD", "#EF9F27", "#E24B4A"],
        borderWidth: 0, hoverOffset: 4 }]
    },
    options: { plugins: { legend: { position: "right" } }, cutout: "60%" }
  });
}

let resolvedChart;

function drawResolvedChart(resolved, pending){
  if(resolvedChart) resolvedChart.destroy();
  resolvedChart = new Chart(document.getElementById("resolvedChart"), {
    type: 'bar',
    data: {
      labels: ["Resolved", "Pending"],
      datasets: [{ label: "Cases", data: [resolved, pending],
        backgroundColor: ["#1D9E75", "#E24B4A"], borderRadius: 4, borderWidth: 0 }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: "rgba(0,0,0,0.05)" } }
      }
    }
  });
}
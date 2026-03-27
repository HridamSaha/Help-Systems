
window.addEventListener("DOMContentLoaded", function () {

    const locationInput = document.getElementById("locationArea");

    if (!locationInput) return;

    if (navigator.geolocation) {

        navigator.geolocation.getCurrentPosition(
            function(position) {

                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
                .then(res => res.json())
                .then(data => {

                    const city =
                        data.address.city ||
                        data.address.town ||
                        data.address.village ||
                        data.address.state ||
                        "Location detected";

                    locationInput.value = city;

                })
                .catch(error => {
                    console.log("Geocoding error:", error);
                    locationInput.value = lat + ", " + lon;
                });

            },
            function(error) {
                console.log("Location error:", error.message);
            },
               {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    }
        );

    }
});
async function submitRequest(event){

event.preventDefault();

const data = {
issueType: document.getElementById("issueType").value,
message: document.getElementById("message").value,
language: document.getElementById("language").value,
voiceText: document.getElementById("voiceText").value,
locationArea: document.getElementById("locationArea").value
};

const res = await fetch("http://localhost:8080/api/help/submit",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(data)
});

const result = await res.json();

document.getElementById("response").innerText =
"Request Submitted. Request ID: " + result.requestId;
}

function startVoice(){

if (!('webkitSpeechRecognition' in window)) {
alert("Speech recognition not supported in this browser");
return;
}

const recognition = new webkitSpeechRecognition();

const selectedLang = document.getElementById("language").value;

recognition.lang = selectedLang;

recognition.continuous = false;
recognition.interimResults = false;

recognition.onstart = function(){
console.log("Voice recognition started...");
};

recognition.onresult = function(event){

const transcript = event.results[0][0].transcript;

// 🔥 Fill the MESSAGE field directly
document.getElementById("message").value = transcript;

};

recognition.onerror = function(event){
console.error("Speech recognition error:", event.error);
alert("Voice recognition error: " + event.error);
};

recognition.start();

}



async function track(){

const id = document.getElementById("requestId").value;

const res = await fetch("http://localhost:8080/api/help/track/" + id);

const data = await res.json();

document.getElementById("result").innerText =
JSON.stringify(data,null,2);

}



async function loadRequests(){

const res = await fetch("http://localhost:8080/api/help/all");

const data = await res.json();

const table = document.getElementById("table");

data.forEach(r=>{

const row = table.insertRow();

row.insertCell(0).innerText = r.requestId;
row.insertCell(1).innerText = r.department;
row.insertCell(2).innerText = r.status;
row.insertCell(3).innerText = r.urgencyLevel;

});

// 🌍 Auto detect location when page loads
// Auto-detect location when page loads


}
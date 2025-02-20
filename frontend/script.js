let googleMapsApiKey = ''; 

function loadGoogleMapsScript() {
    fetch('http://localhost:5000/get-api-key')
        .then(response => response.json())
        .then(data => {
            if (data.apiKey) {
                googleMapsApiKey = data.apiKey; // Store API key globally

                // Dynamically load Google Maps script
                const script = document.createElement('script');
                script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&callback=initMap`;
                script.async = true;
                script.defer = true;
                document.head.appendChild(script);
            } else {
                console.error('API Key not received');
            }
        })
        .catch(error => console.error('Error fetching API Key:', error));
}

loadGoogleMapsScript();


// Function to handle address input field autocomplete for both Source and Destination
function setupAutocomplete(inputId, suggestionsId) {
    const inputElement = document.getElementById(inputId);
    const suggestionsDiv = document.getElementById(suggestionsId);

    inputElement.addEventListener('input', function () {
      const query = this.value;
      
      // Only send request if query length is greater than 2 characters
      if (query.length > 2) {
        getAddressSuggestions(query, suggestionsDiv, inputElement);
      } else {
        suggestionsDiv.innerHTML = ''; // Clear suggestions if query is too short
      }
    });
}

// Fetch address suggestions from the Geocoding API
function getAddressSuggestions(query, suggestionsDiv, inputElement) {
    if (!googleMapsApiKey) {
        console.error("Google Maps API Key not available yet.");
        return;
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${googleMapsApiKey}`;

    $.get(url, function(data) {
        if (data.status === 'OK') {
            if (data.results.length === 0) {
                suggestionsDiv.innerHTML = '<p>No results found</p>';
            } else {
                displaySuggestions(data.results, suggestionsDiv, inputElement);
            }
        } else {
            suggestionsDiv.innerHTML = `<p>Error: ${data.status}</p>`;
        }
    }).fail(function() {
        suggestionsDiv.innerHTML = '<p>Error fetching suggestions</p>';
    });
}


// Display the suggestions
function displaySuggestions(results, suggestionsDiv, inputElement) {
    suggestionsDiv.innerHTML = ''; // Clear previous suggestions
    if (results.length === 0) {
        suggestionsDiv.innerHTML = '<p>No results found</p>';
        suggestionsDiv.style.display = 'block'; // Show message if no results
    } else {
        results.forEach(function(result) {
            const div = document.createElement('div');
            div.textContent = result.formatted_address;  // Show the full address
            div.addEventListener('click', function() {
                inputElement.value = result.formatted_address; // Set input value to selected address
                suggestionsDiv.innerHTML = ''; // Clear suggestions after selection
                suggestionsDiv.style.display = 'none'; // Hide suggestions box
            });
            suggestionsDiv.appendChild(div);
        });
        suggestionsDiv.style.display = 'block'; // Show suggestions if there are results
    }
}

// Set up autocomplete for both Source and Destination input fields
setupAutocomplete('source', 'source_suggestions');
setupAutocomplete('destination', 'dest_suggestions');


// Function to initialize Google Map
function initMap() {
    window.map = new google.maps.Map(document.getElementById("map"), {
        zoom: 6,
        center: { lat: 37.0902, lng: -95.7129 }, // Default to USA
    });
}

// Function to plot markers on the map
function plotMarkers(source, destination, waypoints) {
    if (!window.map) return;

    // Clear previous markers
    if (window.markers) {
        window.markers.forEach(marker => marker.setMap(null));
    }

    window.markers = [];

    // Add source marker
    window.markers.push(new google.maps.Marker({
        position: source,
        map: window.map,
        label: "S"
    }));

    // Add destination marker
    window.markers.push(new google.maps.Marker({
        position: destination,
        map: window.map,
        label: "D"
    }));

    // Add intermediate points
    waypoints.forEach((point, index) => {
        window.markers.push(new google.maps.Marker({
            position: point,
            map: window.map,
            label: (index + 1).toString()
        }));
    });

    // Adjust map bounds
    let bounds = new google.maps.LatLngBounds();
    bounds.extend(source);
    bounds.extend(destination);
    waypoints.forEach(point => bounds.extend(point));
    window.map.fitBounds(bounds);
}

// Form submission event
document.getElementById('myForm').addEventListener('submit', function(event) {
    event.preventDefault();  

    const source = document.getElementById('source').value;
    const destination = document.getElementById('destination').value;

    fetch('http://localhost:5000/process-addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, destination })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'OK') {
            const sourceLatLng = { lat: data.source.latitude, lng: data.source.longitude };
            const destLatLng = { lat: data.destination.latitude, lng: data.destination.longitude };
            const waypoints = data.intermediate_points.map(point => ({ lat: point.latitude, lng: point.longitude }));

            document.getElementById('response-container').innerHTML = `
                <h3>Extracted Coordinates</h3>
                <div><strong>Source:</strong> ${sourceLatLng.lat}, ${sourceLatLng.lng}</div>
                <div><strong>Destination:</strong> ${destLatLng.lat}, ${destLatLng.lng}</div>
                <h3>Intermediate Points:</h3>
                <ul>${waypoints.map(p => `<li>${p.lat}, ${p.lng}</li>`).join('')}</ul>
            `;

            plotMarkers(sourceLatLng, destLatLng, waypoints);
        } else {
            document.getElementById('response-container').innerHTML = `<p>Error: ${data.message}</p>`;
        }
    })
    .catch(error => console.error('Error:', error));
});
  

// Call initMap once the script is loaded
window.initMap = initMap;
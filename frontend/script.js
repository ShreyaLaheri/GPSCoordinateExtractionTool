const apiKey = 'AIzaSyDwiu4pQnevu-csf4FHnMsC3NifHPnGZsg'

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
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`;

    $.get(url, function(data) {
      // Handle API response
      if (data.status === 'OK') {
        // If there are no results, display a message
        if (data.results.length === 0) {
          suggestionsDiv.innerHTML = '<p>No results found</p>';
        } else {
          displaySuggestions(data.results, suggestionsDiv, inputElement);
        }
      } else {
        suggestionsDiv.innerHTML = `<p>Error: ${data.status}</p>`;
      }
    }).fail(function() {
      // Handle request failures (e.g., no network)
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



// Event listener for form submission
document.getElementById('myForm').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent the default form submission (page reload)

    // Get the form data
    const source = document.getElementById('source').value;
    const destination = document.getElementById('destination').value;

    // Send the data to the backend for processing
    fetch('http://localhost:5000/process-addresses', {
        method: 'POST', // HTTP POST method
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ source, destination })
    })
    .then(response => response.json()) // Parse the JSON response
    .then(data => {
        // Handle the coordinates response
        console.log('Coordinates:', data);
        if (data.status === 'OK') {
            const sourceLat = data.source.latitude;
            const sourceLng = data.source.longitude;
            const destLat = data.destination.latitude;
            const destLng = data.destination.longitude;
            const responseContainer = document.getElementById('response-container');

            // Show coordinates on the page (you can update this part with your preferred UI)
            responseContainer.innerHTML = `
                <h3>Coordinates Extracted:</h3>
                <p><strong>Source Latitude:</strong> ${sourceLat}</p>
                <p><strong>Source Longitude:</strong> ${sourceLng}</p>
                <p><strong>Destination Latitude:</strong> ${destLat}</p>
                <p><strong>Destination Longitude:</strong> ${destLng}</p>
            `;
        } else {
            const responseContainer = document.getElementById('response-container');
            responseContainer.innerHTML = `<p>Error fetching data from the server</p>`;
        }
    })
    .catch(error => {
        console.error('Error:', error); // Handle errors
    });
  });
  
  
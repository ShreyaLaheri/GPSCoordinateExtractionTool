from flask import Flask, request, jsonify
import requests
from flask_cors import CORS

app = Flask(__name__)

#Enable CORS
CORS(app)

api_key = 'AIzaSyDwiu4pQnevu-csf4FHnMsC3NifHPnGZsg'

# Function to get latitude and longitude using the Geocoding API
def get_lat_lng(address):
    # Send a request to Google Geocoding API
    url = f'https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={api_key}'
    response = requests.get(url)
    data = response.json()

    if data['status'] == 'OK':
        # Extract latitude and longitude from the response
        lat = data['results'][0]['geometry']['location']['lat']
        lng = data['results'][0]['geometry']['location']['lng']
        return lat, lng
    else:
        return None, None

# Route to process the source and destination
@app.route('/process-addresses', methods=['POST'])
def process_addresses():
    data = request.get_json()
    source = data.get('source')
    destination = data.get('destination')

    # Get coordinates for the source address
    source_lat, source_lng = get_lat_lng(source)
    destination_lat, destination_lng = get_lat_lng(destination)

    if source_lat is None or destination_lat is None:
        return jsonify({'status': 'ERROR', 'message': 'Could not find one or both addresses.'})

    return jsonify({
        'status': 'OK',
        'source': {
            'latitude': source_lat,
            'longitude': source_lng
        },
        'destination': {
            'latitude': destination_lat,
            'longitude': destination_lng
        }
    })

if __name__ == '__main__':
    app.run(debug=True)

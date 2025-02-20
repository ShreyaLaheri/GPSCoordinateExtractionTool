from flask import Flask, request, jsonify
import requests
from flask_cors import CORS
import pandas as pd
import os
from datetime import datetime
from dotenv import load_dotenv 

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

#Enable CORS
CORS(app)

api_key = os.getenv('GOOGLE_MAPS_API_KEY')

UPLOAD_FOLDER = "coordinates_data"
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Route to send API key to frontend
@app.route('/get-api-key', methods=['GET'])
def get_api_key():
    return jsonify({'apiKey': api_key})

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

# Function to calculate intermediate points
def get_intermediate_points(source_lat, source_lng, dest_lat, dest_lng, num_points=10):
    points = []
    for i in range(1, num_points + 1):
        fraction = i / (num_points + 1)
        lat = source_lat + (dest_lat - source_lat) * fraction
        lng = source_lng + (dest_lng - source_lng) * fraction
        points.append({'latitude': lat, 'longitude': lng})
    return points

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

    # Get intermediate points
    intermediate_points = get_intermediate_points(source_lat, source_lng, destination_lat, destination_lng)

    # Create DataFrame for CSV
    data_list = [
        {"Type": "Source", "Latitude": source_lat, "Longitude": source_lng},
        {"Type": "Destination", "Latitude": destination_lat, "Longitude": destination_lng},
    ]
    for idx, point in enumerate(intermediate_points, start=1):
        data_list.append({"Type": f"Waypoint {idx}", "Latitude": point['latitude'], "Longitude": point['longitude']})

    df = pd.DataFrame(data_list)

    # Generate unique filename
    filename = f"coordinates_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    file_path = os.path.join(UPLOAD_FOLDER, filename)

    # Save CSV file
    df.to_csv(file_path, index=False)

    return jsonify({
        'status': 'OK',
        'source': {
            'latitude': source_lat,
            'longitude': source_lng
        },
        'destination': {
            'latitude': destination_lat,
            'longitude': destination_lng
        },
        'intermediate_points': intermediate_points
    })

if __name__ == '__main__':
    app.run(debug=True)

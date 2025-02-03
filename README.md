# Tool to Extract 10 GPS Coordinates from Google Maps

## Objective:
Create a tool to extract 10 GPS coordinates from Google Maps between a given source and destination.

## Steps to Achieve the Goal:

### 1. Front-End Requirements:
- The front-end of the tool should consist of:
  - **Input Fields** for:
    - Source (Starting Point)
    - Destination (End Point)
  - A **Button** labeled: “Extract GPS Coordinates”

### 2. Backend Integration:
- Use **Google Maps Services** in the language of your choice (e.g., Python, JavaScript).
- Make use of the following Google APIs:
  - **Geocoding API** to convert the source and destination addresses into geographic coordinates (LAT, LONG).
  - Additional APIs like **Directions API** and **Distance Matrix API** to extract multiple intermediate coordinates.
  
### 3. Output Format:
- The extracted GPS coordinates (LAT, LONG) should be displayed in a **human-readable format**.
- The format should clearly specify **LAT** and **LONG** for each coordinate.
  - Example:
    - `Point 1: LAT: 12.345678, LONG: 98.765432`
    - `Point 2: LAT: 12.346789, LONG: 98.764321`
  
### 4. Saving the Data:
- The extracted GPS coordinates should be stored in a **spreadsheet** (e.g., `.csv` or `.xlsx`).
- The file should be saved under the **Documents folder** on the PC.

---

## Technologies to Use:
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Python (Flask/Django), JavaScript (Node.js), or any server-side language with access to Google APIs.
- **Google APIs**: Geocoding API, Directions API, Distance Matrix API.
- **Spreadsheet Library**: Python `openpyxl` (for `.xlsx`) or `csv` module for CSV output.

---

## Additional Notes:
- Ensure proper handling of the Google Maps API keys to avoid exceeding usage limits.
- Consider error handling for invalid addresses or connectivity issues.

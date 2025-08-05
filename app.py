# app.py
# Flask backend server for the LiveGym dashboard.
# Serves index.html and static files, and provides /count and /members endpoints.
#
# Make sure livegym.db exists in the same folder and contains the expected tables.
#
# To run this server:
# 1. Open a terminal in the project root (where this file is located)
# 2. Run:  python app.py
# 3. Visit: http://127.0.0.1:5000/ in a web browser to access the dashboard

from flask import Flask, jsonify, send_from_directory, request
import os

app = Flask(__name__, static_folder='static')

# Mock data (replace with BLE/DB later)
MOCK_OCCUPANCY = 4
MOCK_MEMBERS = {
    "valid_members": ["Evan", "Genevieve", "Mathew"],
    "non_members": ["Saiman"]
}

# Serve index.html
@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

# Serve static files (CSS, JS)
@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

# Occupancy endpoint
@app.route('/count')
def count():
    return jsonify({"occupancy": MOCK_OCCUPANCY})

# Member list endpoint
@app.route('/members')
def members():
    return jsonify(MOCK_MEMBERS)

if __name__ == '__main__':
    app.run(debug=True)
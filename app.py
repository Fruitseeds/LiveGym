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
import os, sqlite, time

from ble.config import DB_PATH

app = Flask(__name__, static_folder='static')


# Serve index.html
@app.route('/')
def index():
	return send_from_directory('.', 'index.html')

@app.route('/static/<path:filename>')
def static_files(filename):
	return send_from_directory('static', filename

@app.route('/count')
def count():
	with get_db() as con:
		cutoff = time.time() - 300  # 5-minute presence window
		cur = con.execute("SELECT COUNT(*) FROM presence WHERE last_seen > ?", (cutoff,))
		occ, = cur.fetchone()
	return jsonify({"occupancy": occ})

@app.route('/members')
def members():
	with get_db() as con:
		cutoff = time.time() - 300
		rows = con.execute(

#           SELECT p.hash, m.name
#           FROM presence p
#           LEFT JOIN members m ON p.hash = m.hash
#           WHERE p.last_seen > ?

			,(cutoff,),
		)
		valid, non = [], []
		for h, name in rows:
			(valid if name else non).append(name or h[:8])  # show first 8 chars for unknown
	return jsonify({"valid_members": valid, "non_members": non})

if __name__ == '__main__':
    app.run(debug=True)

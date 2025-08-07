from pathlib import Path
from flask import Flask, jsonify, send_from_directory
import sqlite3, time

from ble.config import DB_PATH   # same salt / DB path the listener uses

app = Flask(__name__, static_folder="static")

# ----------------------------------------------------------------------
# helpers
# ----------------------------------------------------------------------
def get_db() -> sqlite3.Connection:
    """Open a short-lived read/write connection to livegym.db"""
    return sqlite3.connect(DB_PATH)

# ----------------------------------------------------------------------
# routes
# ----------------------------------------------------------------------
@app.route("/")
def index():
    return send_from_directory(".", "index.html")


@app.route("/static/<path:filename>")
def static_files(filename):
    return send_from_directory("static", filename)


@app.route("/count")
def count():
    cutoff = time.time() - 300          # 5-min rolling presence window
    with get_db() as con:
        occ, = con.execute(
            "SELECT COUNT(*) FROM presence WHERE last_seen > ?",
            (cutoff,),
        ).fetchone()
    return jsonify({"occupancy": occ})


@app.route("/members")
def members():
    cutoff = time.time() - 300
    with get_db() as con:
        rows = con.execute(
            """
            SELECT p.hash, m.name
            FROM presence p
            LEFT JOIN members m ON p.hash = m.hash
            WHERE p.last_seen > ?
            """,
            (cutoff,),
        )
        valid, non = [], []
        for h, name in rows:
            (valid if name else non).append(name or h[:8])
    return jsonify({"valid_members": valid, "non_members": non})


# ----------------------------------------------------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

from pathlib import Path
from flask import Flask, jsonify, request, send_from_directory
import sqlite3, time

from ble.config import DB_PATH  # same DB used by the listener

app = Flask(__name__, static_folder="static")


# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------
def get_db() -> sqlite3.Connection:
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    return con


# ---------------------------------------------------------------------------
# routes
# ---------------------------------------------------------------------------
@app.route("/")
def index():
    return send_from_directory(".", "index.html")


@app.route("/static/<path:filename>")
def static_files(filename):
    return send_from_directory("static", filename)


@app.route("/count")
def count():
    cutoff = time.time() - 300  # 5‑min rolling window
    with get_db() as con:
        occ, = con.execute(
            "SELECT COUNT(*) FROM presence WHERE last_seen > ?", (cutoff,)
        ).fetchone()
    return jsonify({"occupancy": occ})


@app.route("/members")
def members():
    """Return currently‑present devices grouped by membership."""
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
        ).fetchall()

    valid, non = [], []
    for r in rows:
        rec = {"hash": r["hash"], "name": r["name"]}
        (valid if r["name"] else non).append(rec)

    return jsonify({"valid_members": valid, "non_members": non})


# ------------------------- admin / membership ------------------------------
@app.route("/register/<hash_id>", methods=["POST", "GET"])
def register(hash_id):
    """Promote a device hash to *member*. Provide ?name= query parm if desired."""
    name = request.args.get("name", "Member")
    with get_db() as con:
        con.execute(
            "INSERT OR REPLACE INTO members(hash, name) VALUES (?, ?)", (hash_id, name)
        )
        con.commit()
    return jsonify({"status": "registered", "hash": hash_id, "name": name})


@app.route("/remove/<hash_id>", methods=["POST", "GET"])
def remove(hash_id):
    with get_db() as con:
        con.execute("DELETE FROM members WHERE hash = ?", (hash_id,))
        con.commit()
    return jsonify({"status": "removed", "hash": hash_id})


@app.route("/block/<hash_id>", methods=["POST", "GET"])
def block(hash_id):
    with get_db() as con:
        con.execute("INSERT OR IGNORE INTO blocked(hash) VALUES (?)", (hash_id,))
        con.commit()
    return jsonify({"status": "blocked", "hash": hash_id})


@app.route("/unblock/<hash_id>", methods=["POST", "GET"])
def unblock(hash_id):
    with get_db() as con:
        con.execute("DELETE FROM blocked WHERE hash = ?", (hash_id,))
        con.commit()
    return jsonify({"status": "unblocked", "hash": hash_id})


@app.route("/selfcheck/<hash_id>", methods=["POST", "GET"])
def selfcheck(hash_id):
    """Allow a user to rescue a missed check‑in by updating their presence."""
    with get_db() as con:
        con.execute(
            "INSERT OR REPLACE INTO presence(hash, last_seen) VALUES (?, ?)",
            (hash_id, time.time()),
        )
        con.commit()
    return jsonify({"status": "self_checked", "hash": hash_id})


@app.route("/alerts")
def alerts():
    with get_db() as con:
        rows = con.execute(
            "SELECT hash, first_seen, rssi FROM alerts ORDER BY first_seen DESC"
        ).fetchall()
    return jsonify([dict(r) for r in rows])


# ---------------------------------------------------------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

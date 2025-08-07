import asyncio, hashlib, signal, time, sqlite3, sys, os
from bleak import BleakScanner
from datetime import datetime, timedelta
from ble.config import SECRET_SALT, DB_PATH
from ble import mock_ble
WINDOW = 30              
PRESENT_TTL = 300        

# ---------- SQLite helpers -------------------------------------------------
schema = """
CREATE TABLE IF NOT EXISTS presence (
    hash TEXT PRIMARY KEY,
    last_seen REAL
);
CREATE TABLE IF NOT EXISTS members (
    hash TEXT PRIMARY KEY,
    name TEXT
);
"""
con = sqlite3.connect(DB_PATH)
con.executescript(schema)
con.commit()

def upsert_presence(dev_hash: str):
	con.execute(
		"INSERT OR REPLACE INTO presence(hash, last_seen) VALUES (?, ?)",
		(dev_hash, time.time()),
	)
	con.commit()

def purge_expired():
	threshold = time.time() - PRESENT_TTL
	con.execute("DELETE FROM presence WHERE last_seen < ?", (threshold,))
	con.commit()

# ---------- BLE aggregation -------------------------------------------------
class Window:
	def __init__(self, dur: int): self.dur, self.t0 = dur, time.time()
	def expired(self): return time.time() - self.t0 >= self.dur
	def reset(self): self.t0 = time.time()

async def main():
	w = Window(WINDOW)

	def handle(dev, data):
		mac = dev.address
		hid = hashlib.sha256(mac.encode() + SECRET_SALT).hexdigest()
		upsert_presence(hid)

	if os.getenv("MOCK_BLE"):
		print("[BLE] Mock scan active ... Ctrl-C to quit")
		await mock_ble.pump(handle)               # runs forever
	else:
		print("[BLE] passive scan … Ctrl-C to quit")
		async with BleakScanner(handle, scanning_mode="passive"):
			try:
				while True:
					await asyncio.sleep(1)
					if w.expired():
						purge_expired()
						w.reset()
			except asyncio.CancelledError:
				pass

if __name__ == "__main__":
	loop = asyncio.new_event_loop(); asyncio.set_event_loop(loop)
	for sig in (signal.SIGINT, signal.SIGTERM):
		loop.add_signal_handler(sig, lambda s=sig: loop.stop())
	try:
		loop.run_until_complete(main())
	except RuntimeError as e:
		if str(e) != "Event loop stopped before Future completed.":
			raise

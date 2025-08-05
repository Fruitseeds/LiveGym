# listener.py
# This script passively listens for BLE advertisements,
# hashes each detected MAC address with a secret salt (from config.py),
# and inserts the hashed value with a timestamp into the 'detections' table
# in the shared SQLite database (livegym.db).
#
# Run this continuously on the Raspberry Pi to feed live data to the dashboard.

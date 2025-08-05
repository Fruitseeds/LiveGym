# insert_sample_members.py
# This script adds known authorized BLE device MAC addresses to the 'members' table
# in livegym.db, after hashing each one with the shared secret salt (from config.py).
# Run once during setup to register authorized members.
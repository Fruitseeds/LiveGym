# ble/config.py
from pathlib import Path
import os

# One-time 128-bit salt used for hashing MAC → anonymous ID
SECRET_SALT: bytes = bytes.fromhex(
    os.getenv("LIVEGYM_SALT", "c5579c911ae44c46bf0aab5a1270c97d")
)

# Location of the SQLite file (project root)
DB_PATH = Path(__file__).resolve().parent.parent / "livegym.db"

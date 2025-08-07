# ble/mock_ble.py
import asyncio, random, sqlite3, hashlib
from types import SimpleNamespace as SN

from ble.config import DB_PATH, SECRET_SALT   # DB location & salt

# ─────────────────────────────────────────────────────────────────────────────
# 1. Ensure Jonathan is always a registered member
JON_MAC  = "AA:BB:CC:DD:EE:01"                         # constant mock MAC
JON_HASH = hashlib.sha256(JON_MAC.encode() + SECRET_SALT).hexdigest()

with sqlite3.connect(DB_PATH) as _con:
    _con.execute(
        "INSERT OR IGNORE INTO members(hash, name) VALUES (?, ?)",
        (JON_HASH, "Jonathan"),
    )
    _con.commit()

# ─────────────────────────────────────────────────────────────────────────────
def _random_mac() -> str:
    return ":".join(f"{random.randint(0,255):02X}" for _ in range(6))


async def pump(callback, interval: float = 0.2):
    """
    Call *callback(device, adv_data)* every *interval* seconds.
    Emits Jonathan on every cycle plus three random strangers.
    """
    strangers = [_random_mac() for _ in range(50)]  # reusable pool

    while True:
        # Jonathan – valid member
        jon_dev  = SN(address=JON_MAC)
        jon_data = SN(rssi=-45, _data={"hci_channel": 37})
        callback(jon_dev, jon_data)

        # Three random non-members
        for mac in random.sample(strangers, k=3):
            dev  = SN(address=mac)
            data = SN(rssi=random.randint(-90, -50), _data={"hci_channel": 37})
            callback(dev, data)

        await asyncio.sleep(interval)

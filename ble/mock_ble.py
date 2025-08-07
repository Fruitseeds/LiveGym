import asyncio, os, random, types

def random_mac() -> str:
	return ":".join(f"{random.randint(0,255):02X}" for _ in range(6))

async def pump(callback, interval=0.2):
	"""Call *callback(device, adv_data)* every *interval* seconds."""
	from types import SimpleNamespace as SN
	while True:
		dev = SN(address=random_mac())
		data = SN(rssi=random.randint(-90, -30), _data={"hci_channel":37})
		callback(dev, data)
		await asyncio.sleep(interval)

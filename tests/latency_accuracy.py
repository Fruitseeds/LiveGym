import time, statistics, sys, sqlite3, requests
from ble.config import DB_PATH


def p99(values):
    return sorted(values)[int(len(values) * 0.99) - 1]


def main(host: str):
    latencies = []

    for _ in range(100):
        t0 = time.time()
        requests.get(f"{host}/count").json()
        latencies.append(time.time() - t0)

    for _ in range(100):
        t0 = time.time()
        requests.get(f"{host}/members").json()
        latencies.append(time.time() - t0)

    avg = statistics.mean(latencies) * 1000
    p99_latency = p99(latencies) * 1000

    # classification accuracy -------------------------------------------------
    db = sqlite3.connect(DB_PATH)
    true_members = {h for (h,) in db.execute("SELECT hash FROM members")}
    pres_rows = db.execute("SELECT hash FROM presence").fetchall()
    present = [r[0] for r in pres_rows]

    api_resp = requests.get(f"{host}/members").json()
    classified = {}
    for d in api_resp["valid_members"]:
        classified[d["hash"]] = True
    for d in api_resp["non_members"]:
        classified[d["hash"]] = False

    correct = 0
    for h in present:
        correct += classified.get(h, False) == (h in true_members)
    accuracy = 100.0 * correct / len(present) if present else 100.0

    print(f"Avg latency : {avg:.2f} ms")
    print(f"P99 latency : {p99_latency:.2f} ms")
    print(f"Accuracy    : {accuracy:.2f} %")


if __name__ == "__main__":
    host = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5000"
    main(host)

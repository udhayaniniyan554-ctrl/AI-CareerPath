import subprocess
import time
import json
import urllib.request
import urllib.error

# Launch Chrome headless with debugging port
cmd = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    "--headless=new",
    "--remote-debugging-port=9222",
    "--disable-gpu",
    "http://127.0.0.1:8000"
]
proc = subprocess.Popen(cmd)
time.sleep(2)

try:
    req = urllib.request.Request("http://127.0.0.1:9222/json")
    with urllib.request.urlopen(req) as resp:
        tabs = json.loads(resp.read().decode())
        print("Chrome tabs:", json.dumps(tabs, indent=2))
finally:
    proc.terminate()

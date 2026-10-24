# fix.py
import subprocess
from sniffer import devices, lock

def fix_vulnerabilities():
    """Block suspicious destinations via iptables"""
    blocked = []
    with lock:
        for dev in devices:
            if dev["suspicious"] and not dev["blocked"]:
                ip = dev["destinationIp"]
                try:
                    subprocess.run(
                        ["iptables", "-A", "OUTPUT", "-d", ip, "-j", "DROP"],
                        check=True
                    )
                    dev["blocked"] = True
                    blocked.append(ip)
                except Exception as e:
                    print(f"Failed to block {ip}: {e}")
    return blocked



# mydevice/system_info.py
import platform
import psutil
import socket
import datetime
import subprocess
import os

def run_cmd(cmd: str):
    """Run a shell command and return its output."""
    try:
        return subprocess.check_output(cmd, shell=True, text=True).strip()
    except Exception:
        return "N/A"

def get_gpu_info():
    """Detect GPU(s) if available (NVIDIA or AMD)"""
    gpus = []
    nvidia = run_cmd("nvidia-smi --query-gpu=name,memory.total --format=csv,noheader")
    if nvidia != "N/A":
        for line in nvidia.splitlines():
            name, memory = line.split(",")
            gpus.append({"name": name.strip(), "memory": memory.strip()})
    else:
        amd = run_cmd("lspci | grep -i 'vga' | grep -i 'amd'")
        if amd != "N/A":
            gpus.append({"name": amd.strip(), "memory": "N/A"})
    return gpus or [{"name": "None detected", "memory": "N/A"}]

def get_battery_info():
    battery = psutil.sensors_battery()
    if battery:
        return {
            "percent": battery.percent,
            "plugged_in": battery.power_plugged,
            "time_left": str(datetime.timedelta(seconds=int(battery.secsleft)))
        }
    return {"percent": "N/A", "plugged_in": "N/A", "time_left": "N/A"}

def get_system_info():
    # ---------------- OS Info ----------------
    os_name = platform.system()
    os_version = platform.version()
    kernel = platform.release()
    hostname = socket.gethostname()
    uptime_seconds = (datetime.datetime.now() - datetime.datetime.fromtimestamp(psutil.boot_time())).total_seconds()
    uptime = str(datetime.timedelta(seconds=int(uptime_seconds)))

    # ---------------- CPU Info ----------------
    cpu = {
        "model": run_cmd("lscpu | grep 'Model name' | awk -F: '{print $2}'").strip() or platform.processor(),
        "cores": psutil.cpu_count(logical=False),
        "threads": psutil.cpu_count(logical=True),
        "usage": int(psutil.cpu_percent(interval=1)),
        "frequency": f"{psutil.cpu_freq().current:.2f} MHz" if psutil.cpu_freq() else "N/A"
    }

    # ---------------- Memory Info ----------------
    mem = psutil.virtual_memory()
    memory = {
        "total": f"{round(mem.total / (1024**3), 2)} GB",
        "used": f"{round(mem.used / (1024**3), 2)} GB",
        "available": f"{round(mem.available / (1024**3), 2)} GB",
        "usage": int(mem.percent)
    }

    # ---------------- Disk Info ----------------
    disks = []
    for part in psutil.disk_partitions(all=False):
        usage = psutil.disk_usage(part.mountpoint)
        disks.append({
            "mountpoint": part.mountpoint,
            "fstype": part.fstype,
            "total": f"{round(usage.total / (1024**3), 2)} GB",
            "used": f"{round(usage.used / (1024**3), 2)} GB",
            "usage": int(usage.percent)
        })

    # ---------------- Network Info ----------------
    interfaces = []
    for iface_name, iface_addrs in psutil.net_if_addrs().items():
        ip = ''
        mac = ''
        for addr in iface_addrs:
            if addr.family.name == 'AF_INET':
                ip = addr.address
            if addr.family.name == 'AF_LINK':
                mac = addr.address
        iface_type = "wireless" if "wlan" in iface_name.lower() or "wifi" in iface_name.lower() else "ethernet"
        interfaces.append({
            "name": iface_name,
            "type": iface_type,
            "status": "up" if psutil.net_if_stats()[iface_name].isup else "down",
            "ip": ip,
            "mac": mac
        })
    active_connections = len(psutil.net_connections())

    # ---------------- Processes Info ----------------
    processes = [{"pid": p.pid, "name": p.name(), "status": p.status()} for p in psutil.process_iter(['pid', 'name', 'status'])][:10]  # top 10 for summary

    # ---------------- GPU & Battery ----------------
    gpus = get_gpu_info()
    battery = get_battery_info()

    # ---------------- Return All Info ----------------
    return {
        "os": os_name,
        "version": os_version,
        "kernel": kernel,
        "hostname": hostname,
        "uptime": uptime,
        "cpu": cpu,
        "memory": memory,
        "disks": disks,
        "network": {
            "interfaces": interfaces,
            "activeConnections": active_connections
        },
        "gpu": gpus,
        "battery": battery,
        "top_processes": processes
    }


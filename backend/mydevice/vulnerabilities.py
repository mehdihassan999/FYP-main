


# mydevice/vulnerabilities.py
"""
Detect common vulnerabilities on Linux (and safe Windows checks where available).

Returns a list of dicts with keys:
- id, title, category, severity, description, impact, suggestion, fixable, status, port, service
"""

import platform
import subprocess
import shlex
import psutil
import socket
from typing import List, Dict, Any


def _run_cmd(cmd: str, timeout: int = 5) -> str:
    """
    Run shell command safely and return stdout (decoded).
    Returns empty string on error.
    """
    try:
        completed = subprocess.run(cmd, shell=True, check=True,
                                   stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, timeout=timeout)
        return completed.stdout.decode(errors="ignore").strip()
    except Exception:
        return ""


# -------------------- Individual checks -------------------- #

def check_os_updates() -> List[Dict[str, Any]]:
    """
    Detect pending OS updates (Debian/Ubuntu apt-based systems).
    """
    issues = []
    system = platform.system()
    if system == "Linux":
        out = _run_cmd("apt list --upgradable 2>/dev/null | tail -n +2")
        if out:
            issues.append({
                "id": "os_update",
                "title": "Pending OS Updates",
                "category": "os",
                "severity": "high",
                "description": "There are packages available for upgrade on this system.",
                "impact": "Outdated packages may contain known CVEs that attackers can exploit.",
                "suggestion": "Run: sudo apt update && sudo apt upgrade -y",
                "fixable": True,
                "status": "open"
            })
    elif system == "Windows":
        # Windows detection best-effort; requires PS modules which may not exist
        out = _run_cmd('powershell -Command "Get-WindowsUpdate -AcceptAll -Verbose | Out-String"')
        if out:
            issues.append({
                "id": "os_update",
                "title": "Pending OS Updates",
                "category": "os",
                "severity": "high",
                "description": "There are pending Windows updates.",
                "impact": "Missing security patches can expose known vulnerabilities.",
                "suggestion": "Use Windows Update to install patches.",
                "fixable": False,  # usually manual / user consent
                "status": "open"
            })
    return issues


def check_firewall() -> List[Dict[str, Any]]:
    """
    Check UFW (Ubuntu) or fallbacks for firewall status.
    """
    issues = []
    system = platform.system()
    if system == "Linux":
        out = _run_cmd("ufw status")
        if not out:
            # ufw may not be installed; try nftables/iptables as heuristic
            nft_out = _run_cmd("nft list ruleset")
            ipt_out = _run_cmd("sudo iptables -L -n")
            # If nft/iptables show no rules (or command missing), still return nothing
            # We only report firewall_disabled if ufw explicitly says inactive
            return issues

        # Evaluate known outputs
        if "inactive" in out.lower() or "status: inactive" in out.lower():
            issues.append({
                "id": "firewall_disabled",
                "title": "Firewall Disabled",
                "category": "firewall",
                "severity": "critical",
                "description": "The Uncomplicated Firewall (UFW) reports it is inactive.",
                "impact": "Without a firewall, exposed services can be reached from external networks.",
                "suggestion": "Run: sudo ufw enable (or configure firewall rules appropriately)",
                "fixable": True,
                "status": "open"
            })
    elif system == "Windows":
        out = _run_cmd("netsh advfirewall show allprofiles")
        if out and ("State OFF" in out or "OFF" in out):
            issues.append({
                "id": "firewall_disabled",
                "title": "Firewall Disabled",
                "category": "firewall",
                "severity": "critical",
                "description": "Windows Firewall reports disabled state for one or more profiles.",
                "impact": "Exposed to network attack without profile protection.",
                "suggestion": "Enable Windows Firewall via Windows Security or netsh.",
                "fixable": True,
                "status": "open"
            })
    return issues


def check_open_ports() -> List[Dict[str, Any]]:
    """
    Enumerate listening TCP ports and produce vulnerability entries.
    Includes some common port/service mappings and tailored descriptions.
    """
    issues = []
    try:
        conns = psutil.net_connections(kind="inet")
    except Exception:
        conns = []

    # collect listening ports -> map to service names
    open_ports = {}
    for c in conns:
        try:
            if c.status == psutil.CONN_LISTEN and c.laddr:
                port = c.laddr.port
                # deduplicate
                open_ports.setdefault(port, []).append({
                    "pid": c.pid,
                    "family": c.family.name if hasattr(c.family, "name") else str(c.family)
                })
        except Exception:
            continue

    # Known port descriptions
    port_info = {
        22: ("SSH", "high", "Remote SSH access is enabled. Ensure only trusted accounts can connect."),
        3389: ("RDP", "high", "Remote Desktop/Terminal services are open; restrict or use VPN."),
        139: ("SMB", "high", "SMB/CIFS (netbios) is open — can enable lateral movement if exposed."),
        445: ("SMB", "high", "SMB/CIFS is open — patch and restrict remote access."),
        80: ("HTTP", "medium", "HTTP web server is running; ensure web apps are patched."),
        443: ("HTTPS", "medium", "HTTPS is running; verify TLS configuration and certs."),
        21: ("FTP", "high", "FTP transmits credentials in cleartext; prefer SFTP/FTPS."),
        23: ("Telnet", "high", "Telnet is insecure (plaintext credentials)."),
        8080: ("HTTP-alt", "medium", "Alternate HTTP port — check app security."),
        5000: ("Dev/HTTP", "low", "Common dev server port (Flask, etc.). Not recommended on public interfaces."),
        3195: ("Push/Custom", "low", "Unrecognized/Custom service — inspect service binary")
    }

    for port, svcs in open_ports.items():
        name, sev, desc = port_info.get(port, ("Unknown", "low", "Unknown service is running on this port"))
        # Attempt to identify process name for more context (best-effort)
        proc_name = None
        try:
            pids = {entry["pid"] for entry in svcs if entry["pid"]}
            if pids:
                pid = next(iter(pids))
                if pid:
                    proc = psutil.Process(pid)
                    proc_name = proc.name()
        except Exception:
            proc_name = None

        issues.append({
            "id": f"open_port_{port}",
            "title": f"Open Port {port} ({name})",
            "category": "network",
            "severity": sev,
            "description": desc,
            "impact": f"Service listening on port {port}{(' (' + proc_name + ')' ) if proc_name else ''}.",
            "suggestion": f"Identify service and disable if unused. Example: sudo lsof -i :{port} ; sudo systemctl stop <service>",
            "fixable": False,
            "status": "open",
            "port": port,
            "service": proc_name
        })

    return issues


def check_weak_passwords() -> List[Dict[str, Any]]:
    """
    Detect accounts with empty password fields in /etc/shadow (Linux).
    This is a heuristic and requires read access to /etc/shadow (root).
    """
    issues = []
    if platform.system() != "Linux":
        return issues

    try:
        out = _run_cmd("awk -F: '($2==\"\" ) {print $1}' /etc/shadow")
        if out:
            # we found accounts with empty password entry
            accounts = out.splitlines()
            issues.append({
                "id": "weak_password",
                "title": "Empty/Weak Passwords Detected",
                "category": "os",
                "severity": "high",
                "description": "One or more system accounts have empty password fields or easily-detectable weak entries.",
                "impact": "Accounts without strong passwords are easily compromised.",
                "suggestion": "Review listed accounts and set strong passwords: sudo passwd <username>",
                "fixable": False,
                "status": "open",
                "accounts": accounts
            })
    except Exception:
        # if we cannot read /etc/shadow, skip (no elevated privileges)
        pass

    return issues


def check_rdp_enabled_linux() -> List[Dict[str, Any]]:
    """
    Check for remote desktop packages commonly used on Linux (xrdp) and whether active.
    """
    issues = []
    if platform.system() != "Linux":
        return issues

    out = _run_cmd("systemctl is-active xrdp || true")
    if out.strip() == "active":
        issues.append({
            "id": "rdp_enabled",
            "title": "Remote Desktop (xrdp) Running",
            "category": "network",
            "severity": "high",
            "description": "xrdp remote desktop server is running and accepting connections.",
            "impact": "Remote access may be abused if credentials are weak or service misconfigured.",
            "suggestion": "If not needed, stop and disable: sudo systemctl stop xrdp && sudo systemctl disable xrdp",
            "fixable": True,
            "status": "open",
            "service": "xrdp"
        })
    return issues


def check_smb_linux() -> List[Dict[str, Any]]:
    """
    Detect Samba (smbd) activity on Linux.
    """
    issues = []
    if platform.system() != "Linux":
        return issues

    out = _run_cmd("systemctl is-active smbd || true")
    if out.strip() == "active":
        issues.append({
            "id": "smb_running",
            "title": "Samba (SMB) Service Running",
            "category": "network",
            "severity": "high",
            "description": "smbd service is active and listening (SMB file sharing).",
            "impact": "SMB service can expose file shares to the network and enable lateral movement.",
            "suggestion": "If not required, stop and disable: sudo systemctl stop smbd && sudo systemctl disable smbd",
            "fixable": True,
            "status": "open",
            "service": "smbd"
        })
    return issues


def check_antivirus_status_linux() -> List[Dict[str, Any]]:
    """
    Best-effort detection for presence of popular AV/endpoint tools (Linux).
    Many Linux systems don't have a central AV; we check for packages/processes.
    """
    issues = []
    if platform.system() != "Linux":
        return issues

    # Check for common AV processes (clamav, sophos, etc.)
    found = []
    try:
        for name in ("clamd", "freshclam", "sophos", "sav-protectd", "mcafee"):
            if _run_cmd(f"pgrep -f {shlex.quote(name)}"):
                found.append(name)
    except Exception:
        pass

    if not found:
        issues.append({
            "id": "antivirus_absent",
            "title": "No Antivirus/Endpoint Detected",
            "category": "software",
            "severity": "medium",
            "description": "No common antivirus/endpoint process was detected running.",
            "impact": "Lack of endpoint protection may allow malware to persist undetected.",
            "suggestion": "Consider installing an appropriate endpoint security product for Linux.",
            "fixable": False,
            "status": "open"
        })
    # if found, we do not list as issue
    return issues


def check_vulnerable_services_linux() -> List[Dict[str, Any]]:
    """
    Detect specific known services that are often vulnerable (vsftpd, ftp, apache, nginx).
    """
    issues = []
    if platform.system() != "Linux":
        return issues

    # check vsftpd (FTP)
    out = _run_cmd("systemctl is-active vsftpd || true")
    if out.strip() == "active":
        issues.append({
            "id": "ftp_service",
            "title": "FTP Service (vsftpd) Running",
            "category": "software",
            "severity": "medium",
            "description": "vsftpd FTP daemon is active.",
            "impact": "FTP may transmit credentials in plaintext and expose anonymous upload points.",
            "suggestion": "Stop if unused: sudo systemctl stop vsftpd && sudo systemctl disable vsftpd",
            "fixable": True,
            "status": "open",
            "service": "vsftpd"
        })

    # check web servers
    for websvc in ("apache2", "nginx"):
        out = _run_cmd(f"systemctl is-active {websvc} || true")
        if out.strip() == "active":
            issues.append({
                "id": f"web_service_{websvc}",
                "title": f"Web Server Running ({websvc})",
                "category": "software",
                "severity": "medium",
                "description": f"{websvc} is active and serving HTTP(S).",
                "impact": "Web services expose application attack surface; ensure apps & server are patched.",
                "suggestion": f"Inspect running web apps and disable service if unused: sudo systemctl stop {websvc}",
                "fixable": True,
                "status": "open",
                "service": websvc
            })

    return issues


# -------------------- Aggregate detection -------------------- #

def get_vulnerabilities() -> List[Dict[str, Any]]:
    """
    Run all checks and return a list of vulnerability dicts.
    """
    issues = []
    # OS updates
    issues.extend(check_os_updates())
    # Firewall
    issues.extend(check_firewall())
    # Open listening ports
    issues.extend(check_open_ports())
    # Weak passwords (requires /etc/shadow read)
    issues.extend(check_weak_passwords())
    # RDP (linux xrdp)
    issues.extend(check_rdp_enabled_linux())
    # Samba
    issues.extend(check_smb_linux())
    # Antivirus heuristic
    issues.extend(check_antivirus_status_linux())
    # Vulnerable services like ftp, web servers
    issues.extend(check_vulnerable_services_linux())
    return issues


# -------------------- CLI test runner -------------------- #
if __name__ == "__main__":
    import json
    vulns = get_vulnerabilities()
    print(json.dumps(vulns, indent=2))

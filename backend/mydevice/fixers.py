



# mydevice/fixers.py
import platform
import subprocess


def fix_vulnerability(issue_id):
    """
    Attempts to fix a given vulnerability by issue_id.
    For dangerous cases (like open ports), suggests commands instead of auto-killing.
    Returns dict with {"status": bool, "message": str}
    """
    system = platform.system()

    try:
        # -------------------- Firewall --------------------
        if issue_id == "firewall_disabled":
            if system == "Linux":
                try:
                    subprocess.run(["sudo", "ufw", "enable"], check=False)
                    return {"status": True, "message": "Firewall enabled using ufw."}
                except Exception:
                    return {"status": False, "message": "Failed to enable firewall. Try: sudo ufw enable"}

        # -------------------- OS Updates --------------------
        if issue_id == "os_update":
            if system == "Linux":
                try:
                    subprocess.run(["sudo", "apt", "update"], check=True)
                    subprocess.run(["sudo", "apt", "upgrade", "-y"], check=True)
                    return {"status": True, "message": "System updated successfully."}
                except Exception:
                    return {
                        "status": False,
                        "message": "Failed to auto-update. Run manually:\n"
                                   "sudo apt update && sudo apt upgrade -y"
                    }

        # -------------------- Weak/Empty Passwords --------------------
        if issue_id == "weak_password":
            return {
                "status": False,
                "message": "Weak/empty passwords cannot be auto-fixed. Change with:\npasswd <username>"
            }

        # -------------------- Remote Desktop (RDP/VNC) --------------------
        if issue_id == "rdp_enabled":
            if system == "Linux":
                try:
                    subprocess.run(["sudo", "systemctl", "stop", "xrdp"], check=False)
                    subprocess.run(["sudo", "systemctl", "disable", "xrdp"], check=False)
                    subprocess.run(["sudo", "systemctl", "stop", "vncserver"], check=False)
                    subprocess.run(["sudo", "systemctl", "disable", "vncserver"], check=False)
                    return {"status": True, "message": "RDP/VNC services stopped and disabled."}
                except Exception:
                    return {"status": False, "message": "Failed to disable RDP/VNC. Disable manually with systemctl."}

        # -------------------- SMBv1 --------------------
        if issue_id == "smb_v1_enabled":
            return {
                "status": False,
                "message": "SMBv1 requires manual config. Edit /etc/samba/smb.conf and disable SMB1."
            }

        # -------------------- Remote Services (Telnet) --------------------
        if issue_id == "telnet_enabled":
            if system == "Linux":
                try:
                    subprocess.run(["sudo", "systemctl", "stop", "telnet.socket"], check=False)
                    subprocess.run(["sudo", "systemctl", "disable", "telnet.socket"], check=False)
                    subprocess.run(["sudo", "systemctl", "stop", "telnet"], check=False)
                    subprocess.run(["sudo", "systemctl", "disable", "telnet"], check=False)
                    return {"status": True, "message": "Telnet service stopped and disabled."}
                except Exception:
                    return {"status": False, "message": "Failed to stop Telnet. Run manually: sudo systemctl disable telnet"}

        # -------------------- Antivirus --------------------
        if issue_id == "antivirus_disabled":
            return {
                "status": False,
                "message": "No antivirus detected. Install ClamAV:\n"
                           "sudo apt install clamav -y"
            }

        # -------------------- Vulnerable Services (FTP) --------------------
        if issue_id == "ftp_service":
            if system == "Linux":
                try:
                    subprocess.run(["sudo", "systemctl", "stop", "vsftpd"], check=False)
                    subprocess.run(["sudo", "systemctl", "disable", "vsftpd"], check=False)
                    return {"status": True, "message": "FTP service stopped and disabled."}
                except Exception:
                    return {"status": False, "message": "Failed to disable FTP. Run manually: sudo systemctl disable vsftpd"}

        # -------------------- Open Ports --------------------
        if issue_id.startswith("open_port_"):
            try:
                port = issue_id.split("_")[-1]
                # Find process using the port
                proc = subprocess.run(
                    ["sudo", "lsof", "-i", f":{port}"],
                    capture_output=True,
                    text=True
                )
                message = (
                    f"Open port {port} detected.\n\n"
                    f"Process info:\n{proc.stdout or 'No process details found'}\n\n"
                    f"Suggested commands:\n"
                    f"Check process: sudo lsof -i :{port}\n"
                    f"Kill process: sudo kill -9 <PID>\n"
                    f"Block port: sudo ufw deny {port}\n"
                )
                return {"status": False, "message": message}
            except Exception:
                return {
                    "status": False,
                    "message": f"Open port {port} detected but process lookup failed.\n"
                               f"Run manually: sudo lsof -i :{port}"
                }

    except Exception as e:
        return {"status": False, "message": f"Fixer error: {str(e)}"}

    # Default return if no matching fix is found
    return {"status": False, "message": "No automatic fix available for this vulnerability."}

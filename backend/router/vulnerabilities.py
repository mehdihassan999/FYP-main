from typing import Dict, List, Any
from dataclasses import dataclass

@dataclass
class Vulnerability:
    id: str
    title: str
    severity: str
    description: str
    category: str
    risk_level: int
    fixable: bool
    fix_method: str
    manual_fix_guide: str
    detection_method: str

# Define all vulnerabilities CyberX can detect
VULNERABILITIES = {
    "default_credentials": Vulnerability(
        id="vuln_001",
        title="Default Admin Credentials",
        severity="critical",
        description="Router is using factory default username and password",
        category="authentication",
        risk_level=9,
        fixable=True,
        fix_method="auto_change_password",
        manual_fix_guide="Log into router admin panel → Administration → Change password to strong unique password",
        detection_method="credential_check"
    ),
    
    "weak_password": Vulnerability(
        id="vuln_002",
        title="Weak Admin Password",
        severity="high",
        description="Admin password is too short or easily guessable",
        category="authentication",
        risk_level=7,
        fixable=True,
        fix_method="enforce_strong_password",
        manual_fix_guide="Change to password with 12+ characters, mix of upper/lowercase, numbers, symbols",
        detection_method="password_strength_check"
    ),
    
    "weak_encryption": Vulnerability(
        id="vuln_003",
        title="Weak WiFi Encryption",
        severity="high",
        description="Using outdated WEP or TKIP encryption instead of WPA2/WPA3",
        category="wireless",
        risk_level=8,
        fixable=True,
        fix_method="upgrade_encryption",
        manual_fix_guide="Wireless Settings → Security → Change to WPA2-Personal or WPA3",
        detection_method="encryption_check"
    ),
    
    "open_ports": Vulnerability(
        id="vuln_004",
        title="Unnecessary Open Ports",
        severity="medium",
        description="Dangerous ports open (Telnet:23, FTP:21, TR-069:7547)",
        category="network",
        risk_level=6,
        fixable=True,
        fix_method="close_ports",
        manual_fix_guide="Advanced → Firewall → Close ports 23,21,7547,8080",
        detection_method="port_scan"
    ),
    
    "remote_admin": Vulnerability(
        id="vuln_005",
        title="Remote Administration Enabled",
        severity="critical",
        description="Router admin panel accessible from internet",
        category="administration",
        risk_level=9,
        fixable=True,
        fix_method="disable_remote_admin",
        manual_fix_guide="Administration → Remote Management → Disable",
        detection_method="wan_access_check"
    ),
    
    "upnp_enabled": Vulnerability(
        id="vuln_006",
        title="UPnP Enabled Globally",
        severity="medium",
        description="UPnP allows automatic port forwarding without authentication",
        category="network",
        risk_level=5,
        fixable=True,
        fix_method="disable_upnp",
        manual_fix_guide="Advanced → UPnP → Disable UPnP",
        detection_method="upnp_check"
    ),
    
    "outdated_firmware": Vulnerability(
        id="vuln_007",
        title="Outdated Firmware",
        severity="high",
        description="Router running old firmware with known vulnerabilities",
        category="firmware",
        risk_level=8,
        fixable=False,  # Cannot auto-update due to risk of bricking
        fix_method="notify_update",
        manual_fix_guide="Check manufacturer website → Download latest firmware → Administration → Firmware Upgrade",
        detection_method="firmware_check"
    ),
    
    "weak_dns": Vulnerability(
        id="vuln_008",
        title="Insecure DNS Settings",
        severity="medium",
        description="Using ISP DNS or unencrypted DNS servers",
        category="network",
        risk_level=4,
        fixable=True,
        fix_method="set_secure_dns",
        manual_fix_guide="Internet Settings → DNS → Set to 1.1.1.1 or 8.8.8.8",
        detection_method="dns_check"
    ),
    
    "http_only": Vulnerability(
        id="vuln_009",
        title="HTTP Admin Interface",
        severity="medium",
        description="Web admin not using HTTPS",
        category="administration",
        risk_level=5,
        fixable=True,
        fix_method="enable_https",
        manual_fix_guide="Administration → Web Access → Enable HTTPS",
        detection_method="protocol_check"
    ),
    
    "guest_network_no_isolation": Vulnerability(
        id="vuln_010",
        title="Guest Network Without Isolation",
        severity="medium",
        description="Guest network can access main LAN devices",
        category="wireless",
        risk_level=5,
        fixable=True,
        fix_method="enable_guest_isolation",
        manual_fix_guide="Wireless → Guest Network → Enable AP Isolation",
        detection_method="guest_network_check"
    ),
    
    "wps_enabled": Vulnerability(
        id="vuln_011",
        title="WPS Enabled",
        severity="high",
        description="WiFi Protected Setup allows brute force attacks",
        category="wireless",
        risk_level=7,
        fixable=True,
        fix_method="disable_wps",
        manual_fix_guide="Wireless → WPS → Disable WPS",
        detection_method="wps_check"
    ),
    
    "firmware_backdoor": Vulnerability(
        id="vuln_012",
        title="Potential Firmware Backdoor",
        severity="critical",
        description="Known backdoor accounts or hidden services in firmware",
        category="firmware",
        risk_level=10,
        fixable=False,  # Requires vendor patch
        fix_method="manual_update",
        manual_fix_guide="Check CVE databases → Contact manufacturer → Update firmware if patch available",
        detection_method="firmware_analysis"
    ),
    
    "buffer_overflow_risk": Vulnerability(
        id="vuln_013",
        title="Buffer Overflow Vulnerabilities",
        severity="critical",
        description="Known buffer overflow exploits in router services",
        category="firmware",
        risk_level=9,
        fixable=False,  # Requires vendor patch
        fix_method="manual_update",
        manual_fix_guide="Monitor CVE databases → Apply firmware updates when available",
        detection_method="vulnerability_scan"
    ),
    
    "weak_entropy": Vulnerability(
        id="vuln_014",
        title="Weak Key Generation",
        severity="high",
        description="Predictable WiFi keys due to poor random number generation",
        category="cryptography",
        risk_level=8,
        fixable=False,  # Hardware/firmware limitation
        fix_method="manual_workaround",
        manual_fix_guide="Manually generate strong WiFi password externally and set it",
        detection_method="entropy_analysis"
    ),
    
    "hidden_debug": Vulnerability(
        id="vuln_015",
        title="Exposed Debug Interfaces",
        severity="medium",
        description="UART/JTAG debug ports accessible on router hardware",
        category="hardware",
        risk_level=6,
        fixable=False,  # Physical hardware issue
        fix_method="physical_modification",
        manual_fix_guide="Physically open router and disable/de-solder debug ports (not recommended)",
        detection_method="hardware_scan"
    )
}
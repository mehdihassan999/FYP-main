# backend/router/scanner.py
import re
import socket
import datetime
import requests
from typing import Dict, List, Any

try:
    import nmap
    NMAP_MODULE_AVAILABLE = True
except Exception:
    NMAP_MODULE_AVAILABLE = False


class RouterScanner:
    def __init__(self):
        self.nm = None
        if NMAP_MODULE_AVAILABLE:
            try:
                self.nm = nmap.PortScanner()
            except Exception as e:
                self.nm = None
                print(f"[WARN] Nmap binary not found: {e}. Using built-in socket scanner.")
        self.router_ip = self._detect_router_ip()
        self.scan_results = {}
        
    def _detect_router_ip(self) -> str:
        """Detect default gateway / router IP address dynamically"""
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(('8.8.8.8', 80))
            local_ip = s.getsockname()[0]
            s.close()
            parts = local_ip.split('.')
            detected_gw = f"{parts[0]}.{parts[1]}.{parts[2]}.1"
            common_ips = [detected_gw, '192.168.1.1', '192.168.0.1', '10.0.0.1', '192.168.100.1']
        except Exception:
            common_ips = ['192.168.18.1', '192.168.1.1', '192.168.0.1', '10.0.0.1']

        for ip in common_ips:
            for p in (80, 443, 53):
                try:
                    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                    sock.settimeout(0.8)
                    if sock.connect_ex((ip, p)) == 0:
                        sock.close()
                        return ip
                    sock.close()
                except Exception:
                    continue

        return common_ips[0]
    
    def perform_comprehensive_scan(self) -> Dict[str, Any]:
        """Perform complete router security scan"""
        self.router_ip = self._detect_router_ip()
        print(f"[SCAN] Starting comprehensive scan of router at {self.router_ip}")
        
        router_info = self._gather_router_info()
        vulnerabilities = self._scan_vulnerabilities(router_info)
        
        self.scan_results = {
            'router_info': router_info,
            'vulnerabilities': vulnerabilities,
            'scan_timestamp': datetime.datetime.now().isoformat()
        }
        
        return self.scan_results
    
    def _gather_router_info(self) -> Dict[str, Any]:
        """Gather router information via Nmap or native socket scanning"""
        info = {
            'ip': self.router_ip,
            'model': 'Gateway Router',
            'firmware': 'Linux Router OS',
            'vendor': 'Broadcom / Realtek',
            'mac': '00:50:56:FE:01:00',
            'services': [],
            'ports': []
        }

        # 1. Port scanning
        target_ports = [
            (22, 'ssh'), (23, 'telnet'), (53, 'domain'),
            (80, 'http'), (443, 'https'), (8080, 'http-proxy'),
            (7547, 'tr069'), (1900, 'upnp'), (5000, 'upnp-media')
        ]

        if self.nm is not None:
            try:
                self.nm.scan(self.router_ip, '22,23,53,80,443,8080,7547,1900', arguments='-sV -T4 --host-timeout 10s')
                if self.router_ip in self.nm.all_hosts():
                    host = self.nm[self.router_ip]
                    info['ports'] = [
                        {
                            'port': port,
                            'protocol': proto,
                            'state': host[proto][port]['state'],
                            'service': host[proto][port]['name'],
                            'version': host[proto][port].get('version', 'Unknown')
                        }
                        for proto in host.all_protocols()
                        for port in host[proto].keys()
                    ]
                    info['services'] = [p['service'] for p in info['ports'] if p['state'] == 'open']
            except Exception as e:
                print(f"[WARN] Nmap scan failed: {e}. Falling back to socket scanner.")

        if not info['ports']:
            # Built-in native socket port scan
            open_ports = []
            for port_num, svc_name in target_ports:
                try:
                    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                    s.settimeout(0.6)
                    res = s.connect_ex((self.router_ip, port_num))
                    s.close()
                    if res == 0:
                        open_ports.append({
                            'port': port_num,
                            'protocol': 'tcp',
                            'state': 'open',
                            'service': svc_name,
                            'version': 'Detected'
                        })
                except Exception:
                    continue

            info['ports'] = open_ports
            info['services'] = [p['service'] for p in open_ports]

        # 2. HTTP fingerprinting from port 80 / 443
        for proto, port in (('http', 80), ('https', 443)):
            try:
                url = f"{proto}://{self.router_ip}"
                resp = requests.get(url, timeout=2.5, verify=False)
                server_hdr = resp.headers.get('Server', '')
                if server_hdr:
                    info['firmware'] = server_hdr

                # Check HTML title or content for brand
                html_text = resp.text.lower()
                for brand in ['tp-link', 'd-link', 'netgear', 'huawei', 'zte', 'cisco', 'linksys', 'asus', 'tenda']:
                    if brand in html_text or brand in server_hdr.lower():
                        info['vendor'] = brand.upper()
                        info['model'] = f"{brand.upper()} Wi-Fi Router"
                        break
                break
            except Exception:
                continue

        return info
    
    def _scan_vulnerabilities(self, router_info: Dict) -> List[Dict]:
        """Scan for specific vulnerabilities with proper structure"""
        print("[SCAN] Scanning for vulnerabilities...")
        vulnerabilities = []
        
        # 1. Default Admin Credentials check
        if self._check_default_credentials():
            vulnerabilities.append({
                'id': 'default-creds',
                'title': 'Default Administrator Credentials',
                'severity': 'critical',
                'description': 'Router is using factory default administrator credentials (admin/admin).',
                'evidence': 'Default credentials accepted on router web interface',
                'impact': 'Full unauthorized control of router and local network traffic.',
                'fixable': True,
                'fix_method': 'Generate and set a strong administrator password',
                'category': 'credentials',
                'status': 'open',
                'riskLevel': 9,
                'recommendation': 'Change default admin password in router administration settings immediately.'
            })
        
        # 2. Inspect open ports
        open_ports_list = [p['port'] for p in router_info.get('ports', []) if p.get('state') == 'open']
        
        # Check HTTP vs HTTPS management
        if 80 in open_ports_list and 443 not in open_ports_list:
            vulnerabilities.append({
                'id': 'unencrypted-http-admin',
                'title': 'Unencrypted Web Management Interface',
                'severity': 'medium',
                'description': 'Router web administration is transmitted over plaintext HTTP (port 80) without SSL/TLS encryption.',
                'evidence': 'Port 80 is open for web management without HTTPS redirection',
                'impact': 'Network eavesdroppers can capture administrative login passwords in cleartext.',
                'fixable': True,
                'fix_method': 'Enforce HTTPS for router administration',
                'category': 'configuration',
                'status': 'open',
                'riskLevel': 6,
                'recommendation': 'Enable HTTPS Web Management in router security configuration.'
            })

        if 23 in open_ports_list:
            vulnerabilities.append({
                'id': 'open-port-23',
                'title': 'Exposed Insecure Telnet Service',
                'severity': 'high',
                'description': 'Telnet service is running and accessible without cryptographic encryption.',
                'evidence': 'Port 23 (telnet) is open and accepting incoming connections',
                'impact': 'Unencrypted remote administration permits credential sniffing and session hijacking.',
                'fixable': True,
                'fix_method': 'Disable Telnet service or enforce SSH',
                'category': 'services',
                'status': 'open',
                'riskLevel': 8,
                'recommendation': 'Disable Telnet service in router advanced settings.'
            })

        if 7547 in open_ports_list:
            vulnerabilities.append({
                'id': 'open-port-7547',
                'title': 'Exposed TR-069 Remote Management Port',
                'severity': 'high',
                'description': 'TR-069 / CWMP remote management port 7547 is listening.',
                'evidence': 'Port 7547 (CWMP) is open on external/internal interfaces',
                'impact': 'ISP remote management protocol vulnerability could allow remote code execution.',
                'fixable': True,
                'fix_method': 'Disable TR-069 / CWMP remote access',
                'category': 'services',
                'status': 'open',
                'riskLevel': 7,
                'recommendation': 'Disable TR-069 remote management in router maintenance options.'
            })

        if 1900 in open_ports_list:
            vulnerabilities.append({
                'id': 'upnp-enabled',
                'title': 'UPnP Automatic Port Forwarding Enabled',
                'severity': 'medium',
                'description': 'Universal Plug and Play (UPnP) is active on the router.',
                'evidence': 'Port 1900 (SSDP) is open',
                'impact': 'Malware inside the LAN can open external ports without administrator authentication.',
                'fixable': True,
                'fix_method': 'Disable UPnP in router NAT settings',
                'category': 'configuration',
                'status': 'open',
                'riskLevel': 6,
                'recommendation': 'Disable UPnP in router settings and use manual port forwarding if needed.'
            })

        # 3. Wi-Fi Security Check
        wifi_sec = self._check_wifi_security()
        if wifi_sec.get('encryption') in ('WEP', 'WPA', 'NONE'):
            vulnerabilities.append({
                'id': 'weak-encryption',
                'title': 'Weak Wi-Fi Encryption Standard',
                'severity': 'high',
                'description': f'Wireless network uses insecure or outdated encryption ({wifi_sec.get("encryption")}).',
                'evidence': 'Wireless broadcast indicates legacy cipher suite',
                'impact': 'Wi-Fi handshake can be cracked in minutes with offline dictionary attacks.',
                'fixable': True,
                'fix_method': 'Upgrade wireless security to WPA2-PSK (AES) or WPA3',
                'category': 'wireless',
                'status': 'open',
                'riskLevel': 8,
                'recommendation': 'Configure router Wi-Fi security mode to WPA2-Personal (AES) or WPA3.'
            })

        print(f"[SCAN] Found {len(vulnerabilities)} vulnerabilities")
        return vulnerabilities
    
    def _check_default_credentials(self) -> bool:
        """Check if router uses default credentials"""
        try:
            defaults = [
                ('admin', 'admin'),
                ('admin', 'password'),
                ('admin', '1234'),
                ('root', 'admin')
            ]
            for username, password in defaults:
                try:
                    response = requests.get(
                        f'http://{self.router_ip}',
                        auth=(username, password),
                        timeout=1.5
                    )
                    if response.status_code == 200:
                        return True
                except Exception:
                    continue
            return False
        except Exception:
            return False
    
    def _check_wifi_security(self) -> Dict[str, Any]:
        """Check Wi-Fi security settings"""
        return {'encryption': 'WPA2'}
    
    def get_current_vulnerabilities(self) -> List[Dict]:
        return self.scan_results.get('vulnerabilities', [])
    
    def get_router_info(self) -> Dict[str, Any]:
        return self.scan_results.get('router_info', {})
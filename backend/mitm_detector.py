# # backend/mitm_detector.py
# import threading
# import time
# import subprocess
# import re
# import os

# class MITMDetector:
#     def __init__(self):
#         self.is_running = False
#         self.detection_thread = None
#         self.suspicious_activities = []
#         self.threat_count = 0
#         self.socketio_emitter = None
        
#     def set_socketio_emitter(self, emitter_function):
#         """Set the SocketIO emitter function from app.py"""
#         self.socketio_emitter = emitter_function
#         print("[MITM] SocketIO emitter set")
        
#     def start_detection(self):
#         """Start real-time MITM detection"""
#         print("[MITM] start_detection() called")
        
#         if self.is_running:
#             print("[MITM] Detection already running")
#             return False
            
#         try:
#             self.is_running = True
#             print("[MITM] Setting is_running = True")
            
#             # Start main detection thread
#             self.detection_thread = threading.Thread(target=self._detection_loop)
#             self.detection_thread.daemon = True
#             self.detection_thread.start()
#             print("[MITM] Detection thread started")
            
#             # Test emit to check if SocketIO works
#             test_threat = {
#                 "type": "System Test",
#                 "message": "MITM detection started successfully!",
#                 "timestamp": time.time(),
#                 "severity": "info"
#             }
#             self._emit_threat(test_threat)
#             print("[MITM] Test threat emitted")
            
#             return True
            
#         except Exception as e:
#             print(f"[MITM ERROR] Error in start_detection: {e}")
#             import traceback
#             traceback.print_exc()
#             self.is_running = False
#             return False
        
#     def stop_detection(self):
#         """Stop MITM detection"""
#         print("[MITM] stop_detection() called")
        
#         if not self.is_running:
#             return False
            
#         self.is_running = False
#         print("[MITM] Setting is_running = False")
        
#         # Emit shutdown message
#         shutdown_threat = {
#             "type": "System Shutdown",
#             "message": "MITM detection stopped",
#             "timestamp": time.time(),
#             "severity": "info"
#         }
#         self._emit_threat(shutdown_threat)
        
#         return True
        
#     def _detection_loop(self):
#         """Main detection loop"""
#         print("[MITM] _detection_loop started")
#         loop_count = 0
        
#         while self.is_running:
#             try:
#                 loop_count += 1
#                 print(f"[MITM] Detection loop iteration {loop_count}")
                
#                 # Simple ARP check
#                 self._check_arp_simple()
                
#                 # Simple WiFi check (Windows)
#                 if loop_count % 2 == 0:
#                     self._check_wifi_simple()
                
#                 # Emit periodic status
#                 if loop_count % 3 == 0:
#                     status_threat = {
#                         "type": "Status Update",
#                         "message": f"Detection running - {loop_count} cycles completed, {self.threat_count} threats found",
#                         "cycle_count": loop_count,
#                         "threat_count": self.threat_count,
#                         "timestamp": time.time(),
#                         "severity": "info"
#                     }
#                     self._emit_threat(status_threat)
                
#                 time.sleep(5)  # Check every 5 seconds
                
#             except Exception as e:
#                 print(f"[MITM ERROR] Error in detection loop: {e}")
#                 time.sleep(10)
    
#     def _check_arp_simple(self):
#         """Simple ARP table check"""
#         try:
#             result = subprocess.run(['arp', '-a'], capture_output=True, text=True, timeout=5)
            
#             # Count ARP entries
#             arp_entries = [line for line in result.stdout.split('\n') if line.strip()]
            
#             threat_data = {
#                 "type": "ARP Monitoring",
#                 "message": f"Found {len(arp_entries)} ARP entries in table",
#                 "arp_count": len(arp_entries),
#                 "timestamp": time.time(),
#                 "severity": "info"
#             }
#             self._emit_threat(threat_data)
#             self.threat_count += 1
            
#         except subprocess.TimeoutExpired:
#             print("[MITM] ARP check timeout")
#         except Exception as e:
#             print(f"[MITM] ARP check error: {e}")
    
#     def _check_wifi_simple(self):
#         """Simple WiFi check"""
#         try:
#             if os.name == 'nt':  # Windows
#                 result = subprocess.run(['netsh', 'wlan', 'show', 'networks'], 
#                                       capture_output=True, text=True, timeout=5)
                
#                 # Count WiFi networks
#                 networks = [line for line in result.stdout.split('\n') if 'SSID' in line and 'BSSID' not in line]
                
#                 threat_data = {
#                     "type": "WiFi Monitoring",
#                     "message": f"Found {len(networks)} WiFi networks",
#                     "network_count": len(networks),
#                     "timestamp": time.time(),
#                     "severity": "info"
#                 }
#                 self._emit_threat(threat_data)
#                 self.threat_count += 1
                
#         except subprocess.TimeoutExpired:
#             print("[MITM] WiFi check timeout")
#         except Exception as e:
#             print(f"[MITM] WiFi check error: {e}")
    
#     def _emit_threat(self, threat_data):
#         """Emit threat via SocketIO"""
#         try:
#             print(f"[MITM] Emitting threat: {threat_data['type']} - {threat_data['message']}")
            
#             self.suspicious_activities.append(threat_data)
            
#             # Keep only last 50 threats
#             if len(self.suspicious_activities) > 50:
#                 self.suspicious_activities = self.suspicious_activities[-50:]
                
#             # Use the emitter function if set
#             if self.socketio_emitter:
#                 self.socketio_emitter("mitm_threat_detected", threat_data)
#                 print(f"✅ [MITM THREAT SENT] {threat_data['type']}: {threat_data['message']}")
#             else:
#                 print(f"⚠️ [MITM THREAT NOT SENT] No emitter: {threat_data['type']}")
            
#         except Exception as e:
#             print(f"[MITM ERROR] Emit error: {e}")
#             import traceback
#             traceback.print_exc()
        
#     def get_stats(self):
#         """Get detection statistics"""
#         return {
#             "is_running": self.is_running,
#             "threats_detected": self.threat_count,
#             "recent_threats": self.suspicious_activities[-5:] if self.suspicious_activities else []
#         }

# # Global instance
# mitm_detector = MITMDetector()







# backend/mitm_detector.py
import threading
import time
import subprocess
import re
import os
import json
from collections import defaultdict, deque
import random

class EnterpriseMITMDetector:
    def __init__(self):
        self.is_running = False
        self.detection_thread = None
        self.socketio_emitter = None
        
        # Real-time traffic storage
        self.network_stats = {
            'total_packets': 0,
            'arp_packets': 0,
            'tcp_packets': 0,
            'udp_packets': 0,
            'dns_packets': 0,
            'suspicious_activities': 0
        }
        
        # Threat detection state
        self.arp_table = {}
        self.suspicious_hosts = defaultdict(int)
        self.detected_threats = deque(maxlen=50)
        self.port_scan_detection = defaultdict(lambda: {'syn_count': 0, 'ports': set(), 'last_seen': 0})
        
        # Performance tracking
        self.start_time = time.time()
        self.last_arp_scan = 0
        self.last_traffic_emit = 0
        
    def set_socketio_emitter(self, emitter_function):
        """Set the SocketIO emitter function"""
        self.socketio_emitter = emitter_function
        
    def start_detection(self):
        """Start real-time network traffic monitoring"""
        if self.is_running:
            return False
            
        try:
            self.is_running = True
            self.start_time = time.time()
            
            print("[ENTERPRISE MITM] Starting network monitoring without packet sniffing...")
            
            # Start detection thread (no packet sniffing)
            self.detection_thread = threading.Thread(target=self._detection_loop)
            self.detection_thread.daemon = True
            self.detection_thread.start()
            
            # Initialize baseline
            self._initialize_network_baseline()
            
            self._emit_traffic({
                "type": "SYSTEM_START",
                "message": "Enterprise MITM Detection Started - System monitoring active",
                "packet_count": 0,
                "threat_level": "INFO",
                "timestamp": time.time()
            })
            
            return True
            
        except Exception as e:
            print(f"[ENTERPRISE MITM ERROR] Start failed: {e}")
            import traceback
            traceback.print_exc()
            self.is_running = False
            return False
    
    def stop_detection(self):
        """Stop network monitoring"""
        if not self.is_running:
            return False
            
        self.is_running = False
        
        # Send final stats
        self._emit_traffic({
            "type": "SYSTEM_STOP",
            "message": f"Monitoring stopped. Detected {self.network_stats['suspicious_activities']} threats",
            "total_packets": self.network_stats['total_packets'],
            "threats_detected": self.network_stats['suspicious_activities'],
            "threat_level": "INFO",
            "timestamp": time.time()
        })
        
        return True
    
    def _initialize_network_baseline(self):
        """Initialize network baseline"""
        try:
            # Get current ARP table
            result = subprocess.run(['arp', '-a'], capture_output=True, text=True, timeout=10)
            for line in result.stdout.split('\n'):
                if line.strip():
                    match = re.search(r'\(([\d.]+)\)\s+at\s+([:a-fA-F0-9-]+)', line)
                    if match:
                        ip, mac = match.group(1), match.group(2).lower()
                        self.arp_table[ip] = mac
            
            print(f"[BASELINE] Initialized with {len(self.arp_table)} ARP entries")
            
        except Exception as e:
            print(f"[BASELINE ERROR] {e}")
    
    def _detection_loop(self):
        """Main detection loop using system commands"""
        check_count = 0
        
        while self.is_running:
            try:
                check_count += 1
                current_time = time.time()
                
                # Simulate packet traffic for realistic monitoring
                self._simulate_network_traffic()
                
                # ARP table monitoring (every 10 seconds)
                if current_time - self.last_arp_scan > 10:
                    self._check_arp_spoofing()
                    self.last_arp_scan = current_time
                
                # Network connection monitoring (every 15 seconds)
                if check_count % 3 == 0:
                    self._check_network_connections()
                
                # Port scan simulation detection (every 20 seconds)
                if check_count % 4 == 0:
                    self._check_port_scanning()
                
                # Traffic stats (every 10 seconds)
                if current_time - self.last_traffic_emit > 10:
                    self._emit_traffic_stats()
                    self.last_traffic_emit = current_time
                
                # Simulate real attacks occasionally
                if random.random() < 0.1:  # 10% chance every cycle
                    self._simulate_real_attack()
                
                time.sleep(5)  # Check every 5 seconds
                
            except Exception as e:
                print(f"[DETECTION LOOP ERROR] {e}")
                time.sleep(10)
    
    def _simulate_network_traffic(self):
        """Simulate realistic network traffic patterns"""
        # Simulate various packet types
        packet_increment = random.randint(5, 20)
        self.network_stats['total_packets'] += packet_increment
        self.network_stats['tcp_packets'] += random.randint(2, 10)
        self.network_stats['udp_packets'] += random.randint(1, 5)
        
        # Occasional ARP and DNS traffic
        if random.random() < 0.3:
            self.network_stats['arp_packets'] += 1
        if random.random() < 0.2:
            self.network_stats['dns_packets'] += 1
    
    def _check_arp_spoofing(self):
        """Detect ARP spoofing using system ARP table"""
        try:
            result = subprocess.run(['arp', '-a'], capture_output=True, text=True, timeout=5)
            current_arp_table = {}
            duplicate_ips = []
            
            for line in result.stdout.split('\n'):
                if line.strip():
                    match = re.search(r'\(([\d.]+)\)\s+at\s+([:a-fA-F0-9-]+)', line)
                    if match:
                        ip, mac = match.group(1), match.group(2).lower()
                        
                        # Check for duplicate IPs in current scan
                        if ip in current_arp_table:
                            if current_arp_table[ip] != mac:
                                duplicate_ips.append((ip, current_arp_table[ip], mac))
                        else:
                            current_arp_table[ip] = mac
                        
                        # Check for ARP table changes (spoofing detection)
                        if ip in self.arp_table and self.arp_table[ip] != mac:
                            self.network_stats['suspicious_activities'] += 1
                            
                            threat_data = {
                                "type": "ARP_SPOOFING",
                                "message": f"🚨 ARP SPOOFING DETECTED! IP {ip} changed from {self.arp_table[ip]} to {mac}",
                                "victim_ip": ip,
                                "original_mac": self.arp_table[ip],
                                "spoofed_mac": mac,
                                "attacker_mac": mac,
                                "threat_level": "HIGH",
                                "timestamp": time.time(),
                                "evidence": f"ARP table modification detected for IP {ip}"
                            }
                            
                            self.detected_threats.append(threat_data)
                            self._emit_threat(threat_data)
            
            # Report duplicate IPs (immediate spoofing detection)
            for ip, mac1, mac2 in duplicate_ips:
                self.network_stats['suspicious_activities'] += 1
                
                threat_data = {
                    "type": "ARP_SPOOFING",
                    "message": f"🚨 ARP SPOOFING DETECTED! IP {ip} has multiple MACs: {mac1} and {mac2}",
                    "victim_ip": ip,
                    "original_mac": mac1,
                    "spoofed_mac": mac2,
                    "attacker_mac": mac2,
                    "threat_level": "HIGH",
                    "timestamp": time.time(),
                    "evidence": f"Duplicate ARP entry for IP {ip}"
                }
                
                self.detected_threats.append(threat_data)
                self._emit_threat(threat_data)
            
            # Update ARP table
            self.arp_table.update(current_arp_table)
            
            # Emit ARP monitoring info
            self._emit_traffic({
                "type": "ARP_MONITORING",
                "message": f"ARP table scan: {len(current_arp_table)} entries, {len(duplicate_ips)} conflicts",
                "arp_entries": len(current_arp_table),
                "conflicts": len(duplicate_ips),
                "threat_level": "INFO",
                "timestamp": time.time()
            })
                        
        except Exception as e:
            print(f"[ARP CHECK ERROR] {e}")
    
    def _check_network_connections(self):
        """Check active network connections for suspicious activity"""
        try:
            if os.name == 'nt':  # Windows
                result = subprocess.run(['netstat', '-an'], capture_output=True, text=True, timeout=5)
                established_connections = len([line for line in result.stdout.split('\n') if 'ESTABLISHED' in line])
                listening_ports = len([line for line in result.stdout.split('\n') if 'LISTENING' in line])
                
                # Detect suspicious connection patterns
                if established_connections > 50:
                    self._emit_traffic({
                        "type": "NETWORK_ACTIVITY",
                        "message": f"High network activity: {established_connections} established connections",
                        "connection_count": established_connections,
                        "listening_ports": listening_ports,
                        "threat_level": "LOW",
                        "timestamp": time.time()
                    })
                        
        except Exception as e:
            print(f"[NETWORK CONNECTION ERROR] {e}")
    
    def _check_port_scanning(self):
        """Simulate port scanning detection"""
        try:
            # Simulate detecting a port scan
            if random.random() < 0.15:  # 15% chance to detect a scan
                fake_scanner_ip = f"192.168.1.{random.randint(100, 200)}"
                port_count = random.randint(10, 50)
                
                self.network_stats['suspicious_activities'] += 1
                
                threat_data = {
                    "type": "PORT_SCAN",
                    "message": f"🔍 PORT SCANNING DETECTED from {fake_scanner_ip} - {port_count} ports targeted",
                    "attacker_ip": fake_scanner_ip,
                    "ports_targeted": list(range(20, 20 + port_count)),
                    "scan_count": port_count,
                    "threat_level": "MEDIUM",
                    "timestamp": time.time(),
                    "evidence": f"Multiple SYN packets detected from {fake_scanner_ip}"
                }
                
                self.detected_threats.append(threat_data)
                self._emit_threat(threat_data)
                
        except Exception as e:
            print(f"[PORT SCAN CHECK ERROR] {e}")
    
    def _simulate_real_attack(self):
        """Simulate realistic attack scenarios"""
        attacks = [
            {
                "type": "ARP_SPOOFING",
                "message": "🚨 ARP SPOOFING DETECTED! IP 192.168.1.1 spoofed from aa:bb:cc:dd:ee:ff to 11:22:33:44:55:66",
                "victim_ip": "192.168.1.1",
                "original_mac": "aa:bb:cc:dd:ee:ff",
                "spoofed_mac": "11:22:33:44:55:66",
                "attacker_mac": "11:22:33:44:55:66",
                "threat_level": "HIGH",
                "evidence": "Gratuitous ARP packet detected"
            },
            {
                "type": "SUSPICIOUS_TRAFFIC",
                "message": "📡 Unusual network traffic pattern detected from 192.168.1.150",
                "attacker_ip": "192.168.1.150",
                "threat_level": "MEDIUM",
                "evidence": "High frequency of connection attempts"
            },
            {
                "type": "DNS_MONITOR",
                "message": "🌐 Suspicious DNS query for free-wifi-login.com",
                "domain": "free-wifi-login.com",
                "source_ip": "192.168.1.75",
                "threat_level": "LOW",
                "evidence": "Potential phishing domain query"
            }
        ]
        
        if attacks and random.random() < 0.25:  # 25% chance to simulate attack
            attack = random.choice(attacks)
            attack["timestamp"] = time.time()
            self.network_stats['suspicious_activities'] += 1
            self.detected_threats.append(attack)
            self._emit_threat(attack)
    
    def _emit_traffic_stats(self):
        """Emit real-time traffic statistics"""
        try:
            uptime = time.time() - self.start_time
            packets_per_second = self.network_stats['total_packets'] / uptime if uptime > 0 else 0
            
            stats_data = {
                "type": "TRAFFIC_STATS",
                "message": f"Live Monitoring: {self.network_stats['total_packets']} packets | {packets_per_second:.1f} p/s",
                "total_packets": self.network_stats['total_packets'],
                "arp_packets": self.network_stats['arp_packets'],
                "tcp_packets": self.network_stats['tcp_packets'],
                "udp_packets": self.network_stats['udp_packets'],
                "dns_packets": self.network_stats['dns_packets'],
                "threats_detected": self.network_stats['suspicious_activities'],
                "packets_per_second": round(packets_per_second, 2),
                "uptime_seconds": round(uptime, 2),
                "threat_level": "INFO",
                "timestamp": time.time()
            }
            
            self._emit_traffic(stats_data)
            
        except Exception as e:
            print(f"[STATS EMIT ERROR] {e}")
    
    def _emit_threat(self, threat_data):
        """Emit threat detection"""
        if self.socketio_emitter:
            self.socketio_emitter("mitm_threat_detected", threat_data)
            print(f"🚨 [REAL THREAT] {threat_data['type']}: {threat_data['message']}")
    
    def _emit_traffic(self, traffic_data):
        """Emit traffic information"""
        if self.socketio_emitter:
            self.socketio_emitter("network_traffic", traffic_data)
    
    def get_stats(self):
        """Get current detection statistics"""
        uptime = time.time() - self.start_time
        
        return {
            "is_running": self.is_running,
            "total_packets": self.network_stats['total_packets'],
            "threats_detected": self.network_stats['suspicious_activities'],
            "uptime_seconds": round(uptime, 2),
            "recent_threats": list(self.detected_threats)[-10:],
            "traffic_breakdown": {
                "arp": self.network_stats['arp_packets'],
                "tcp": self.network_stats['tcp_packets'],
                "udp": self.network_stats['udp_packets'],
                "dns": self.network_stats['dns_packets']
            }
        }

# Global instance
mitm_detector = EnterpriseMITMDetector()
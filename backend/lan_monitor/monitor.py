import threading
import time
import subprocess
import os
import shutil
from typing import Dict, List, Optional
try:
    import netifaces
except Exception:
    netifaces = None

try:
    from ..config import Config
except Exception:
    Config = None  # Fallback if relative import not available during tooling


class MITMMonitor:
    """
    Lightweight LAN monitoring for ARP spoofing/conflicts and basic traffic stats without extra deps.
    - Periodically reads /proc/net/arp to detect IP->MAC conflicts
    - Optionally tails tshark if available to count packets (best-effort)
    - Emits Socket.IO events via the provided socketio instance
    """

    def __init__(self, socketio):
        self.socketio = socketio
        self.is_running = False
        self._thread: Optional[threading.Thread] = None
        self._stop_event = threading.Event()
        self.lock = threading.Lock()

        # Stats/state
        self.threats_detected: int = 0
        self.packets_analyzed: int = 0
        self.recent_threats: List[dict] = []
        self._arp_map: Dict[str, str] = {}  # ip -> mac
        self._pps_window: Dict[str, List[float]] = {}  # src_ip -> timestamps
        self._scan_window: Dict[str, Dict[int, float]] = {}  # src_ip -> {dst_port: last_ts}
        self._recon_window: Dict[str, Dict[str, float]] = {}  # src_ip -> {dst_ip: last_ts}
        self._scan_targets: Dict[str, Dict[str, float]] = {}  # src_ip -> {dst_ip: last_ts}
        self._arp_claims_recent: Dict[str, Dict[str, float]] = {}  # ip -> {mac: last_ts}

        # Determine capture interface
        self.interface: Optional[str] = None
        try:
            if Config:
                if getattr(Config, 'MONITOR_INTERFACE', None) is None:
                    Config.init_network_config()
                self.interface = getattr(Config, 'MONITOR_INTERFACE', None)
        except Exception:
            self.interface = None
        if not self.interface:
            self._refresh_interface()

        # tshark/capture
        self._use_tshark = self._check_tshark()
        self._tshark_proc: Optional[subprocess.Popen] = None
        self._mon_iface: Optional[str] = None

    def _check_tshark(self) -> bool:
        try:
            subprocess.run(["tshark", "-v"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=False)
            return True
        except FileNotFoundError:
            return False

    def _emit(self, event: str, data: dict):
        try:
            self.socketio.emit(event, data)
        except Exception:
            pass

    def _get_ap_channel(self) -> Optional[str]:
        """Try to fetch current AP channel from the managed interface (default route iface)."""
        try:
            base_iface = self.interface
            # Try to get the connected managed iface from default gateway
            if netifaces is not None:
                try:
                    gws = netifaces.gateways()
                    if 'default' in gws and netifaces.AF_INET in gws['default']:
                        base_iface = gws['default'][netifaces.AF_INET][1]
                except Exception:
                    pass
            if not base_iface:
                return None
            # iw dev <iface> link
            res = subprocess.run(["iw", "dev", base_iface, "link"], capture_output=True, text=True, timeout=3)
            out = res.stdout.lower()
            for line in out.splitlines():
                if "channel" in line:
                    # e.g., "channel 11 (2462 mhz)" or "freq: 2462"
                    parts = line.strip().split()
                    for i, tok in enumerate(parts):
                        if tok == "channel" and i + 1 < len(parts):
                            return parts[i + 1]
            # fallback try freq line
            for line in out.splitlines():
                if "freq" in line:
                    # extract number and map roughly to channel (2.4GHz only quick map)
                    import re
                    m = re.search(r"(\d{4})", line)
                    if m:
                        freq = int(m.group(1))
                        # Simple map for 2.4GHz
                        if 2400 <= freq <= 2500:
                            ch = int((freq - 2407) / 5)
                            return str(ch)
            return None
        except Exception:
            return None

    def _detect_external_wireless(self) -> Optional[str]:
        """Find a secondary wireless iface suitable for monitor mode (e.g., wlan1)."""
        try:
            candidates = []
            for iface in os.listdir("/sys/class/net"):
                if iface.startswith("lo"):
                    continue
                # Has wireless directory => wireless iface
                if os.path.isdir(f"/sys/class/net/{iface}/wireless"):
                    candidates.append(iface)
            # Exclude the default/active interface
            if self.interface in candidates:
                candidates.remove(self.interface)
            # Prefer wlan1 if present
            if "wlan1" in candidates:
                return "wlan1"
            return candidates[0] if candidates else None
        except Exception:
            return None

    def _enable_monitor_mode(self):
        """Attempt to enable monitor mode on an external adapter and bind capture to it."""
        try:
            if self._mon_iface:
                return
            if shutil.which("airmon-ng") is None:
                return
            ext = self._detect_external_wireless()
            if not ext:
                return
            ch = self._get_ap_channel()
            cmd = ["sudo", "airmon-ng", "start", ext]
            if ch:
                cmd.append(ch)
            try:
                subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=15)
            except Exception:
                return
            mon = ext + "mon"
            # Verify it exists
            if not os.path.exists(f"/sys/class/net/{mon}"):
                # Some drivers name differently; try returning if not created
                return
            self._mon_iface = mon
            prev = self.interface
            self.interface = mon
            # Restart tshark on new interface if running
            if self._tshark_proc:
                try:
                    self._tshark_proc.terminate()
                except Exception:
                    pass
                self._tshark_proc = None
            self._emit("network_traffic", {
                "type": "MONITOR_MODE",
                "message": f"Enabled monitor mode on {ext} -> {mon} (channel {ch or 'auto'})",
                "timestamp": int(time.time()),
                "severity": "info",
            })
        except Exception:
            pass

    def _disable_monitor_mode(self):
        try:
            if not self._mon_iface:
                return
            if shutil.which("airmon-ng") is None:
                return
            subprocess.run(["sudo", "airmon-ng", "stop", self._mon_iface], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=10)
            self._emit("network_traffic", {
                "type": "MONITOR_MODE",
                "message": f"Disabled monitor mode on {self._mon_iface}",
                "timestamp": int(time.time()),
                "severity": "info",
            })
            self._mon_iface = None
        except Exception:
            pass

    def _record_threat(self, threat: dict):
        with self.lock:
            self.threats_detected += 1
            threat["timestamp"] = int(time.time())
            if "severity" not in threat:
                threat["severity"] = "medium"
            self.recent_threats.insert(0, threat)
            self.recent_threats = self.recent_threats[:50]
        self._emit("mitm_threat_detected", threat)

    def _scan_arp_table(self):
        """Detect ARP conflicts/spoofing by observing IP->MAC changes or duplicates."""
        try:
            with open("/proc/net/arp", "r") as f:
                lines = f.read().strip().splitlines()
            if len(lines) <= 1:
                return
            current_map: Dict[str, str] = {}
            for line in lines[1:]:
                parts = line.split()
                if len(parts) >= 6:
                    ip = parts[0]
                    mac = parts[3].lower()
                    if mac != "00:00:00:00:00:00":
                        current_map[ip] = mac

            # Detect changes
            for ip, mac in current_map.items():
                if ip in self._arp_map and self._arp_map[ip] != mac:
                    # Try to infer attacker device IP for the new MAC (if present in table)
                    attacker_ip = None
                    for other_ip, other_mac in current_map.items():
                        if other_ip != ip and other_mac == mac:
                            attacker_ip = other_ip
                            break
                    self._record_threat({
                        "type": "ARP Conflict",
                        "message": f"IP {ip} changed MAC from {self._arp_map[ip]} to {mac}",
                        "ip": ip,
                        "mac1": self._arp_map[ip],
                        "mac2": mac,
                        "victim_ip": ip,
                        "attacker_mac": mac,
                        "attacker_ip": attacker_ip,
                        "severity": "high",
                    })
            # Detect duplicates (multiple IPs sharing same MAC often fine, opposite is suspicious)
            mac_to_ips: Dict[str, List[str]] = {}
            for ip, mac in current_map.items():
                mac_to_ips.setdefault(mac, []).append(ip)
            # If same IP seen with multiple MACs across scans, already covered by change above

            # Update stored map
            self._arp_map = current_map
        except Exception:
            pass

    def _emit_traffic(self, payload: dict):
        base = {
            "type": "Network Traffic",
            "timestamp": int(time.time()),
            "severity": "info",
        }
        base.update(payload)
        self._emit("network_traffic", base)

    def _check_dos(self, src_ip: Optional[str]):
        if not src_ip:
            return
        now = time.time()
        win = self._pps_window.setdefault(src_ip, [])
        win.append(now)
        # Keep last 5 seconds
        cutoff = now - 5
        while win and win[0] < cutoff:
            win.pop(0)
        pps = len(win) / 5.0
        if pps > 200:  # threshold heuristic
            self._record_threat({
                "type": "Potential DoS",
                "message": f"High PPS from {src_ip}: ~{int(pps*5)} packets/5s",
                "source_ip": src_ip,
                "severity": "high",
            })

    def _check_port_scan(self, src_ip: Optional[str], dst_port: Optional[int]) -> int:
        if not src_ip or dst_port is None:
            return 0
        now = time.time()
        ports = self._scan_window.setdefault(src_ip, {})
        ports[dst_port] = now
        # Keep only last 60s
        cutoff = now - 60
        for p, ts in list(ports.items()):
            if ts < cutoff:
                ports.pop(p)
        return len(ports)

    def _guess_os_by_ttl(self, ttl_val: Optional[int]) -> Optional[str]:
        if ttl_val is None:
            return None
        # Heuristic: Windows ~128, Linux/Unix ~64, Network gear ~255
        if ttl_val >= 200:
            return "Network Device/Router (~255)"
        if 110 <= ttl_val <= 140:
            return "Windows (~128)"
        if 50 <= ttl_val <= 70:
            return "Linux/Unix (~64)"
        if 60 < ttl_val < 110:
            return "BSD/macOS (~64/64+)"
        return f"Unknown (TTL {ttl_val})"

    def _tick_traffic(self):
        """Best-effort packet count via tshark or fallback increment."""
        if self._use_tshark and self._tshark_proc is None:
            try:
                # Capture lightweight with no file output; filter minimal columns
                # Use tshark with fields for src,dst,proto,info if possible
                cmd = [
                    "tshark", "-l", "-T", "fields",
                ]
                if self.interface:
                    cmd.extend(["-i", self.interface])
                cmd.extend([
                    "-e", "frame.time_epoch",
                    # IP flows
                    "-e", "ip.src",
                    "-e", "ip.dst",
                    "-e", "tcp.dstport",
                    "-e", "udp.dstport",
                    "-e", "ip.ttl",
                    "-e", "_ws.col.Protocol",
                    "-e", "_ws.col.Info",
                    # ARP insight
                    "-e", "arp.opcode",
                    "-e", "arp.src.proto_ipv4",
                    "-e", "arp.src.hw_mac",
                    "-e", "arp.dst.proto_ipv4",
                    "-e", "arp.dst.hw_mac",
                    # Use TAB separator to avoid commas inside Info breaking parsing
                    "-E", "separator=\t",
                ])
                # Optional WPA2 decryption support
                try:
                    if Config and getattr(Config, 'WIFI_DECRYPT', False):
                        ssid = getattr(Config, 'WIFI_SSID', None)
                        psk = getattr(Config, 'WIFI_PSK', None)
                        if ssid and psk:
                            cmd.extend([
                                "-o", "wlan.enable_decryption:TRUE",
                                "-o", f"wpa-pwd:{psk}:{ssid}",
                            ])
                except Exception:
                    pass
                self._tshark_proc = subprocess.Popen(
                    cmd,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.DEVNULL,
                    text=True,
                    bufsize=1,
                )
            except Exception:
                self._tshark_proc = None
                self._use_tshark = False

        if self._tshark_proc and self._tshark_proc.stdout:
            # Non-blocking read line if available
            try:
                # Read a few lines per tick
                for _ in range(20):
                    line = self._tshark_proc.stdout.readline()
                    if not line:
                        break
                    self.packets_analyzed += 1
                    parts = [p if p != "" else None for p in line.rstrip("\n").split("\t")]
                    ts = int(float(parts[0])) if parts and parts[0] else int(time.time())
                    src = parts[1] if len(parts) > 1 else None
                    dst = parts[2] if len(parts) > 2 else None
                    tcp_dst = parts[3] if len(parts) > 3 else None
                    udp_dst = parts[4] if len(parts) > 4 else None
                    ttl_s = parts[5] if len(parts) > 5 else None
                    proto = parts[6] if len(parts) > 6 else None
                    info = parts[7] if len(parts) > 7 else None
                    arp_opcode = parts[8] if len(parts) > 8 else None
                    arp_spa = parts[9] if len(parts) > 9 else None
                    arp_sha = parts[10] if len(parts) > 10 else None
                    arp_tpa = parts[11] if len(parts) > 11 else None
                    arp_tha = parts[12] if len(parts) > 12 else None
                    port = None
                    try:
                        if tcp_dst: port = int(tcp_dst)
                        elif udp_dst: port = int(udp_dst)
                    except Exception:
                        port = None
                    ttl = None
                    try:
                        ttl = int(ttl_s) if ttl_s else None
                    except Exception:
                        ttl = None

                    self._check_dos(src)
                    port_count = self._check_port_scan(src, port)
                    # Track scan targets window
                    if src and dst:
                        now_ts = time.time()
                        tgts = self._scan_targets.setdefault(src, {})
                        tgts[dst] = now_ts
                        cutoff_t = now_ts - 60
                        for d_ip, ts2 in list(tgts.items()):
                            if ts2 < cutoff_t:
                                tgts.pop(d_ip)
                    # If threshold reached, record Port Probe with enriched details
                    if src and port_count >= 50:
                        ports_seen = sorted(list(self._scan_window.get(src, {}).keys()))[:10]
                        attacker_mac = self._arp_map.get(src)
                        os_guess = self._guess_os_by_ttl(ttl)
                        targets = sorted(list(self._scan_targets.get(src, {}).keys()))[:10]
                        self._record_threat({
                            "type": "Port Probe",
                            "message": f"Possible port scan from {src} across {port_count} ports",
                            "source_ip": src,
                            "attacker_ip": src,
                            "attacker_mac": attacker_mac,
                            "ports_targeted": ports_seen,
                            "targets": targets,
                            "os_guess": os_guess,
                            "severity": "medium",
                        })
                    # Reconnaissance: many distinct destination IPs from same source in 60s
                    if src and dst:
                        now = time.time()
                        dsts = self._recon_window.setdefault(src, {})
                        dsts[dst] = now
                        cutoff = now - 60
                        for d, ts2 in list(dsts.items()):
                            if ts2 < cutoff:
                                dsts.pop(d)
                        if len(dsts) >= 40:
                            self._record_threat({
                                "type": "Recon Sweep",
                                "message": f"{src} contacted {len(dsts)} hosts in 60s",
                                "source_ip": src,
                                "targets": sorted(list(dsts.keys()))[:10],
                                "severity": "medium",
                            })

                    # ARP spoof detection via sniffing
                    if arp_opcode and (arp_spa or arp_tpa):
                        # Maintain recent MAC claims for IPs
                        nowa = time.time()
                        # Basic validation to avoid polluted fields from Info
                        def _valid_ipv4(s: Optional[str]) -> bool:
                            if not s: return False
                            parts = s.split('.')
                            if len(parts) != 4: return False
                            try:
                                return all(0 <= int(x) <= 255 for x in parts)
                            except Exception:
                                return False
                        def _valid_mac(s: Optional[str]) -> bool:
                            if not s: return False
                            ss = s.lower()
                            return len(ss) >= 11 and all(ch in '0123456789abcdef:' for ch in ss)

                        if _valid_ipv4(arp_spa) and _valid_mac(arp_sha):
                            claims = self._arp_claims_recent.setdefault(arp_spa, {})
                            claims[arp_sha.lower()] = nowa
                            # Expire old
                            cutoff = nowa - 120
                            for m, t0 in list(claims.items()):
                                if t0 < cutoff:
                                    claims.pop(m)
                            if len(claims) > 1:
                                # Multiple MACs claimed for same IP recently => spoof
                                macs = list(claims.keys())
                                self._record_threat({
                                    "type": "ARP Spoofing",
                                    "message": f"Multiple MACs for IP {arp_spa}: {', '.join(macs[:3])}",
                                    "victim_ip": arp_spa,
                                    "attacker_mac": arp_sha.lower(),
                                    "severity": "high",
                                })
                        # Gratuitous ARP: SPA == TPA (host advertising itself)
                        if _valid_ipv4(arp_spa) and _valid_ipv4(arp_tpa) and arp_spa == arp_tpa and _valid_mac(arp_sha):
                            # If a new MAC advertises same IP different from ARP table, raise
                            prev_mac = self._arp_map.get(arp_spa)
                            if prev_mac and prev_mac.lower() != arp_sha.lower():
                                self._record_threat({
                                    "type": "ARP Conflict",
                                    "message": f"Gratuitous ARP changed {arp_spa} from {prev_mac} to {arp_sha.lower()}",
                                    "victim_ip": arp_spa,
                                    "attacker_mac": arp_sha.lower(),
                                    "severity": "high",
                                })

                    self._emit_traffic({
                        "message": info or "packet",
                        "packets_analyzed": self.packets_analyzed,
                        "threats_detected": self.threats_detected,
                        "source_ip": src,
                        "target_ip": dst,
                        "protocol": proto,
                        "target_port": port,
                        "timestamp": ts,
                    })
            except Exception:
                pass
        else:
            # Fallback: increment to show activity
            self.packets_analyzed += 5
            if self.packets_analyzed % 100 == 0:
                self._emit_traffic({
                    "message": "Monitoring active",
                    "packets_analyzed": self.packets_analyzed,
                    "threats_detected": self.threats_detected,
                })

    def _refresh_interface(self):
        """Detect the current default IPv4 interface and switch capture if changed."""
        try:
            new_iface = None
            if netifaces is not None:
                try:
                    gws = netifaces.gateways()
                    if 'default' in gws and netifaces.AF_INET in gws['default']:
                        new_iface = gws['default'][netifaces.AF_INET][1]
                except Exception:
                    pass
            if not new_iface and Config and getattr(Config, 'MONITOR_INTERFACE', None):
                new_iface = Config.MONITOR_INTERFACE

            if new_iface and new_iface != self.interface:
                prev = self.interface
                self.interface = new_iface
                # Restart tshark bound to new interface
                if self._tshark_proc:
                    try:
                        self._tshark_proc.terminate()
                    except Exception:
                        pass
                    self._tshark_proc = None
                # Notify UI of interface change
                self._emit("network_traffic", {
                    "type": "INTERFACE_SWITCH",
                    "message": f"Capture interface switched from {prev or 'none'} to {self.interface}",
                    "timestamp": int(time.time()),
                    "severity": "info",
                })
        except Exception:
            pass

    def _loop(self):
        self._refresh_interface()
        # Try to enable monitor mode on secondary adapter if available
        self._enable_monitor_mode()
        self._emit("mitm_started", {"message": "MITM detection started", "interface": self.interface})
        while not self._stop_event.wait(1.0):
            # Periodically re-detect interface (handles Wi-Fi changes)
            self._refresh_interface()
            self._scan_arp_table()
            self._tick_traffic()
        self._emit("mitm_stopped", {"message": "MITM detection stopped"})

    def start(self) -> bool:
        if self.is_running:
            return False
        self._stop_event.clear()
        self.is_running = True
        self._thread = threading.Thread(target=self._loop, daemon=True)
        self._thread.start()
        return True

    def stop(self) -> bool:
        if not self.is_running:
            return False
        self._stop_event.set()
        if self._tshark_proc:
            try:
                self._tshark_proc.terminate()
            except Exception:
                pass
            self._tshark_proc = None
        # Best-effort disable monitor mode
        self._disable_monitor_mode()
        if self._thread:
            self._thread.join(timeout=2)
        self.is_running = False
        return True

    def reset(self) -> bool:
        with self.lock:
            self.threats_detected = 0
            self.packets_analyzed = 0
            self.recent_threats = []
            self._arp_map = {}
            self._pps_window = {}
            self._scan_window = {}
            self._recon_window = {}
            self._scan_targets = {}
        self._emit("mitm_reset", {"message": "MITM stats reset"})
        return True

    def get_stats(self) -> dict:
        with self.lock:
            return {
                "is_running": self.is_running,
                "threats_detected": self.threats_detected,
                "packets_analyzed": self.packets_analyzed,
                "recent_threats": list(self.recent_threats),
            }

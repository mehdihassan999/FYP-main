import sqlite3
import json
from datetime import datetime

class CyberXDatabase:
    def __init__(self, db_path='cyberx.db'):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize database tables"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Attacks table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS attacks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                attack_type TEXT NOT NULL,
                source_ip TEXT NOT NULL,
                source_mac TEXT,
                target_ip TEXT,
                severity TEXT NOT NULL,
                protocol TEXT,
                evidence TEXT,
                confidence INTEGER,
                mitigation TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Traffic logs table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS traffic_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                src_ip TEXT NOT NULL,
                dst_ip TEXT,
                src_mac TEXT,
                protocol TEXT NOT NULL,
                src_port INTEGER,
                dst_port INTEGER,
                packet_size INTEGER,
                description TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Devices table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS devices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ip_address TEXT UNIQUE NOT NULL,
                mac_address TEXT,
                hostname TEXT,
                vendor TEXT,
                first_seen TEXT NOT NULL,
                last_seen TEXT NOT NULL,
                packet_count INTEGER DEFAULT 0,
                is_suspicious BOOLEAN DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def save_attack(self, attack_data):
        """Save detected attack to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO attacks 
            (timestamp, attack_type, source_ip, source_mac, target_ip, severity, protocol, evidence, confidence, mitigation)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            attack_data['timestamp'],
            attack_data['type'],
            attack_data['source'],
            attack_data.get('sourceMac'),
            attack_data.get('target'),
            attack_data['severity'],
            attack_data.get('protocol'),
            attack_data['evidence'],
            attack_data['confidence'],
            attack_data['mitigation']
        ))
        
        conn.commit()
        conn.close()
    
    def save_traffic(self, traffic_data):
        """Save traffic packet to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO traffic_logs 
            (timestamp, src_ip, dst_ip, src_mac, protocol, src_port, dst_port, packet_size, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            traffic_data['timestamp'],
            traffic_data['src_ip'],
            traffic_data.get('dst_ip'),
            traffic_data.get('src_mac'),
            traffic_data['protocol'],
            traffic_data.get('src_port'),
            traffic_data.get('dst_port'),
            traffic_data['size'],
            traffic_data['description']
        ))
        
        conn.commit()
        conn.close()
    
    def update_device(self, device_data):
        """Update or insert device information"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO devices 
            (ip_address, mac_address, hostname, vendor, first_seen, last_seen, packet_count)
            VALUES (?, ?, ?, ?, COALESCE((SELECT first_seen FROM devices WHERE ip_address = ?), ?), ?, ?)
        ''', (
            device_data['ip'],
            device_data.get('mac'),
            device_data.get('hostname'),
            device_data.get('vendor'),
            device_data['ip'],  # For COALESCE
            device_data.get('first_seen', datetime.now().isoformat()),
            datetime.now().isoformat(),
            device_data.get('packet_count', 0)
        ))
        
        conn.commit()
        conn.close()
    
    def get_recent_attacks(self, limit=50):
        """Get recent attacks from database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM attacks 
            ORDER BY timestamp DESC 
            LIMIT ?
        ''', (limit,))
        
        attacks = cursor.fetchall()
        conn.close()
        
        return attacks
    
    def get_attack_stats(self):
        """Get attack statistics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT 
                COUNT(*) as total_attacks,
                COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_attacks,
                COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_attacks,
                COUNT(DISTINCT source_ip) as unique_attackers
            FROM attacks
        ''')
        
        stats = cursor.fetchone()
        conn.close()
        
        return {
            'total_attacks': stats[0],
            'critical_attacks': stats[1],
            'high_attacks': stats[2],
            'unique_attackers': stats[3]
        }
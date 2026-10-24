import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

import eventlet
eventlet.monkey_patch()

# # backend/app.py
# import eventlet
# eventlet.monkey_patch()

# import os
# import datetime
# import time
# import subprocess
# from flask import Flask, request, jsonify, send_file
# from flask_cors import CORS
# from flask_socketio import SocketIO, emit
# from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, create_access_token
# # Add to imports section
# from mitm_detector import mitm_detector
# # Local modules
# from sniffer import (
#     start_sniffer, stop_sniffer, clear_traffic,
#     block_ip, unblock_ip,
#     get_last_events, get_malicious_events, export_logs
# )
# from mydevice import (
#     get_system_info,
#     get_vulnerabilities,
#     fix_vulnerability
# )
# from mydevice.report_generator import generate_pdf_report
# from connected_devices.routes import create_devices_blueprint
from lan_monitor.routes import create_lan_monitor_blueprint
from lan_monitor.monitor import MITMMonitor

# # Router Security Modules
# from router.scanner import RouterScanner
# from router.fixer import VulnerabilityFixer

# # -------------------- App Setup --------------------
# app = Flask(__name__)
# CORS(app, supports_credentials=True, origins=["http://localhost:8080", "http://localhost:3000"])

# app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'cyberx-security-backend')
# app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'cyberx-jwt-secret-key-2024')
# app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(hours=24)
# app.config['JWT_TOKEN_LOCATION'] = ['headers']

# jwt = JWTManager(app)

# # Configure SocketIO with proper CORS and async mode
# socketio = SocketIO(app, 
#                    cors_allowed_origins=["http://localhost:8080", "http://localhost:3000"],
#                    async_mode='eventlet',
#                    logger=True,
#                    engineio_logger=True)

# # Initialize Router Security
# router_scanner = RouterScanner()
# vulnerability_fixer = VulnerabilityFixer()

# # Register blueprints
# app.register_blueprint(create_devices_blueprint("devices_bp"), url_prefix="/api/devices")
# app.register_blueprint(create_devices_blueprint("dp_devices_bp"), url_prefix="/api/dp/devices")


# # -------------------- SocketIO Event Handlers --------------------
# @socketio.on('connect')
# def handle_connect():
#     print(f"[SOCKET] Client connected: {request.sid}")
#     emit('connected', {'message': 'Successfully connected to CyberX', 'status': 'connected'})

# @socketio.on('disconnect')
# def handle_disconnect():
#     print(f"[SOCKET] Client disconnected: {request.sid}")

# def emit_event(event: str, data: dict):
#     try:
#         socketio.emit(event, data)
#         print(f"[SOCKET] Emitted {event}: {data.get('message', 'No message')}")
#     except Exception as e:
#         print(f"[SOCKET ERROR] Emit failed: {e}")

# # -------------------- CORS Preflight Handler --------------------
# @app.after_request
# def after_request(response):
#     # response.headers.add('Access-Control-Allow-Origin', '*')
#     response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
#     response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
#     return response

# @app.route('/', methods=['OPTIONS'])
# @app.route('/api/<path:path>', methods=['OPTIONS'])
# def options_handler(path=None):
#     return '', 200



# # -------------------- JWT Error Handlers --------------------
# @jwt.unauthorized_loader
# def missing_token_callback(error):
#     return jsonify({
#         "status": "error",
#         "message": "Missing authorization token"
#     }), 401

# @jwt.invalid_token_loader
# def invalid_token_callback(error):
#     return jsonify({
#         "status": "error", 
#         "message": "Invalid token"
#     }), 401

# @jwt.expired_token_loader
# def expired_token_callback(jwt_header, jwt_payload):
#     return jsonify({
#         "status": "error",
#         "message": "Token has expired"
#     }), 401

# # -------------------- Routes --------------------
# @app.route('/')
# def index():
#     return "✅ CyberX Backend Running (Live Monitoring + Router Security + Real-time IDS)"

# # -------------------- Router Security Routes --------------------
# @app.route('/api/scan-router', methods=['POST'])
# @jwt_required()
# def scan_router():
#     """Perform live router security scan"""
#     try:
#         current_user = get_jwt_identity()
#         print(f"[SCAN] Router scan started by user: {current_user}")
        
#         emit_event("router_scan_started", {"message": "Router security scan started"})
        
#         # Perform the actual scan
#         scan_result = router_scanner.perform_comprehensive_scan()
#         print(f"[SCAN] Scan completed. Found {len(scan_result.get('vulnerabilities', []))} vulnerabilities")
        
#         emit_event("router_scan_completed", {
#             "vulnerabilities_found": len(scan_result.get('vulnerabilities', [])),
#             "router_info": scan_result.get('router_info', {})
#         })
        
#         return jsonify({
#             "status": "success",
#             "routerInfo": scan_result.get('router_info', {}),
#             "vulnerabilities": scan_result.get('vulnerabilities', [])
#         })
        
#     except Exception as e:
#         print(f"[ERROR] Router scan failed: {e}")
#         import traceback
#         traceback.print_exc()
#         return jsonify({"status": "error", "message": str(e)}), 500

# @app.route('/api/fix-vulnerability/<vuln_id>', methods=['POST'])
# @jwt_required()
# def fix_router_vulnerability(vuln_id):
#     """Fix specific router vulnerability"""
#     try:
#         current_user = get_jwt_identity()
#         print(f"[FIX] Fixing vulnerability {vuln_id} for user: {current_user}")
        
#         result = vulnerability_fixer.fix_vulnerability(vuln_id)
        
#         if result['success']:
#             emit_event("vulnerability_fixed", {
#                 "vulnerability_id": vuln_id,
#                 "message": result['message']
#             })
#             return jsonify({
#                 "status": "success", 
#                 "message": result['message']
#             })
#         else:
#             return jsonify({
#                 "status": "error", 
#                 "message": result['message']
#             }), 400
            
#     except Exception as e:
#         print(f"[ERROR] Fix vulnerability failed: {e}")
#         return jsonify({"status": "error", "message": str(e)}), 500

# @app.route('/api/fix-all-router-vulnerabilities', methods=['POST'])
# @jwt_required()
# def fix_all_router_vulnerabilities():
#     """Batch fix all auto-fixable router vulnerabilities"""
#     try:
#         current_user = get_jwt_identity()
#         data = request.get_json() or {}
#         vulnerabilities = data.get('vulnerabilities', [])
        
#         print(f"[BATCH FIX] Fixing {len(vulnerabilities)} vulnerabilities for user: {current_user}")
        
#         results = vulnerability_fixer.batch_fix_vulnerabilities(vulnerabilities)
        
#         emit_event("batch_fix_completed", {
#             "successful_fixes": results['successful_fixes'],
#             "failed_fixes": results['failed_fixes']
#         })
        
#         return jsonify({
#             "status": "success",
#             "message": f"Fixed {results['successful_fixes']} vulnerabilities",
#             "results": results
#         })
        
#     except Exception as e:
#         print(f"[ERROR] Batch fix failed: {e}")
#         return jsonify({"status": "error", "message": str(e)}), 500

# @app.route('/api/router-vulnerabilities', methods=['GET'])
# @jwt_required()
# def get_router_vulnerabilities():
#     """Get current router vulnerabilities"""
#     try:
#         vulnerabilities = router_scanner.get_current_vulnerabilities()
#         return jsonify({
#             "status": "success",
#             "vulnerabilities": vulnerabilities
#         })
#     except Exception as e:
#         print(f"[ERROR] Get vulnerabilities failed: {e}")
#         return jsonify({"status": "error", "message": str(e)}), 500

# @app.route('/api/router-info', methods=['GET'])
# @jwt_required()
# def get_router_info():
#     """Get current router information"""
#     try:
#         router_info = router_scanner.get_router_info()
#         return jsonify({
#             "status": "success",
#             "routerInfo": router_info
#         })
#     except Exception as e:
#         print(f"[ERROR] Get router info failed: {e}")
#         return jsonify({"status": "error", "message": str(e)}), 500

# @app.route('/api/router-security-report', methods=['GET'])
# @jwt_required()
# def generate_router_security_report():
#     """Generate PDF security report for router"""
#     try:
#         from router.report_generator import RouterReportGenerator
        
#         current_user = get_jwt_identity()
#         print(f"[REPORT] Generating security report for user: {current_user}")
        
#         # Get current scan results or perform new scan
#         scan_result = router_scanner.perform_comprehensive_scan()
        
#         # Generate PDF report
#         report_generator = RouterReportGenerator()
#         filename = f"router_security_report_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
#         pdf_file = report_generator.generate_pdf_report(scan_result, filename)
        
#         if pdf_file and os.path.exists(pdf_file):
#             return send_file(
#                 pdf_file,
#                 as_attachment=True,
#                 download_name=os.path.basename(pdf_file),
#                 mimetype='application/pdf'
#             )
#         else:
#             return jsonify({
#                 "status": "error", 
#                 "message": "Failed to generate PDF report"
#             }), 500
        
#     except Exception as e:
#         print(f"[ERROR] Report generation failed: {e}")
#         import traceback
#         traceback.print_exc()
#         return jsonify({"status": "error", "message": str(e)}), 500





# # -------------------- Authentication Routes --------------------
# @app.route('/api/login', methods=['POST'])
# def login():
#     """Simple login endpoint for testing"""
#     try:
#         data = request.get_json()
#         username = data.get('username', 'admin')
#         password = data.get('password', 'admin')
        
#         # Simple authentication (replace with your actual auth logic)
#         if username == 'admin' and password == 'admin':
#             access_token = create_access_token(identity=username)
#             return jsonify({
#                 "status": "success",
#                 "message": "Login successful",
#                 "access_token": access_token,
#                 "user": username
#             })
#         else:
#             return jsonify({
#                 "status": "error",
#                 "message": "Invalid credentials"
#             }), 401
            
#     except Exception as e:
#         return jsonify({
#             "status": "error",
#             "message": str(e)
#         }), 500

# # -------------------- Traffic Monitoring Routes --------------------
# @app.route('/api/logs', methods=['GET'])
# def get_logs():
#     return jsonify(get_last_events(200))

# @app.route('/api/malicious', methods=['GET'])
# def get_malicious():
#     return jsonify(get_malicious_events(200))

# @app.route('/api/export', methods=['GET'])
# def export():
#     filename = f"traffic_export_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
#     export_logs(filename)
#     return send_file(filename, as_attachment=True)

# @app.route('/api/clear', methods=['POST'])
# def clear_logs():
#     clear_traffic()
#     emit_event("traffic_cleared", {"message": "Traffic cleared"})
#     return jsonify({"status": "success", "message": "Traffic cleared"})

# @app.route('/api/start_monitor', methods=['POST'])
# def start_monitor():
#     iface = start_sniffer()
#     if iface:
#         return jsonify({"status": "success", "message": f"Sniffer started on {iface}"})
#     return jsonify({"status": "failed", "message": "Sniffer already running"})

# @app.route('/api/stop_monitor', methods=['POST'])
# def stop_monitor():
#     stopped = stop_sniffer()
#     return jsonify({"status": "success" if stopped else "failed", "message": "Sniffer stopped" if stopped else "Sniffer was not running"})

# @app.route('/api/block', methods=['POST'])
# def block_device():
#     data = request.json
#     ip = data.get("ip")
#     if not ip:
#         return jsonify({"status": "error", "message": "IP required"}), 400
#     success, msg = block_ip(ip)
#     if success:
#         emit_event("device_blocked", {"ip": ip})
#     return jsonify({"status": "success" if success else "failed", "message": msg, "blocked_ip": ip})

# @app.route('/api/unblock', methods=['POST'])
# def unblock_device():
#     data = request.json
#     ip = data.get("ip")
#     if not ip:
#         return jsonify({"status": "error", "message": "IP required"}), 400
#     success, msg = unblock_ip(ip)
#     if success:
#         emit_event("device_unblocked", {"ip": ip})
#     return jsonify({"status": "success" if success else "failed", "message": msg, "unblocked_ip": ip})

# # -------------------- MyDevice Routes --------------------
# @app.route('/api/full_scan', methods=['GET'])
# def full_scan():
#     try:
#         system_info = get_system_info()
#         vulnerabilities = get_vulnerabilities()
#         return jsonify({"system_info": system_info, "vulnerabilities": vulnerabilities})
#     except Exception as e:
#         print("[ERROR] Full scan failed:", e)
#         return jsonify({"error": str(e)}), 500

# @app.route('/api/fix_vuln', methods=['POST'])
# def fix_vuln():
#     try:
#         vuln_id = request.json.get("id")
#         if not vuln_id:
#             return jsonify({"error": "Vulnerability ID required"}), 400
#         success = fix_vulnerability(vuln_id)
#         return jsonify({"id": vuln_id, "status": "fixed" if success else "not_fixed"})
#     except Exception as e:
#         return jsonify({"error": f"Fix failed: {str(e)}"}), 500

# @app.route("/api/report", methods=["GET"])
# def api_report():
#     try:
#         system_info = get_system_info()
#         vulnerabilities = get_vulnerabilities()
#         filename = f"cyberx_report_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
#         pdf_file = generate_pdf_report(system_info, vulnerabilities, filename=filename)
#         if not pdf_file:
#             return jsonify({"error": "Failed to generate PDF"}), 500
#         return send_file(pdf_file, as_attachment=True)
#     except Exception as e:
#         print("[ERROR] Report generation failed:", e)
#         return jsonify({"error": str(e)}), 500

# # -------------------- Individual Vulnerability Fixing Endpoints --------------------
# @app.route('/api/vulnerabilities/<string:vulnerability_id>/fix', methods=['POST'])
# def fix_single_vulnerability(vulnerability_id):
#     """Fix a single vulnerability on a device"""
#     try:
#         from connected_devices.services import fix_single_vulnerability as fix_vuln_service
        
#         data = request.get_json()
#         device_id = data.get('device_id') if data else None
        
#         if not device_id:
#             return jsonify({
#                 "status": "error",
#                 "message": "Device ID is required"
#             }), 400

#         # Extract vulnerability number from ID (format: vuln-{number}-{device_id})
#         parts = vulnerability_id.split('-')
#         if len(parts) >= 2 and parts[1].isdigit():
#             vuln_number = int(parts[1])
            
#             # Get device IP from store
#             from connected_devices.services import _load_store
#             store = _load_store()
#             device = store.get(device_id)
            
#             if not device:
#                 return jsonify({
#                     "status": "error",
#                     "message": "Device not found"
#                 }), 404
                
#             device_ip = device.get('ip')
#             if not device_ip:
#                 return jsonify({
#                     "status": "error",
#                     "message": "Device has no IP address"
#                 }), 400
            
#             # Fix the vulnerability
#             success, message = fix_vuln_service(vuln_number, device_ip)
            
#             # Emit socket event for real-time updates
#             emit_event("vulnerability_fix_attempt", {
#                 "vulnerability_id": vulnerability_id,
#                 "device_id": device_id,
#                 "status": "success" if success else "failed",
#                 "message": message
#             })
            
#             if success:
#                 return jsonify({
#                     "status": "success",
#                     "message": message,
#                     "vulnerability_id": vulnerability_id,
#                     "device_id": device_id
#                 })
#             else:
#                 return jsonify({
#                     "status": "failed",
#                     "message": message,
#                     "vulnerability_id": vulnerability_id,
#                     "device_id": device_id
#                 }), 400
                
#         else:
#             return jsonify({
#                 "status": "error",
#                 "message": "Invalid vulnerability ID format"
#             }), 400
        
#     except Exception as e:
#         print(f"[ERROR] Vulnerability fix failed: {e}")
#         return jsonify({"status": "error", "message": str(e)}), 500

# # -------------------- MITM Detection Routes --------------------
# @app.route('/api/mitm/start', methods=['POST'])
# @jwt_required()
# def start_mitm_detection():
#     """Start real-time MITM detection"""
#     try:
#         success = mitm_detector.start_detection()
#         if success:
#             emit_event("mitm_started", {"message": "MITM detection started"})
#             return jsonify({
#                 "status": "success", 
#                 "message": "MITM detection started"
#             })
#         else:
#             return jsonify({
#                 "status": "error", 
#                 "message": "MITM detection already running"
#             }), 400
#     except Exception as e:
#         return jsonify({"status": "error", "message": str(e)}), 500

# @app.route('/api/mitm/stop', methods=['POST'])
# @jwt_required()
# def stop_mitm_detection():
#     """Stop MITM detection"""
#     try:
#         success = mitm_detector.stop_detection()
#         if success:
#             emit_event("mitm_stopped", {"message": "MITM detection stopped"})
#             return jsonify({
#                 "status": "success", 
#                 "message": "MITM detection stopped"
#             })
#         else:
#             return jsonify({
#                 "status": "error", 
#                 "message": "MITM detection not running"
#             }), 400
#     except Exception as e:
#         return jsonify({"status": "error", "message": str(e)}), 500

# @app.route('/api/mitm/status', methods=['GET'])
# @jwt_required()
# def get_mitm_status():
#     """Get MITM detection status"""
#     try:
#         stats = mitm_detector.get_stats()
#         return jsonify({
#             "status": "success",
#             "mitm_detection": stats
#         })
#     except Exception as e:
#         return jsonify({"status": "error", "message": str(e)}), 500

# # -------------------- Health Check Endpoint --------------------
# @app.route('/api/health', methods=['GET'])
# def health_check():
#     """Health check endpoint for monitoring"""
#     try:
#         from connected_devices.services import _load_store
        
#         store = _load_store()
#         device_count = len(store)
        
#         return jsonify({
#             "status": "healthy",
#             "timestamp": datetime.datetime.now().isoformat(),
#             "device_count": device_count,
#             "services": {
#                 "vulnerability_scanning": "active",
#                 "device_monitoring": "active",
#                 "fix_engine": "active",
#                 "router_security": "active",
#                 "ids_monitoring": realtime_ids.is_running,
#                 "ids_packets_analyzed": realtime_ids.stats['total_packets'],
#                 "ids_threats_detected": realtime_ids.stats['malicious_packets']
#             },
#             "ids_stats": realtime_ids.get_stats()
#         })
#     except Exception as e:
#         return jsonify({
#             "status": "degraded",
#             "error": str(e),
#             "timestamp": datetime.datetime.now().isoformat()
#         }), 500

# # -------------------- Run App --------------------
# if __name__ == '__main__':
#     print("\n" + "="*60)
#     print("🚀 CyberX Backend Server Starting...")
#     print("="*60)
#     print("[INFO] ✅ All services initialized")
#     print("[INFO] 📍 Router Security Scanner: Ready")
#     print("[INFO] 🔧 Vulnerability Fixer: Ready") 
#     print("[INFO] 🔐 JWT Authentication: Ready")
#     print("[INFO] 📡 Socket.IO: Ready")
#     print("[INFO] 🚨 Real-time IDS Detection: Ready")
#     print("\n[INFO] Available Endpoints:")
#     print("[INFO]   POST /api/login - Login and get JWT token")
#     print("[INFO]   POST /api/ids/start - Start real-time IDS monitoring")
#     print("[INFO]   POST /api/ids/test-start - Test start IDS (no auth)")
#     print("[INFO]   POST /api/ids/stop - Stop IDS monitoring")
#     print("[INFO]   GET  /api/ids/status - Get IDS status (no auth)")
#     print("[INFO]   GET  /api/ids/stats - Get real-time statistics")
#     print("[INFO]   POST /api/ids/block-attacker - Block attacker")
#     print("[INFO]   GET  /api/health - Health check with real-time stats")
#     print("\n[INFO] 🔑 Default test credentials: admin/admin")
#     print("="*60)
    
#     socketio.run(app, host="0.0.0.0", port=5000, debug=True)






# # backend/app.py
# import eventlet
# eventlet.monkey_patch()

# import os
# import datetime
# import time
# import subprocess
# from flask import Flask, request, jsonify, send_file
# from flask_cors import CORS
# from flask_socketio import SocketIO, emit
# from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, create_access_token

# # Local modules
# from sniffer import (
#     start_sniffer, stop_sniffer, clear_traffic,
#     block_ip, unblock_ip,
#     get_last_events, get_malicious_events, export_logs
# )
# from mydevice import (
#     get_system_info,
#     get_vulnerabilities,
#     fix_vulnerability
# )
# from mydevice.report_generator import generate_pdf_report
# from connected_devices.routes import create_devices_blueprint

# # Router Security Modules
# from router.scanner import RouterScanner
# from router.fixer import VulnerabilityFixer

# # -------------------- App Setup --------------------
# app = Flask(__name__)
# CORS(app, supports_credentials=True, origins=["http://localhost:8080", "http://localhost:3000"])

# app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'cyberx-security-backend')
# app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'cyberx-jwt-secret-key-2024')
# app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(hours=24)
# app.config['JWT_TOKEN_LOCATION'] = ['headers']

# jwt = JWTManager(app)

# # Configure SocketIO with proper CORS and async mode
# socketio = SocketIO(app, 
#                    cors_allowed_origins=["http://localhost:8080", "http://localhost:3000", "http://localhost:5173"],
#                    async_mode='eventlet',
#                    logger=True,
#                    engineio_logger=True,
#                    ping_timeout=60,
#                    ping_interval=25)

# # Initialize Router Security
# router_scanner = RouterScanner()
# vulnerability_fixer = VulnerabilityFixer()

# # Register blueprints
# app.register_blueprint(create_devices_blueprint("devices_bp"), url_prefix="/api/devices")
# app.register_blueprint(create_devices_blueprint("dp_devices_bp"), url_prefix="/api/dp/devices")

# # -------------------- SocketIO Event Handlers --------------------
# @socketio.on('connect')
# def handle_connect():
#     print(f"[SOCKET] Client connected: {request.sid}")
#     emit('connected', {'message': 'Successfully connected to CyberX', 'status': 'connected'})

# @socketio.on('disconnect')
# def handle_disconnect():
#     print(f"[SOCKET] Client disconnected: {request.sid}")

# def emit_event(event: str, data: dict):
#     try:
#         socketio.emit(event, data)
#         print(f"[SOCKET] Emitted {event}: {data.get('message', 'No message')}")
#     except Exception as e:
#         print(f"[SOCKET ERROR] Emit failed: {e}")

# # -------------------- CORS Preflight Handler --------------------
# @app.after_request
# def after_request(response):
#     response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
#     response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
#     return response

# @app.route('/', methods=['OPTIONS'])
# @app.route('/api/<path:path>', methods=['OPTIONS'])
# def options_handler(path=None):
#     return '', 200

# # -------------------- JWT Error Handlers --------------------
# @jwt.unauthorized_loader
# def missing_token_callback(error):
#     return jsonify({
#         "status": "error",
#         "message": "Missing authorization token"
#     }), 401

# @jwt.invalid_token_loader
# def invalid_token_callback(error):
#     return jsonify({
#         "status": "error", 
#         "message": "Invalid token"
#     }), 401

# @jwt.expired_token_loader
# def expired_token_callback(jwt_header, jwt_payload):
#     return jsonify({
#         "status": "error",
#         "message": "Token has expired"
#     }), 401

# # -------------------- Routes --------------------
# @app.route('/')
# def index():
#     return "✅ CyberX Backend Running (Live Monitoring + Router Security + Real-time IDS)"

# # -------------------- Router Security Routes --------------------
# @app.route('/api/scan-router', methods=['POST'])
# @jwt_required()
# def scan_router():
#     """Perform live router security scan"""
#     try:
#         current_user = get_jwt_identity()
#         print(f"[SCAN] Router scan started by user: {current_user}")
        
#         emit_event("router_scan_started", {"message": "Router security scan started"})
        
#         # Perform the actual scan
#         scan_result = router_scanner.perform_comprehensive_scan()
#         print(f"[SCAN] Scan completed. Found {len(scan_result.get('vulnerabilities', []))} vulnerabilities")
        
#         emit_event("router_scan_completed", {
#             "vulnerabilities_found": len(scan_result.get('vulnerabilities', [])),
#             "router_info": scan_result.get('router_info', {})
#         })
        
#         return jsonify({
#             "status": "success",
#             "routerInfo": scan_result.get('router_info', {}),
#             "vulnerabilities": scan_result.get('vulnerabilities', [])
#         })
        
#     except Exception as e:
#         print(f"[ERROR] Router scan failed: {e}")
#         import traceback
#         traceback.print_exc()
#         return jsonify({"status": "error", "message": str(e)}), 500

# @app.route('/api/fix-vulnerability/<vuln_id>', methods=['POST'])
# @jwt_required()
# def fix_router_vulnerability(vuln_id):
#     """Fix specific router vulnerability"""
#     try:
#         current_user = get_jwt_identity()
#         print(f"[FIX] Fixing vulnerability {vuln_id} for user: {current_user}")
        
#         result = vulnerability_fixer.fix_vulnerability(vuln_id)
        
#         if result['success']:
#             emit_event("vulnerability_fixed", {
#                 "vulnerability_id": vuln_id,
#                 "message": result['message']
#             })
#             return jsonify({
#                 "status": "success", 
#                 "message": result['message']
#             })
#         else:
#             return jsonify({
#                 "status": "error", 
#                 "message": result['message']
#             }), 400
            
#     except Exception as e:
#         print(f"[ERROR] Fix vulnerability failed: {e}")
#         return jsonify({"status": "error", "message": str(e)}), 500

# @app.route('/api/fix-all-router-vulnerabilities', methods=['POST'])
# @jwt_required()
# def fix_all_router_vulnerabilities():
#     """Batch fix all auto-fixable router vulnerabilities"""
#     try:
#         current_user = get_jwt_identity()
#         data = request.get_json() or {}
#         vulnerabilities = data.get('vulnerabilities', [])
        
#         print(f"[BATCH FIX] Fixing {len(vulnerabilities)} vulnerabilities for user: {current_user}")
        
#         results = vulnerability_fixer.batch_fix_vulnerabilities(vulnerabilities)
        
#         emit_event("batch_fix_completed", {
#             "successful_fixes": results['successful_fixes'],
#             "failed_fixes": results['failed_fixes']
#         })
        
#         return jsonify({
#             "status": "success",
#             "message": f"Fixed {results['successful_fixes']} vulnerabilities",
#             "results": results
#         })
        
#     except Exception as e:
#         print(f"[ERROR] Batch fix failed: {e}")
#         return jsonify({"status": "error", "message": str(e)}), 500

# @app.route('/api/router-vulnerabilities', methods=['GET'])
# @jwt_required()
# def get_router_vulnerabilities():
#     """Get current router vulnerabilities"""
#     try:
#         vulnerabilities = router_scanner.get_current_vulnerabilities()
#         return jsonify({
#             "status": "success",
#             "vulnerabilities": vulnerabilities
#         })
#     except Exception as e:
#         print(f"[ERROR] Get vulnerabilities failed: {e}")
#         return jsonify({"status": "error", "message": str(e)}), 500

# @app.route('/api/router-info', methods=['GET'])
# @jwt_required()
# def get_router_info():
#     """Get current router information"""
#     try:
#         router_info = router_scanner.get_router_info()
#         return jsonify({
#             "status": "success",
#             "routerInfo": router_info
#         })
#     except Exception as e:
#         print(f"[ERROR] Get router info failed: {e}")
#         return jsonify({"status": "error", "message": str(e)}), 500

# @app.route('/api/router-security-report', methods=['GET'])
# @jwt_required()
# def generate_router_security_report():
#     """Generate PDF security report for router"""
#     try:
#         from router.report_generator import RouterReportGenerator
        
#         current_user = get_jwt_identity()
#         print(f"[REPORT] Generating security report for user: {current_user}")
        
#         # Get current scan results or perform new scan
#         scan_result = router_scanner.perform_comprehensive_scan()
        
#         # Generate PDF report
#         report_generator = RouterReportGenerator()
#         filename = f"router_security_report_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
#         pdf_file = report_generator.generate_pdf_report(scan_result, filename)
        
#         if pdf_file and os.path.exists(pdf_file):
#             return send_file(
#                 pdf_file,
#                 as_attachment=True,
#                 download_name=os.path.basename(pdf_file),
#                 mimetype='application/pdf'
#             )
#         else:
#             return jsonify({
#                 "status": "error", 
#                 "message": "Failed to generate PDF report"
#             }), 500
        
#     except Exception as e:
#         print(f"[ERROR] Report generation failed: {e}")
#         import traceback
#         traceback.print_exc()
#         return jsonify({"status": "error", "message": str(e)}), 500

# # -------------------- Authentication Routes --------------------
# @app.route('/api/login', methods=['POST'])
# def login():
#     """Simple login endpoint for testing"""
#     try:
#         data = request.get_json()
#         username = data.get('username', 'admin')
#         password = data.get('password', 'admin')
        
#         # Simple authentication (replace with your actual auth logic)
#         if username == 'admin' and password == 'admin':
#             access_token = create_access_token(identity=username)
#             return jsonify({
#                 "status": "success",
#                 "message": "Login successful",
#                 "access_token": access_token,
#                 "user": username
#             })
#         else:
#             return jsonify({
#                 "status": "error",
#                 "message": "Invalid credentials"
#             }), 401
            
#     except Exception as e:
#         return jsonify({
#             "status": "error",
#             "message": str(e)
#         }), 500

# # -------------------- Traffic Monitoring Routes --------------------
# @app.route('/api/logs', methods=['GET'])
# def get_logs():
#     return jsonify(get_last_events(200))

# @app.route('/api/malicious', methods=['GET'])
# def get_malicious():
#     return jsonify(get_malicious_events(200))

# @app.route('/api/export', methods=['GET'])
# def export():
#     filename = f"traffic_export_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
#     export_logs(filename)
#     return send_file(filename, as_attachment=True)

# @app.route('/api/clear', methods=['POST'])
# def clear_logs():
#     clear_traffic()
#     emit_event("traffic_cleared", {"message": "Traffic cleared"})
#     return jsonify({"status": "success", "message": "Traffic cleared"})

# @app.route('/api/start_monitor', methods=['POST'])
# def start_monitor():
#     iface = start_sniffer()
#     if iface:
#         return jsonify({"status": "success", "message": f"Sniffer started on {iface}"})
#     return jsonify({"status": "failed", "message": "Sniffer already running"})

# @app.route('/api/stop_monitor', methods=['POST'])
# def stop_monitor():
#     stopped = stop_sniffer()
#     return jsonify({"status": "success" if stopped else "failed", "message": "Sniffer stopped" if stopped else "Sniffer was not running"})

# @app.route('/api/block', methods=['POST'])
# def block_device():
#     data = request.json
#     ip = data.get("ip")
#     if not ip:
#         return jsonify({"status": "error", "message": "IP required"}), 400
#     success, msg = block_ip(ip)
#     if success:
#         emit_event("device_blocked", {"ip": ip})
#     return jsonify({"status": "success" if success else "failed", "message": msg, "blocked_ip": ip})

# @app.route('/api/unblock', methods=['POST'])
# def unblock_device():
#     data = request.json
#     ip = data.get("ip")
#     if not ip:
#         return jsonify({"status": "error", "message": "IP required"}), 400
#     success, msg = unblock_ip(ip)
#     if success:
#         emit_event("device_unblocked", {"ip": ip})
#     return jsonify({"status": "success" if success else "failed", "message": msg, "unblocked_ip": ip})

# # -------------------- MyDevice Routes --------------------
# @app.route('/api/full_scan', methods=['GET'])
# def full_scan():
#     try:
#         system_info = get_system_info()
#         vulnerabilities = get_vulnerabilities()
#         return jsonify({"system_info": system_info, "vulnerabilities": vulnerabilities})
#     except Exception as e:
#         print("[ERROR] Full scan failed:", e)
#         return jsonify({"error": str(e)}), 500

# @app.route('/api/fix_vuln', methods=['POST'])
# def fix_vuln():
#     try:
#         vuln_id = request.json.get("id")
#         if not vuln_id:
#             return jsonify({"error": "Vulnerability ID required"}), 400
#         success = fix_vulnerability(vuln_id)
#         return jsonify({"id": vuln_id, "status": "fixed" if success else "not_fixed"})
#     except Exception as e:
#         return jsonify({"error": f"Fix failed: {str(e)}"}), 500

# @app.route("/api/report", methods=["GET"])
# def api_report():
#     try:
#         system_info = get_system_info()
#         vulnerabilities = get_vulnerabilities()
#         filename = f"cyberx_report_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
#         pdf_file = generate_pdf_report(system_info, vulnerabilities, filename=filename)
#         if not pdf_file:
#             return jsonify({"error": "Failed to generate PDF"}), 500
#         return send_file(pdf_file, as_attachment=True)
#     except Exception as e:
#         print("[ERROR] Report generation failed:", e)
#         return jsonify({"error": str(e)}), 500

# # -------------------- Individual Vulnerability Fixing Endpoints --------------------
# @app.route('/api/vulnerabilities/<string:vulnerability_id>/fix', methods=['POST'])
# def fix_single_vulnerability(vulnerability_id):
#     """Fix a single vulnerability on a device"""
#     try:
#         from connected_devices.services import fix_single_vulnerability as fix_vuln_service
        
#         data = request.get_json()
#         device_id = data.get('device_id') if data else None
        
#         if not device_id:
#             return jsonify({
#                 "status": "error",
#                 "message": "Device ID is required"
#             }), 400

#         # Extract vulnerability number from ID (format: vuln-{number}-{device_id})
#         parts = vulnerability_id.split('-')
#         if len(parts) >= 2 and parts[1].isdigit():
#             vuln_number = int(parts[1])
            
#             # Get device IP from store
#             from connected_devices.services import _load_store
#             store = _load_store()
#             device = store.get(device_id)
            
#             if not device:
#                 return jsonify({
#                     "status": "error",
#                     "message": "Device not found"
#                 }), 404
                
#             device_ip = device.get('ip')
#             if not device_ip:
#                 return jsonify({
#                     "status": "error",
#                     "message": "Device has no IP address"
#                 }), 400
            
#             # Fix the vulnerability
#             success, message = fix_vuln_service(vuln_number, device_ip)
            
#             # Emit socket event for real-time updates
#             emit_event("vulnerability_fix_attempt", {
#                 "vulnerability_id": vulnerability_id,
#                 "device_id": device_id,
#                 "status": "success" if success else "failed",
#                 "message": message
#             })
            
#             if success:
#                 return jsonify({
#                     "status": "success",
#                     "message": message,
#                     "vulnerability_id": vulnerability_id,
#                     "device_id": device_id
#                 })
#             else:
#                 return jsonify({
#                     "status": "failed",
#                     "message": message,
#                     "vulnerability_id": vulnerability_id,
#                     "device_id": device_id
#                 }), 400
                
#         else:
#             return jsonify({
#                 "status": "error",
#                 "message": "Invalid vulnerability ID format"
#             }), 400
        
#     except Exception as e:
#         print(f"[ERROR] Vulnerability fix failed: {e}")
#         return jsonify({"status": "error", "message": str(e)}), 500

# # -------------------- Health Check Endpoint --------------------
# @app.route('/api/health', methods=['GET'])
# def health_check():
#     """Health check endpoint for monitoring"""
#     try:
#         from connected_devices.services import _load_store
        
#         store = _load_store()
#         device_count = len(store)
        
#         health_data = {
#             "status": "healthy",
#             "timestamp": datetime.datetime.now().isoformat(),
#             "device_count": device_count,
#             "services": {
#                 "vulnerability_scanning": "active",
#                 "device_monitoring": "active",
#                 "fix_engine": "active",
#                 "router_security": "active"
#             }
#         }
            
#         return jsonify(health_data)
        
#     except Exception as e:
#         return jsonify({
#             "status": "degraded",
#             "error": str(e),
#             "timestamp": datetime.datetime.now().isoformat()
#         }), 500

# # -------------------- Run App --------------------
# if __name__ == '__main__':
#     print("\n" + "="*60)
#     print("🚀 CyberX Backend Server Starting...")
#     print("="*60)
#     print("[INFO] ✅ All services initialized")
#     print("[INFO] 📍 Router Security Scanner: Ready")
#     print("[INFO] 🔧 Vulnerability Fixer: Ready") 
#     print("[INFO] 🔐 JWT Authentication: Ready")
#     print("[INFO] 📡 Socket.IO: Ready")
#     print("\n[INFO] Available Endpoints:")
#     print("[INFO]   POST /api/login - Login and get JWT token")
#     print("[INFO]   POST /api/scan-router - Scan router for vulnerabilities")
#     print("[INFO]   POST /api/fix-vulnerability/<id> - Fix specific vulnerability")
#     print("[INFO]   GET  /api/health - Health check with stats")
#     print("\n[INFO] 🔑 Default test credentials: admin/admin")
#     print("="*60)
    
#     socketio.run(app, host="0.0.0.0", port=5000, debug=True)




















# # backend/app.py
# import eventlet
# eventlet.monkey_patch()

# import os
# import datetime
# import time
# import subprocess
# import threading
# from flask import Flask, request, jsonify, send_file
# from flask_cors import CORS
# from flask_socketio import SocketIO, emit
# from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, create_access_token

# # Local modules
# from sniffer import (
#     start_sniffer, stop_sniffer, clear_traffic,
#     block_ip, unblock_ip,
#     get_last_events, get_malicious_events, export_logs
# )
# from mydevice import (
#     get_system_info,
#     get_vulnerabilities,
#     fix_vulnerability
# )
# from mydevice.report_generator import generate_pdf_report
# from connected_devices.routes import create_devices_blueprint

# # Router Security Modules
# from router.scanner import RouterScanner
# from router.fixer import VulnerabilityFixer

# # -------------------- App Setup --------------------
# app = Flask(__name__)
# CORS(app, supports_credentials=True, origins=["http://localhost:8080", "http://localhost:3000"])

# app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'cyberx-security-backend')
# app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'cyberx-jwt-secret-key-2024')
# app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(hours=24)
# app.config['JWT_TOKEN_LOCATION'] = ['headers']

# jwt = JWTManager(app)

# # Configure SocketIO with proper CORS and async mode
# socketio = SocketIO(app, 
#                    cors_allowed_origins=["http://localhost:8080", "http://localhost:3000", "http://localhost:5173"],
#                    async_mode='eventlet',
#                    logger=True,
#                    engineio_logger=True,
#                    ping_timeout=60,
#                    ping_interval=25)

# # Initialize Router Security
# router_scanner = RouterScanner()
# vulnerability_fixer = VulnerabilityFixer()

# # Global scan state management
# scan_state = {
#     'active_scans': set(),
#     'scan_lock': threading.Lock(),
#     'stop_requested': False
# }

# # Register blueprints
# app.register_blueprint(create_devices_blueprint("devices_bp"), url_prefix="/api/devices")
# app.register_blueprint(create_devices_blueprint("dp_devices_bp"), url_prefix="/api/dp/devices")

# # -------------------- SocketIO Event Handlers --------------------
# @socketio.on('connect')
# def handle_connect():
#     print(f"[SOCKET] Client connected: {request.sid}")
#     emit('connected', {'message': 'Successfully connected to CyberX', 'status': 'connected'})

# @socketio.on('disconnect')
# def handle_disconnect():
#     print(f"[SOCKET] Client disconnected: {request.sid}")

# def emit_event(event: str, data: dict):
#     try:
#         socketio.emit(event, data)
#         print(f"[SOCKET] Emitted {event}: {data.get('message', 'No message')}")
#     except Exception as e:
#         print(f"[SOCKET ERROR] Emit failed: {e}")

# # -------------------- CORS Preflight Handler --------------------
# @app.after_request
# def after_request(response):
#     response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
#     response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
#     return response

# @app.route('/', methods=['OPTIONS'])
# @app.route('/api/<path:path>', methods=['OPTIONS'])
# def options_handler(path=None):
#     return '', 200

# # -------------------- JWT Error Handlers --------------------
# @jwt.unauthorized_loader
# def missing_token_callback(error):
#     return jsonify({
#         "status": "error",
#         "message": "Missing authorization token"
#     }), 401

# @jwt.invalid_token_loader
# def invalid_token_callback(error):
#     return jsonify({
#         "status": "error", 
#         "message": "Invalid token"
#     }), 401

# @jwt.expired_token_loader
# def expired_token_callback(jwt_header, jwt_payload):
#     return jsonify({
#         "status": "error",
#         "message": "Token has expired"
#     }), 401

# # -------------------- Routes --------------------
# @app.route('/')
# def index():
#     return "✅ CyberX Backend Running (Live Monitoring + Router Security + Real-time IDS)"

# # -------------------- Enhanced Router Security Routes --------------------
# @app.route('/api/scan-router', methods=['POST'])
# @jwt_required()
# def scan_router():
#     """Perform live router security scan"""
#     try:
#         current_user = get_jwt_identity()
#         print(f"[SCAN] Router scan started by user: {current_user}")
        
#         emit_event("router_scan_started", {"message": "Router security scan started"})
        
#         # Perform the actual scan
#         scan_result = router_scanner.perform_comprehensive_scan()
#         print(f"[SCAN] Scan completed. Found {len(scan_result.get('vulnerabilities', []))} vulnerabilities")
        
#         emit_event("router_scan_completed", {
#             "vulnerabilities_found": len(scan_result.get('vulnerabilities', [])),
#             "router_info": scan_result.get('router_info', {})
#         })
        
#         return jsonify({
#             "status": "success",
#             "routerInfo": scan_result.get('router_info', {}),
#             "vulnerabilities": scan_result.get('vulnerabilities', [])
#         })
        
#     except Exception as e:
#         print(f"[ERROR] Router scan failed: {e}")
#         import traceback
#         traceback.print_exc()
#         return jsonify({"status": "error", "message": str(e)}), 500

# @app.route('/api/fix-vulnerability/<vuln_id>', methods=['POST'])
# @jwt_required()
# def fix_router_vulnerability(vuln_id):
#     """Fix specific router vulnerability"""
#     try:
#         current_user = get_jwt_identity()
#         print(f"[FIX] Fixing vulnerability {vuln_id} for user: {current_user}")
        
#         result = vulnerability_fixer.fix_vulnerability(vuln_id)
        
#         if result['success']:
#             emit_event("vulnerability_fixed", {
#                 "vulnerability_id": vuln_id,
#                 "message": result['message']
#             })
#             return jsonify({
#                 "status": "success", 
#                 "message": result['message']
#             })
#         else:
#             return jsonify({
#                 "status": "error", 
#                 "message": result['message']
#             }), 400
            
#     except Exception as e:
#         print(f"[ERROR] Fix vulnerability failed: {e}")
#         return jsonify({"status": "error", "message": str(e)}), 500

# @app.route('/api/fix-all-router-vulnerabilities', methods=['POST'])
# @jwt_required()
# def fix_all_router_vulnerabilities():
#     """Batch fix all auto-fixable router vulnerabilities"""
#     try:
#         current_user = get_jwt_identity()
#         data = request.get_json() or {}
#         vulnerabilities = data.get('vulnerabilities', [])
        
#         print(f"[BATCH FIX] Fixing {len(vulnerabilities)} vulnerabilities for user: {current_user}")
        
#         results = vulnerability_fixer.batch_fix_vulnerabilities(vulnerabilities)
        
#         emit_event("batch_fix_completed", {
#             "successful_fixes": results['successful_fixes'],
#             "failed_fixes": results['failed_fixes']
#         })
        
#         return jsonify({
#             "status": "success",
#             "message": f"Fixed {results['successful_fixes']} vulnerabilities",
#             "results": results
#         })
        
#     except Exception as e:
#         print(f"[ERROR] Batch fix failed: {e}")
#         return jsonify({"status": "error", "message": str(e)}), 500

# @app.route('/api/router-vulnerabilities', methods=['GET'])
# @jwt_required()
# def get_router_vulnerabilities():
#     """Get current router vulnerabilities"""
#     try:
#         vulnerabilities = router_scanner.get_current_vulnerabilities()
#         return jsonify({
#             "status": "success",
#             "vulnerabilities": vulnerabilities
#         })
#     except Exception as e:
#         print(f"[ERROR] Get vulnerabilities failed: {e}")
#         return jsonify({"status": "error", "message": str(e)}), 500

# @app.route('/api/router-info', methods=['GET'])
# @jwt_required()
# def get_router_info():
#     """Get current router information"""
#     try:
#         router_info = router_scanner.get_router_info()
#         return jsonify({
#             "status": "success",
#             "routerInfo": router_info
#         })
#     except Exception as e:
#         print(f"[ERROR] Get router info failed: {e}")
#         return jsonify({"status": "error", "message": str(e)}), 500

# @app.route('/api/router-security-report', methods=['GET'])
# @jwt_required()
# def generate_router_security_report():
#     """Generate PDF security report for router"""
#     try:
#         from router.report_generator import RouterReportGenerator
        
#         current_user = get_jwt_identity()
#         print(f"[REPORT] Generating security report for user: {current_user}")
        
#         # Get current scan results or perform new scan
#         scan_result = router_scanner.perform_comprehensive_scan()
        
#         # Generate PDF report
#         report_generator = RouterReportGenerator()
#         filename = f"router_security_report_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
#         pdf_file = report_generator.generate_pdf_report(scan_result, filename)
        
#         if pdf_file and os.path.exists(pdf_file):
#             return send_file(
#                 pdf_file,
#                 as_attachment=True,
#                 download_name=os.path.basename(pdf_file),
#                 mimetype='application/pdf'
#             )
#         else:
#             return jsonify({
#                 "status": "error", 
#                 "message": "Failed to generate PDF report"
#             }), 500
        
#     except Exception as e:
#         print(f"[ERROR] Report generation failed: {e}")
#         import traceback
#         traceback.print_exc()
#         return jsonify({"status": "error", "message": str(e)}), 500

# # -------------------- Enhanced Device Scanning Routes --------------------
# @app.route('/api/scan-device/<device_id>', methods=['POST'])
# @jwt_required()
# def scan_single_device(device_id):
#     """Enhanced individual device scanning with comprehensive vulnerability detection"""
#     try:
#         current_user = get_jwt_identity()
        
#         # Check if scan is already running for this device
#         with scan_state['scan_lock']:
#             if device_id in scan_state['active_scans']:
#                 return jsonify({
#                     "status": "error",
#                     "message": "Scan already in progress for this device"
#                 }), 409
#             scan_state['active_scans'].add(device_id)
#             scan_state['stop_requested'] = False
        
#         print(f"[SCAN] Starting comprehensive scan for device {device_id} by user: {current_user}")
        
#         emit_event("device_scan_started", {
#             "device_id": device_id,
#             "message": "Starting comprehensive vulnerability scan"
#         })
        
#         # Simulate comprehensive scanning process
#         def perform_scan():
#             try:
#                 # Step 1: Port scanning
#                 emit_event("device_scan_progress", {
#                     "device_id": device_id,
#                     "progress": 25,
#                     "current_task": "Port scanning in progress...",
#                     "status": "scanning"
#                 })
#                 time.sleep(1)
                
#                 if scan_state['stop_requested']:
#                     return
                
#                 # Step 2: Service detection
#                 emit_event("device_scan_progress", {
#                     "device_id": device_id,
#                     "progress": 50,
#                     "current_task": "Service detection...",
#                     "status": "scanning"
#                 })
#                 time.sleep(1)
                
#                 if scan_state['stop_requested']:
#                     return
                
#                 # Step 3: Vulnerability assessment
#                 emit_event("device_scan_progress", {
#                     "device_id": device_id,
#                     "progress": 75,
#                     "current_task": "Vulnerability assessment...",
#                     "status": "scanning"
#                 })
#                 time.sleep(1)
                
#                 if scan_state['stop_requested']:
#                     return
                
#                 # Step 4: Analysis and reporting
#                 emit_event("device_scan_progress", {
#                     "device_id": device_id,
#                     "progress": 100,
#                     "current_task": "Generating report...",
#                     "status": "completed"
#                 })
                
#                 # Comprehensive vulnerabilities with fixability information
#                 vulnerabilities = [
#                     {
#                         "id": f"vuln-1-{device_id}",
#                         "name": "Weak SSH Configuration",
#                         "description": "SSH service using weak encryption algorithms",
#                         "severity": "high",
#                         "category": "auto-fixable",
#                         "fix_method": "Update SSH configuration",
#                         "potential_harm": "Unauthorized access to device",
#                         "status": "found"
#                     },
#                     {
#                         "id": f"vuln-2-{device_id}",
#                         "name": "Outdated Firmware",
#                         "description": "Device running outdated firmware version",
#                         "severity": "critical",
#                         "category": "manual",
#                         "fix_method": "Manual firmware update required",
#                         "manual_steps": [
#                             "Download latest firmware from manufacturer website",
#                             "Backup current configuration",
#                             "Upload and install new firmware",
#                             "Restore configuration"
#                         ],
#                         "potential_harm": "Security vulnerabilities in outdated firmware",
#                         "status": "found"
#                     },
#                     {
#                         "id": f"vuln-3-{device_id}",
#                         "name": "Open Telnet Port",
#                         "description": "Telnet service running on port 23 (insecure)",
#                         "severity": "medium",
#                         "category": "auto-fixable",
#                         "fix_method": "Disable telnet service",
#                         "potential_harm": "Cleartext credential transmission",
#                         "status": "found"
#                     }
#                 ]
                
#                 emit_event("device_scan_completed", {
#                     "device_id": device_id,
#                     "vulnerabilities_found": len(vulnerabilities),
#                     "message": "Comprehensive scan completed successfully"
#                 })
                
#             except Exception as e:
#                 print(f"[SCAN ERROR] Device scan failed: {e}")
#                 emit_event("device_scan_failed", {
#                     "device_id": device_id,
#                     "message": f"Scan failed: {str(e)}"
#                 })
#             finally:
#                 with scan_state['scan_lock']:
#                     scan_state['active_scans'].discard(device_id)
        
#         # Run scan in background thread
#         scan_thread = threading.Thread(target=perform_scan)
#         scan_thread.daemon = True
#         scan_thread.start()
        
#         return jsonify({
#             "status": "success",
#             "message": "Device scan started successfully",
#             "device_id": device_id
#         })
        
#     except Exception as e:
#         with scan_state['scan_lock']:
#             scan_state['active_scans'].discard(device_id)
#         print(f"[ERROR] Device scan initiation failed: {e}")
#         return jsonify({"status": "error", "message": str(e)}), 500

# @app.route('/api/deep-iot-scan', methods=['POST'])
# @jwt_required()
# def deep_iot_scan():
#     """Perform deep IoT vulnerability scan across all devices"""
#     try:
#         current_user = get_jwt_identity()
#         print(f"[DEEP SCAN] Starting deep IoT scan by user: {current_user}")
        
#         with scan_state['scan_lock']:
#             if scan_state['stop_requested']:
#                 scan_state['stop_requested'] = False
#             scan_state['active_scans'].add('deep_iot_scan')
        
#         emit_event("deep_scan_started", {
#             "message": "Starting deep IoT vulnerability scan across all devices"
#         })
        
#         def perform_deep_scan():
#             try:
#                 # Simulate deep IoT scanning process
#                 total_devices = 5  # Example device count
#                 vulnerabilities_found = 0
                
#                 for i in range(total_devices):
#                     if scan_state['stop_requested']:
#                         break
                    
#                     progress = (i + 1) * 100 // total_devices
#                     emit_event("deep_scan_progress", {
#                         "progress": progress,
#                         "current_device": f"Device {i+1}",
#                         "devices_scanned": i + 1,
#                         "total_devices": total_devices,
#                         "status": "scanning"
#                     })
                    
#                     # Simulate device scanning
#                     time.sleep(2)
                    
#                     # Add vulnerabilities for this device
#                     vulnerabilities_found += 3  # Example count
                
#                 if not scan_state['stop_requested']:
#                     emit_event("deep_scan_completed", {
#                         "total_devices_scanned": total_devices,
#                         "total_vulnerabilities_found": vulnerabilities_found,
#                         "message": "Deep IoT scan completed successfully"
#                     })
#                 else:
#                     emit_event("deep_scan_stopped", {
#                         "message": "Deep IoT scan stopped by user"
#                     })
                    
#             except Exception as e:
#                 print(f"[DEEP SCAN ERROR] Deep scan failed: {e}")
#                 emit_event("deep_scan_failed", {
#                     "message": f"Deep scan failed: {str(e)}"
#                 })
#             finally:
#                 with scan_state['scan_lock']:
#                     scan_state['active_scans'].discard('deep_iot_scan')
        
#         # Run deep scan in background thread
#         deep_scan_thread = threading.Thread(target=perform_deep_scan)
#         deep_scan_thread.daemon = True
#         deep_scan_thread.start()
        
#         return jsonify({
#             "status": "success",
#             "message": "Deep IoT scan started successfully"
#         })
        
#     except Exception as e:
#         with scan_state['scan_lock']:
#             scan_state['active_scans'].discard('deep_iot_scan')
#         print(f"[ERROR] Deep IoT scan initiation failed: {e}")
#         return jsonify({"status": "error", "message": str(e)}), 500

# @app.route('/api/stop-all-scans', methods=['POST'])
# @jwt_required()
# def stop_all_scans():
#     """Enhanced stop all scans functionality"""
#     try:
#         current_user = get_jwt_identity()
#         print(f"[STOP] Stopping all scans by user: {current_user}")
        
#         with scan_state['scan_lock']:
#             scan_state['stop_requested'] = True
#             active_scans_count = len(scan_state['active_scans'])
#             scan_state['active_scans'].clear()
        
#         emit_event("all_scans_stopped", {
#             "message": f"All scans stopped successfully",
#             "active_scans_stopped": active_scans_count
#         })
        
#         return jsonify({
#             "status": "success",
#             "message": f"Stopped {active_scans_count} active scans",
#             "stopped_scans": active_scans_count
#         })
        
#     except Exception as e:
#         print(f"[ERROR] Stop all scans failed: {e}")
#         return jsonify({"status": "error", "message": str(e)}), 500

# # -------------------- Enhanced Report Generation --------------------
# @app.route('/api/device-report/<device_id>', methods=['GET'])
# @jwt_required()
# def generate_device_report(device_id):
#     """Generate comprehensive PDF report for a specific device"""
#     try:
#         current_user = get_jwt_identity()
#         print(f"[REPORT] Generating device report for {device_id} by user: {current_user}")
        
#         # Get device information (you'll need to implement this based on your data structure)
#         device_info = {
#             "name": f"Device_{device_id}",
#             "ip": "192.168.1.100",  # Example
#             "mac": "00:1B:44:11:3A:B7",  # Example
#             "type": "iot",
#             "vendor": "Example Vendor",
#             "risk_level": "high"
#         }
        
#         # Get vulnerabilities (you'll need to implement this based on your data structure)
#         vulnerabilities = [
#             {
#                 "name": "Weak SSH Configuration",
#                 "description": "SSH service using weak encryption algorithms",
#                 "severity": "high",
#                 "category": "auto-fixable",
#                 "fix_method": "Update SSH configuration",
#                 "potential_harm": "Unauthorized access to device"
#             },
#             {
#                 "name": "Outdated Firmware",
#                 "description": "Device running outdated firmware version",
#                 "severity": "critical",
#                 "category": "manual",
#                 "fix_method": "Manual firmware update required",
#                 "manual_steps": [
#                     "Download latest firmware from manufacturer website",
#                     "Backup current configuration",
#                     "Upload and install new firmware",
#                     "Restore configuration"
#                 ],
#                 "potential_harm": "Security vulnerabilities in outdated firmware"
#             }
#         ]
        
#         # Generate PDF report
#         filename = f"device_security_report_{device_id}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
#         pdf_file = generate_pdf_report(device_info, vulnerabilities, filename=filename)
        
#         if pdf_file and os.path.exists(pdf_file):
#             return send_file(
#                 pdf_file,
#                 as_attachment=True,
#                 download_name=os.path.basename(pdf_file),
#                 mimetype='application/pdf'
#             )
#         else:
#             return jsonify({
#                 "status": "error", 
#                 "message": "Failed to generate PDF report"
#             }), 500
        
#     except Exception as e:
#         print(f"[ERROR] Device report generation failed: {e}")
#         return jsonify({"status": "error", "message": str(e)}), 500

# # -------------------- Authentication Routes --------------------
# @app.route('/api/login', methods=['POST'])
# def login():
#     """Simple login endpoint for testing"""
#     try:
#         data = request.get_json()
#         username = data.get('username', 'admin')
#         password = data.get('password', 'admin')
        
#         # Simple authentication (replace with your actual auth logic)
#         if username == 'admin' and password == 'admin':
#             access_token = create_access_token(identity=username)
#             return jsonify({
#                 "status": "success",
#                 "message": "Login successful",
#                 "access_token": access_token,
#                 "user": username
#             })
#         else:
#             return jsonify({
#                 "status": "error",
#                 "message": "Invalid credentials"
#             }), 401
            
#     except Exception as e:
#         return jsonify({
#             "status": "error",
#             "message": str(e)
#         }), 500

# # -------------------- Traffic Monitoring Routes --------------------
# @app.route('/api/logs', methods=['GET'])
# def get_logs():
#     return jsonify(get_last_events(200))

# @app.route('/api/malicious', methods=['GET'])
# def get_malicious():
#     return jsonify(get_malicious_events(200))

# @app.route('/api/export', methods=['GET'])
# def export():
#     filename = f"traffic_export_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
#     export_logs(filename)
#     return send_file(filename, as_attachment=True)

# @app.route('/api/clear', methods=['POST'])
# def clear_logs():
#     clear_traffic()
#     emit_event("traffic_cleared", {"message": "Traffic cleared"})
#     return jsonify({"status": "success", "message": "Traffic cleared"})

# @app.route('/api/start_monitor', methods=['POST'])
# def start_monitor():
#     iface = start_sniffer()
#     if iface:
#         return jsonify({"status": "success", "message": f"Sniffer started on {iface}"})
#     return jsonify({"status": "failed", "message": "Sniffer already running"})

# @app.route('/api/stop_monitor', methods=['POST'])
# def stop_monitor():
#     stopped = stop_sniffer()
#     return jsonify({"status": "success" if stopped else "failed", "message": "Sniffer stopped" if stopped else "Sniffer was not running"})

# @app.route('/api/block', methods=['POST'])
# def block_device():
#     data = request.json
#     ip = data.get("ip")
#     if not ip:
#         return jsonify({"status": "error", "message": "IP required"}), 400
#     success, msg = block_ip(ip)
#     if success:
#         emit_event("device_blocked", {"ip": ip})
#     return jsonify({"status": "success" if success else "failed", "message": msg, "blocked_ip": ip})

# @app.route('/api/unblock', methods=['POST'])
# def unblock_device():
#     data = request.json
#     ip = data.get("ip")
#     if not ip:
#         return jsonify({"status": "error", "message": "IP required"}), 400
#     success, msg = unblock_ip(ip)
#     if success:
#         emit_event("device_unblocked", {"ip": ip})
#     return jsonify({"status": "success" if success else "failed", "message": msg, "unblocked_ip": ip})

# # -------------------- MyDevice Routes --------------------
# @app.route('/api/full_scan', methods=['GET'])
# def full_scan():
#     try:
#         system_info = get_system_info()
#         vulnerabilities = get_vulnerabilities()
#         return jsonify({"system_info": system_info, "vulnerabilities": vulnerabilities})
#     except Exception as e:
#         print("[ERROR] Full scan failed:", e)
#         return jsonify({"error": str(e)}), 500

# @app.route('/api/fix_vuln', methods=['POST'])
# def fix_vuln():
#     try:
#         vuln_id = request.json.get("id")
#         if not vuln_id:
#             return jsonify({"error": "Vulnerability ID required"}), 400
#         success = fix_vulnerability(vuln_id)
#         return jsonify({"id": vuln_id, "status": "fixed" if success else "not_fixed"})
#     except Exception as e:
#         return jsonify({"error": f"Fix failed: {str(e)}"}), 500

# @app.route("/api/report", methods=["GET"])
# def api_report():
#     try:
#         system_info = get_system_info()
#         vulnerabilities = get_vulnerabilities()
#         filename = f"cyberx_report_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
#         pdf_file = generate_pdf_report(system_info, vulnerabilities, filename=filename)
#         if not pdf_file:
#             return jsonify({"error": "Failed to generate PDF"}), 500
#         return send_file(pdf_file, as_attachment=True)
#     except Exception as e:
#         print("[ERROR] Report generation failed:", e)
#         return jsonify({"error": str(e)}), 500

# # -------------------- Individual Vulnerability Fixing Endpoints --------------------
# @app.route('/api/vulnerabilities/<string:vulnerability_id>/fix', methods=['POST'])
# def fix_single_vulnerability(vulnerability_id):
#     """Fix a single vulnerability on a device"""
#     try:
#         from connected_devices.services import fix_single_vulnerability as fix_vuln_service
        
#         data = request.get_json()
#         device_id = data.get('device_id') if data else None
        
#         if not device_id:
#             return jsonify({
#                 "status": "error",
#                 "message": "Device ID is required"
#             }), 400

#         # Extract vulnerability number from ID (format: vuln-{number}-{device_id})
#         parts = vulnerability_id.split('-')
#         if len(parts) >= 2 and parts[1].isdigit():
#             vuln_number = int(parts[1])
            
#             # Get device IP from store
#             from connected_devices.services import _load_store
#             store = _load_store()
#             device = store.get(device_id)
            
#             if not device:
#                 return jsonify({
#                     "status": "error",
#                     "message": "Device not found"
#                 }), 404
                
#             device_ip = device.get('ip')
#             if not device_ip:
#                 return jsonify({
#                     "status": "error",
#                     "message": "Device has no IP address"
#                 }), 400
            
#             # Fix the vulnerability
#             success, message = fix_vuln_service(vuln_number, device_ip)
            
#             # Emit socket event for real-time updates
#             emit_event("vulnerability_fix_attempt", {
#                 "vulnerability_id": vulnerability_id,
#                 "device_id": device_id,
#                 "status": "success" if success else "failed",
#                 "message": message
#             })
            
#             if success:
#                 return jsonify({
#                     "status": "success",
#                     "message": message,
#                     "vulnerability_id": vulnerability_id,
#                     "device_id": device_id
#                 })
#             else:
#                 return jsonify({
#                     "status": "failed",
#                     "message": message,
#                     "vulnerability_id": vulnerability_id,
#                     "device_id": device_id
#                 }), 400
                
#         else:
#             return jsonify({
#                 "status": "error",
#                 "message": "Invalid vulnerability ID format"
#             }), 400
        
#     except Exception as e:
#         print(f"[ERROR] Vulnerability fix failed: {e}")
#         return jsonify({"status": "error", "message": str(e)}), 500

# # -------------------- Health Check Endpoint --------------------
# @app.route('/api/health', methods=['GET'])
# def health_check():
#     """Health check endpoint for monitoring"""
#     try:
#         from connected_devices.services import _load_store
        
#         store = _load_store()
#         device_count = len(store)
        
#         health_data = {
#             "status": "healthy",
#             "timestamp": datetime.datetime.now().isoformat(),
#             "device_count": device_count,
#             "services": {
#                 "vulnerability_scanning": "active",
#                 "device_monitoring": "active",
#                 "fix_engine": "active",
#                 "router_security": "active"
#             },
#             "scan_state": {
#                 "active_scans": list(scan_state['active_scans']),
#                 "stop_requested": scan_state['stop_requested']
#             }
#         }
            
#         return jsonify(health_data)
        
#     except Exception as e:
#         return jsonify({
#             "status": "degraded",
#             "error": str(e),
#             "timestamp": datetime.datetime.now().isoformat()
#         }), 500

# # -------------------- Run App --------------------
# if __name__ == '__main__':
#     print("\n" + "="*60)
#     print("🚀 CyberX Backend Server Starting...")
#     print("="*60)
#     print("[INFO] ✅ All services initialized")
#     print("[INFO] 📍 Router Security Scanner: Ready")
#     print("[INFO] 🔧 Vulnerability Fixer: Ready") 
#     print("[INFO] 🔐 JWT Authentication: Ready")
#     print("[INFO] 📡 Socket.IO: Ready")
#     print("[INFO] 🔄 Enhanced Scan Management: Ready")
#     print("\n[INFO] Available Endpoints:")
#     print("[INFO]   POST /api/login - Login and get JWT token")
#     print("[INFO]   POST /api/scan-router - Scan router for vulnerabilities")
#     print("[INFO]   POST /api/scan-device/<id> - Enhanced device scanning")
#     print("[INFO]   POST /api/deep-iot-scan - Deep IoT vulnerability scan")
#     print("[INFO]   POST /api/stop-all-scans - Stop all active scans")
#     print("[INFO]   GET  /api/device-report/<id> - Generate device PDF report")
#     print("[INFO]   GET  /api/health - Health check with stats")
#     print("\n[INFO] 🔑 Default test credentials: admin/admin")
#     print("="*60)
    
#     socketio.run(app, host="0.0.0.0", port=5000, debug=True)























import eventlet
eventlet.monkey_patch()

import os
import datetime
import time
import subprocess
import threading
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, create_access_token

# Local modules
from sniffer import (
    start_sniffer, stop_sniffer, clear_traffic,
    block_ip, unblock_ip,
    get_last_events, get_malicious_events, export_logs,
    set_socketio, get_monitoring_report
)
from mydevice import (
    get_system_info,
    get_vulnerabilities,
    fix_vulnerability
)
from mydevice.report_generator import generate_pdf_report
from connected_devices.routes import create_devices_blueprint

# Router Security Modules
from router.scanner import RouterScanner
from router.fixer import VulnerabilityFixer

# -------------------- App Setup --------------------
app = Flask(__name__)
ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://localhost:8081",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:8081",
    "http://localhost:3000",
    "http://localhost:5173"
]
CORS(app, supports_credentials=True, origins=ALLOWED_ORIGINS)

app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'cyberx-security-backend')
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'cyberx-jwt-secret-key-2024')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(hours=24)
app.config['JWT_TOKEN_LOCATION'] = ['headers']

jwt = JWTManager(app)

# Configure SocketIO with proper CORS and async mode
socketio = SocketIO(app, 
                   cors_allowed_origins=ALLOWED_ORIGINS,
                   async_mode='eventlet',
                   logger=True,
                   engineio_logger=True,
                   ping_timeout=60,
                   ping_interval=25)

# Pass socketio instance to sniffer for live broadcasting
set_socketio(socketio)

# Initialize Router Security
router_scanner = RouterScanner()
vulnerability_fixer = VulnerabilityFixer()

# Enhanced Scan Manager (KEEPING YOUR EXISTING LOGIC BUT ADDING IMPROVEMENTS)
class ScanManager:
    def __init__(self):
        self.active_scans = {}
        self.lock = threading.Lock()
        self.stop_requests = set()
    
    def start_scan(self, scan_id, scan_type="device"):
        with self.lock:
            if scan_id in self.active_scans:
                return False
            self.active_scans[scan_id] = {
                'type': scan_type,
                'started_at': datetime.datetime.now().isoformat(),
                'progress': 0,
                'status': 'scanning',
                'current_task': 'Initializing...'
            }
            if scan_id in self.stop_requests:
                self.stop_requests.remove(scan_id)
            return True
    
    def update_scan(self, scan_id, progress=None, status=None, current_task=None):
        with self.lock:
            if scan_id in self.active_scans:
                if progress is not None:
                    self.active_scans[scan_id]['progress'] = progress
                if status is not None:
                    self.active_scans[scan_id]['status'] = status
                if current_task is not None:
                    self.active_scans[scan_id]['current_task'] = current_task
    
    def stop_scan(self, scan_id):
        with self.lock:
            self.stop_requests.add(scan_id)
            if scan_id in self.active_scans:
                del self.active_scans[scan_id]
            return True
    
    def stop_all_scans(self):
        with self.lock:
            stopped_scans = list(self.active_scans.keys())
            self.stop_requests.update(stopped_scans)
            self.active_scans.clear()
            return stopped_scans
    
    def is_scan_stopped(self, scan_id):
        with self.lock:
            return scan_id in self.stop_requests
    
    def get_scan_status(self, scan_id):
        with self.lock:
            return self.active_scans.get(scan_id)
    
    def complete_scan(self, scan_id):
        with self.lock:
            if scan_id in self.active_scans:
                del self.active_scans[scan_id]
            if scan_id in self.stop_requests:
                self.stop_requests.remove(scan_id)

# Replace the global scan_state with enhanced manager
scan_manager = ScanManager()

# Register blueprints (KEEPING YOUR EXISTING SETUP)
app.register_blueprint(create_devices_blueprint("devices_bp"), url_prefix="/api/devices")
app.register_blueprint(create_devices_blueprint("dp_devices_bp"), url_prefix="/api/dp/devices")
app.register_blueprint(create_lan_monitor_blueprint("lan_monitor_bp", socketio), url_prefix="/api/mitm")

# Also create a direct MITM monitor instance and routes to guarantee availability
mitm_monitor = MITMMonitor(socketio)

@app.route('/api/mitm/start', methods=['GET', 'POST'])
def mitm_start():
    started = mitm_monitor.start()
    if started:
        return jsonify({"status": "success", "message": "MITM detection started"})
    return jsonify({"status": "error", "message": "MITM detection already running"}), 400

@app.route('/api/mitm/start', methods=['OPTIONS'])
def mitm_start_options():
    return '', 200

@app.route('/api/mitm/stop', methods=['GET', 'POST'])
def mitm_stop():
    stopped = mitm_monitor.stop()
    if stopped:
        return jsonify({"status": "success", "message": "MITM detection stopped"})
    return jsonify({"status": "error", "message": "MITM detection not running"}), 400

@app.route('/api/mitm/stop', methods=['OPTIONS'])
def mitm_stop_options():
    return '', 200

@app.route('/api/mitm/status', methods=['GET'])
def mitm_status():
    return jsonify({"status": "success", "mitm_detection": mitm_monitor.get_stats()})

@app.route('/api/mitm/status', methods=['OPTIONS'])
def mitm_status_options():
    return '', 200

# -------------------- SocketIO Event Handlers (KEEPING YOUR EXISTING LOGIC) --------------------
@socketio.on('connect')
def handle_connect():
    print(f"[SOCKET] Client connected: {request.sid}")
    emit('connected', {'message': 'Successfully connected to CyberX', 'status': 'connected'})

@socketio.on('disconnect')
def handle_disconnect():
    print(f"[SOCKET] Client disconnected: {request.sid}")

def emit_event(event: str, data: dict):
    try:
        socketio.emit(event, data)
        print(f"[SOCKET] Emitted {event}: {data.get('message', 'No message')}")
    except Exception as e:
        print(f"[SOCKET ERROR] Emit failed: {e}")

# -------------------- CORS Preflight Handler (KEEPING YOUR EXISTING LOGIC) --------------------
@app.after_request
def after_request(response):
    # Mirror allowed origins for CORS, including credentials
    try:
        allowed = {"http://localhost:8080", "http://localhost:3000", "http://localhost:5173"}
        origin = request.headers.get('Origin')
        if origin and origin in allowed:
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Access-Control-Allow-Credentials'] = 'true'
    except Exception:
        pass
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

@app.route('/', methods=['OPTIONS'])
@app.route('/api/<path:path>', methods=['OPTIONS'])
def options_handler(path=None):
    return '', 200

# Explicit CORS preflight handlers for MITM endpoints (belt-and-suspenders)
@app.route('/api/mitm', methods=['OPTIONS'])
@app.route('/api/mitm/<path:path>', methods=['OPTIONS'])
def mitm_options_handler(path=None):
    try:
        allowed = {"http://localhost:8080", "http://localhost:3000", "http://localhost:5173"}
        origin = request.headers.get('Origin')
        resp = jsonify({})
        if origin and origin in allowed:
            resp.headers['Access-Control-Allow-Origin'] = origin
            resp.headers['Access-Control-Allow-Credentials'] = 'true'
        resp.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        resp.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
        return resp, 200
    except Exception:
        return '', 200

# -------------------- JWT Error Handlers (KEEPING YOUR EXISTING LOGIC) --------------------
@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({
        "status": "error",
        "message": "Missing authorization token"
    }), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({
        "status": "error", 
        "message": "Invalid token"
    }), 401

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({
        "status": "error",
        "message": "Token has expired"
    }), 401

# -------------------- Routes (KEEPING YOUR EXISTING LOGIC) --------------------
@app.route('/')
def index():
    return "✅ CyberX Backend Running (Live Monitoring + Router Security + Real-time IDS)"

# -------------------- Enhanced Router Security Routes (KEEPING YOUR EXISTING LOGIC) --------------------
@app.route('/api/scan-router', methods=['POST'])
@jwt_required()
def scan_router():
    """Perform live router security scan"""
    try:
        current_user = get_jwt_identity()
        print(f"[SCAN] Router scan started by user: {current_user}")
        
        emit_event("router_scan_started", {"message": "Router security scan started"})
        
        # Perform the actual scan
        scan_result = router_scanner.perform_comprehensive_scan()
        print(f"[SCAN] Scan completed. Found {len(scan_result.get('vulnerabilities', []))} vulnerabilities")
        
        emit_event("router_scan_completed", {
            "vulnerabilities_found": len(scan_result.get('vulnerabilities', [])),
            "router_info": scan_result.get('router_info', {})
        })
        
        return jsonify({
            "status": "success",
            "routerInfo": scan_result.get('router_info', {}),
            "vulnerabilities": scan_result.get('vulnerabilities', [])
        })
        
    except Exception as e:
        print(f"[ERROR] Router scan failed: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/fix-vulnerability/<vuln_id>', methods=['POST'])
@jwt_required()
def fix_router_vulnerability(vuln_id):
    """Fix specific router vulnerability"""
    try:
        current_user = get_jwt_identity()
        print(f"[FIX] Fixing vulnerability {vuln_id} for user: {current_user}")
        
        result = vulnerability_fixer.fix_vulnerability(vuln_id)
        
        if result['success']:
            emit_event("vulnerability_fixed", {
                "vulnerability_id": vuln_id,
                "message": result['message']
            })
            return jsonify({
                "status": "success", 
                "message": result['message']
            })
        else:
            return jsonify({
                "status": "error", 
                "message": result['message']
            }), 400
            
    except Exception as e:
        print(f"[ERROR] Fix vulnerability failed: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/fix-all-router-vulnerabilities', methods=['POST'])
@jwt_required()
def fix_all_router_vulnerabilities():
    """Batch fix all auto-fixable router vulnerabilities"""
    try:
        current_user = get_jwt_identity()
        data = request.get_json() or {}
        vulnerabilities = data.get('vulnerabilities', [])
        
        print(f"[BATCH FIX] Fixing {len(vulnerabilities)} vulnerabilities for user: {current_user}")
        
        results = vulnerability_fixer.batch_fix_vulnerabilities(vulnerabilities)
        
        emit_event("batch_fix_completed", {
            "successful_fixes": results['successful_fixes'],
            "failed_fixes": results['failed_fixes']
        })
        
        return jsonify({
            "status": "success",
            "message": f"Fixed {results['successful_fixes']} vulnerabilities",
            "results": results
        })
        
    except Exception as e:
        print(f"[ERROR] Batch fix failed: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/router-vulnerabilities', methods=['GET'])
@jwt_required()
def get_router_vulnerabilities():
    """Get current router vulnerabilities"""
    try:
        vulnerabilities = router_scanner.get_current_vulnerabilities()
        return jsonify({
            "status": "success",
            "vulnerabilities": vulnerabilities
        })
    except Exception as e:
        print(f"[ERROR] Get vulnerabilities failed: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/router-info', methods=['GET'])
@jwt_required()
def get_router_info():
    """Get current router information"""
    try:
        router_info = router_scanner.get_router_info()
        return jsonify({
            "status": "success",
            "routerInfo": router_info
        })
    except Exception as e:
        print(f"[ERROR] Get router info failed: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/router-security-report', methods=['GET'])
@jwt_required()
def generate_router_security_report():
    """Generate PDF security report for router"""
    try:
        from router.report_generator import RouterReportGenerator
        
        current_user = get_jwt_identity()
        print(f"[REPORT] Generating security report for user: {current_user}")
        
        # Get current scan results or perform new scan
        scan_result = router_scanner.perform_comprehensive_scan()
        
        # Generate PDF report
        report_generator = RouterReportGenerator()
        filename = f"router_security_report_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        pdf_file = report_generator.generate_pdf_report(scan_result, filename)
        
        if pdf_file and os.path.exists(pdf_file):
            return send_file(
                pdf_file,
                as_attachment=True,
                download_name=os.path.basename(pdf_file),
                mimetype='application/pdf'
            )
        else:
            return jsonify({
                "status": "error", 
                "message": "Failed to generate PDF report"
            }), 500
        
    except Exception as e:
        print(f"[ERROR] Report generation failed: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"status": "error", "message": str(e)}), 500

# -------------------- Enhanced Device Scanning Routes (IMPROVED WITH REAL FUNCTIONALITY) --------------------
@app.route('/api/scan-device/<device_id>', methods=['POST'])
@jwt_required()
def scan_single_device(device_id):
    """Enhanced individual device scanning with REAL comprehensive vulnerability detection"""
    try:
        current_user = get_jwt_identity()
        
        # Check if scan is already running
        if not scan_manager.start_scan(device_id, 'device'):
            return jsonify({
                "status": "error",
                "message": "Scan already in progress for this device"
            }), 409
        
        print(f"[SCAN] Starting REAL comprehensive scan for device {device_id} by user: {current_user}")
        
        emit_event("device_scan_started", {
            "device_id": device_id,
            "message": "Starting REAL comprehensive vulnerability scan"
        })
        
        def perform_scan():
            try:
                # Use the REAL vulnerability scanning from services
                from connected_devices.services import comprehensive_vulnerability_scan
                
                # Step 1: Initial scan
                scan_manager.update_scan(device_id, progress=25, current_task="Port scanning and service detection...")
                if scan_manager.is_scan_stopped(device_id):
                    return
                
                # Step 2: REAL Vulnerability assessment
                scan_manager.update_scan(device_id, progress=50, current_task="Checking all 56 vulnerabilities...")
                result = comprehensive_vulnerability_scan(device_id)
                
                if scan_manager.is_scan_stopped(device_id):
                    return
                
                if "error" in result:
                    scan_manager.update_scan(device_id, status="failed", current_task=f"Scan failed: {result['error']}")
                    emit_event("device_scan_failed", {
                        "device_id": device_id,
                        "message": f"Scan failed: {result['error']}"
                    })
                    return
                
                # Step 3: Analysis and reporting
                scan_manager.update_scan(device_id, progress=100, status="completed", current_task="Scan completed successfully")
                
                vulnerabilities = result.get('comprehensive_vulnerabilities', [])
                
                emit_event("device_scan_completed", {
                    "device_id": device_id,
                    "vulnerabilities_found": len(vulnerabilities),
                    "auto_fixable": len([v for v in vulnerabilities if v.get('category') == 'auto-fixable']),
                    "manual": len([v for v in vulnerabilities if v.get('category') == 'manual']),
                    "message": "REAL comprehensive scan completed successfully"
                })
                
                # Update devices in real-time via socket
                socketio.emit('device_scan_result', {
                    'device_id': device_id,
                    'vulnerabilities': vulnerabilities,
                    'scan_result': result
                })
                
                print(f"✅ REAL Scan completed for {device_id}: {len(vulnerabilities)} vulnerabilities found")
                
            except Exception as e:
                print(f"[SCAN ERROR] Device scan failed: {e}")
                scan_manager.update_scan(device_id, status="failed", current_task=f"Scan failed: {str(e)}")
                emit_event("device_scan_failed", {
                    "device_id": device_id,
                    "message": f"Scan failed: {str(e)}"
                })
            finally:
                scan_manager.complete_scan(device_id)
        
        # Run scan in background thread
        scan_thread = threading.Thread(target=perform_scan)
        scan_thread.daemon = True
        scan_thread.start()
        
        return jsonify({
            "status": "success",
            "message": "REAL comprehensive vulnerability scan started successfully",
            "device_id": device_id,
            "scan_id": device_id
        })
        
    except Exception as e:
        scan_manager.complete_scan(device_id)
        print(f"[ERROR] Device scan initiation failed: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/deep-iot-scan', methods=['POST'])
@jwt_required()
def deep_iot_scan():
    """Perform deep IoT vulnerability scan using REAL service"""
    try:
        current_user = get_jwt_identity()
        print(f"[DEEP SCAN] Starting REAL deep IoT scan by user: {current_user}")
        
        scan_id = 'deep_iot_scan'
        if not scan_manager.start_scan(scan_id, 'iot_scan'):
            return jsonify({
                "status": "error", 
                "message": "Deep IoT scan already in progress"
            }), 409
        
        emit_event("deep_scan_started", {
            "message": "Starting REAL deep IoT vulnerability scan across all devices"
        })
        
        def perform_deep_scan():
            try:
                from connected_devices.services import scan_all_iot_vulnerabilities
                
                # Use the REAL IoT scanning service
                scan_manager.update_scan(scan_id, progress=30, current_task="Scanning all IoT devices...")
                
                result = scan_all_iot_vulnerabilities()
                
                if scan_manager.is_scan_stopped(scan_id):
                    return
                
                scan_manager.update_scan(scan_id, progress=100, status="completed", current_task="Deep IoT scan completed")
                
                if result.get('status') == 'success':
                    emit_event("deep_scan_completed", {
                        "total_devices_scanned": result.get('total_devices_scanned', 0),
                        "total_vulnerabilities_found": result.get('total_vulnerabilities_found', 0),
                        "affected_devices": result.get('affected_devices', 0),
                        "message": "REAL deep IoT scan completed successfully"
                    })
                    print(f"✅ REAL Deep IoT scan completed: {result['total_vulnerabilities_found']} vulnerabilities found")
                else:
                    emit_event("deep_scan_failed", {
                        "message": f"Deep scan failed: {result.get('message', 'Unknown error')}"
                    })
                    print(f"❌ REAL Deep IoT scan failed: {result.get('message')}")
                    
            except Exception as e:
                print(f"[DEEP SCAN ERROR] Deep scan failed: {e}")
                scan_manager.update_scan(scan_id, status="failed", current_task=f"Deep scan failed: {str(e)}")
                emit_event("deep_scan_failed", {
                    "message": f"Deep scan failed: {str(e)}"
                })
            finally:
                scan_manager.complete_scan(scan_id)
        
        # Run deep scan in background thread
        deep_scan_thread = threading.Thread(target=perform_deep_scan)
        deep_scan_thread.daemon = True
        deep_scan_thread.start()
        
        return jsonify({
            "status": "success",
            "message": "REAL deep IoT scan started successfully",
            "scan_id": scan_id
        })
        
    except Exception as e:
        scan_manager.complete_scan('deep_iot_scan')
        print(f"[ERROR] Deep IoT scan initiation failed: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/stop-all-scans', methods=['POST'])
@jwt_required()
def stop_all_scans():
    """Enhanced stop all scans functionality"""
    try:
        current_user = get_jwt_identity()
        print(f"[STOP] Stopping all scans by user: {current_user}")
        
        stopped_scans = scan_manager.stop_all_scans()
        
        # Also stop backend scans
        from connected_devices.services import stop_all_scans as stop_backend_scans
        backend_result = stop_backend_scans()
        
        emit_event("all_scans_stopped", {
            "message": f"All scans stopped successfully",
            "stopped_scans": len(stopped_scans),
            "scan_ids": stopped_scans,
            "backend_stopped": backend_result.get('stopped_scans', 0)
        })
        
        return jsonify({
            "status": "success",
            "message": f"Stopped {len(stopped_scans)} active scans",
            "stopped_scans": len(stopped_scans),
            "scan_ids": stopped_scans,
            "backend_result": backend_result
        })
        
    except Exception as e:
        print(f"[ERROR] Stop all scans failed: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

# -------------------- Enhanced Report Generation (KEEPING YOUR EXISTING LOGIC) --------------------
@app.route('/api/device-report/<device_id>', methods=['GET'])
@jwt_required()
def generate_device_report(device_id):
    """Generate comprehensive PDF report for a specific device"""
    try:
        current_user = get_jwt_identity()
        print(f"[REPORT] Generating device report for {device_id} by user: {current_user}")
        
        # Get device information from backend services
        from connected_devices.services import get_device_info
        device_info = get_device_info(device_id)
        
        if "error" in device_info:
            return jsonify({"error": "Device not found"}), 404
        
        # Get vulnerabilities
        vulnerabilities = device_info.get('comprehensive_vulnerabilities', device_info.get('vulnerabilities', []))
        
        # Generate PDF report
        filename = f"device_security_report_{device_id}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        pdf_file = generate_pdf_report(device_info, vulnerabilities, filename=filename)
        
        if pdf_file and os.path.exists(pdf_file):
            return send_file(
                pdf_file,
                as_attachment=True,
                download_name=os.path.basename(pdf_file),
                mimetype='application/pdf'
            )
        else:
            return jsonify({
                "status": "error", 
                "message": "Failed to generate PDF report"
            }), 500
        
    except Exception as e:
        print(f"[ERROR] Device report generation failed: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

# -------------------- Authentication Routes (KEEPING YOUR EXISTING LOGIC) --------------------
@app.route('/api/login', methods=['POST'])
def login():
    """Simple login endpoint for testing"""
    try:
        data = request.get_json()
        username = data.get('username', 'admin')
        password = data.get('password', 'admin')
        
        # Simple authentication (replace with your actual auth logic)
        if username == 'admin' and password == 'admin':
            access_token = create_access_token(identity=username)
            return jsonify({
                "status": "success",
                "message": "Login successful",
                "access_token": access_token,
                "user": username
            })
        else:
            return jsonify({
                "status": "error",
                "message": "Invalid credentials"
            }), 401
            
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

# -------------------- Traffic Monitoring Routes (KEEPING YOUR EXISTING LOGIC) --------------------
@app.route('/api/logs', methods=['GET'])
def get_logs():
    return jsonify(get_last_events(200))

@app.route('/api/malicious', methods=['GET'])
def get_malicious():
    return jsonify(get_malicious_events(200))

@app.route('/api/export', methods=['GET'])
def export():
    filename = f"traffic_export_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    export_logs(filename)
    return send_file(filename, as_attachment=True)

@app.route('/api/clear', methods=['POST'])
def clear_logs():
    clear_traffic()
    emit_event("traffic_cleared", {"message": "Traffic cleared"})
    return jsonify({"status": "success", "message": "Traffic cleared"})

@app.route('/api/start_monitor', methods=['POST'])
def start_monitor():
    iface = start_sniffer()
    if iface:
        return jsonify({"status": "success", "message": f"Sniffer started on {iface}"})
    return jsonify({"status": "failed", "message": "Sniffer already running"})

@app.route('/api/stop_monitor', methods=['POST'])
def stop_monitor():
    stopped = stop_sniffer()
    return jsonify({"status": "success" if stopped else "failed", "message": "Sniffer stopped" if stopped else "Sniffer was not running"})

@app.route('/api/block', methods=['POST'])
def block_device():
    data = request.json
    ip = data.get("ip")
    if not ip:
        return jsonify({"status": "error", "message": "IP required"}), 400
    success, msg = block_ip(ip)
    if success:
        emit_event("device_blocked", {"ip": ip})
    return jsonify({"status": "success" if success else "failed", "message": msg, "blocked_ip": ip})

@app.route('/api/unblock', methods=['POST'])
def unblock_device():
    data = request.json
    ip = data.get("ip")
    if not ip:
        return jsonify({"status": "error", "message": "IP required"}), 400
    success, msg = unblock_ip(ip)
    if success:
        emit_event("device_unblocked", {"ip": ip})
    return jsonify({"status": "success" if success else "failed", "message": msg, "unblocked_ip": ip})

# -------------------- MyDevice Routes (KEEPING YOUR EXISTING LOGIC) --------------------
@app.route('/api/full_scan', methods=['GET'])
def full_scan():
    try:
        system_info = get_system_info()
        vulnerabilities = get_vulnerabilities()
        return jsonify({"system_info": system_info, "vulnerabilities": vulnerabilities})
    except Exception as e:
        print("[ERROR] Full scan failed:", e)
        return jsonify({"error": str(e)}), 500

@app.route('/api/fix', methods=['POST'])
@app.route('/api/fix_vuln', methods=['POST'])
def fix_vuln():
    try:
        data = request.get_json(silent=True) or {}
        vuln_id = data.get("id")
        if not vuln_id:
            return jsonify({"error": "Vulnerability ID required", "status": False}), 400
        res = fix_vulnerability(vuln_id)
        if isinstance(res, dict):
            return jsonify(res)
        return jsonify({"id": vuln_id, "status": bool(res), "message": "Vulnerability fixed successfully" if res else "Manual action required"})
    except Exception as e:
        return jsonify({"error": f"Fix failed: {str(e)}", "status": False, "message": str(e)}), 500

@app.route("/api/monitoring/report", methods=["GET"])
@app.route("/api/report", methods=["GET"])
def api_report():
    try:
        # Check if caller wants JSON monitoring report
        if (request.path == "/api/monitoring/report" or 
            request.args.get("type") == "monitoring" or 
            request.args.get("format") == "json" or 
            "application/json" in request.headers.get("Accept", "")):
            return jsonify(get_monitoring_report())

        # Otherwise generate and send PDF report
        system_info = get_system_info()
        vulnerabilities = get_vulnerabilities()
        filename = f"cyberx_report_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        pdf_file = generate_pdf_report(system_info, vulnerabilities, filename=filename)
        if not pdf_file:
            return jsonify({"error": "Failed to generate PDF"}), 500
        return send_file(pdf_file, as_attachment=True)
    except Exception as e:
        print("[ERROR] Report generation failed:", e)
        return jsonify({"error": str(e)}), 500

# -------------------- Individual Vulnerability Fixing Endpoints (IMPROVED) --------------------
@app.route('/api/vulnerabilities/<string:vulnerability_id>/fix', methods=['POST'])
@jwt_required()
def fix_single_vulnerability(vulnerability_id):
    """Fix a single vulnerability on a device using REAL commands"""
    try:
        from connected_devices.services import fix_single_vulnerability as fix_vuln_service
        
        data = request.get_json()
        device_id = data.get('device_id') if data else None
        
        if not device_id:
            return jsonify({
                "status": "error",
                "message": "Device ID is required"
            }), 400

        print(f"🔧 REAL Fixing vulnerability {vulnerability_id} on device {device_id}")

        # Extract vulnerability number from ID (format: vuln-{number}-{device_id})
        parts = vulnerability_id.split('-')
        if len(parts) >= 2 and parts[1].isdigit():
            vuln_number = int(parts[1])
            
            # Get device IP from backend services
            from connected_devices.services import get_device_info
            device_info = get_device_info(device_id)
            
            if "error" in device_info:
                return jsonify({
                    "status": "error",
                    "message": "Device not found"
                }), 404
                
            device_ip = device_info.get('ip')
            if not device_ip:
                return jsonify({
                    "status": "error",
                    "message": "Device has no IP address"
                }), 400
            
            # Fix the vulnerability with REAL commands
            success, message = fix_vuln_service(vuln_number, device_ip)
            
            # Emit socket event for real-time updates
            emit_event("vulnerability_fix_attempt", {
                "vulnerability_id": vulnerability_id,
                "device_id": device_id,
                "status": "success" if success else "failed",
                "message": message
            })
            
            if success:
                return jsonify({
                    "status": "success",
                    "message": message,
                    "vulnerability_id": vulnerability_id,
                    "device_id": device_id
                })
            else:
                return jsonify({
                    "status": "failed",
                    "message": message,
                    "vulnerability_id": vulnerability_id,
                    "device_id": device_id
                }), 400
                
        else:
            return jsonify({
                "status": "error",
                "message": "Invalid vulnerability ID format"
            }), 400
        
    except Exception as e:
        print(f"[ERROR] Vulnerability fix failed: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

# -------------------- Health Check Endpoint (IMPROVED) --------------------
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint for monitoring"""
    try:
        from connected_devices.services import _load_store, get_scan_status
        
        store = _load_store()
        device_count = len(store)
        scan_status = get_scan_status()
        
        health_data = {
            "status": "healthy",
            "timestamp": datetime.datetime.now().isoformat(),
            "device_count": device_count,
            "services": {
                "vulnerability_scanning": "active",
                "device_monitoring": "active",
                "fix_engine": "active",
                "router_security": "active",
                "real_time_scanning": "active"
            },
            "scan_state": {
                "active_scans": scan_manager.active_scans.copy(),
                "backend_active_scans": scan_status.get('active_scans', 0)
            },
            "vulnerability_database": {
                "total_vulnerabilities": 56,
                "auto_fixable": 10,
                "manual": 9,
                "non_fixable": 5
            }
        }
            
        return jsonify(health_data)
        
    except Exception as e:
        return jsonify({
            "status": "degraded",
            "error": str(e),
            "timestamp": datetime.datetime.now().isoformat()
        }), 500

# -------------------- Run App (KEEPING YOUR EXISTING LOGIC) --------------------
if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 CyberX Backend Server Starting...")
    print("="*60)
    print("[INFO] ✅ All services initialized")
    print("[INFO] 📍 Router Security Scanner: Ready")
    print("[INFO] 🔧 REAL Vulnerability Fixer: Ready") 
    print("[INFO] 🔐 JWT Authentication: Ready")
    print("[INFO] 📡 Socket.IO: Ready")
    print("[INFO] 🔄 Enhanced REAL Scan Management: Ready")
    print("[INFO] 🛠️  REAL Command Execution: Enabled")
    print("[INFO] 📊 56 Vulnerability Database: Loaded")
    print("\n[INFO] Available Endpoints:")
    print("[INFO]   POST /api/login - Login and get JWT token")
    print("[INFO]   POST /api/scan-router - Scan router for vulnerabilities")
    print("[INFO]   POST /api/scan-device/<id> - REAL comprehensive device scanning")
    print("[INFO]   POST /api/deep-iot-scan - REAL deep IoT vulnerability scan")
    print("[INFO]   POST /api/stop-all-scans - Stop all active scans")
    print("[INFO]   POST /api/vulnerabilities/<id>/fix - REAL vulnerability fixing")
    print("[INFO]   GET  /api/device-report/<id> - Generate device PDF report")
    print("[INFO]   GET  /api/health - Health check with stats")
    print("\n[INFO] 🔑 Default test credentials: admin/admin")
    print("="*60)
    
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
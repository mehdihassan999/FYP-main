import threading
from flask import Blueprint, jsonify, request, send_file
import io
import datetime

from .monitor import MITMMonitor


def create_lan_monitor_blueprint(name: str, socketio):
    bp = Blueprint(name, __name__)

    # Single shared monitor instance
    monitor = MITMMonitor(socketio)

    @bp.route('/start', methods=['POST', 'GET'])
    def start_detection():
        started = monitor.start()
        if started:
            return jsonify({"status": "success", "message": "MITM detection started"})
        else:
            return jsonify({"status": "error", "message": "MITM detection already running"}), 400

    @bp.route('/start', methods=['OPTIONS'])
    def options_start():
        from flask import make_response
        origin = request.headers.get('Origin', '*')
        resp = make_response("", 200)
        resp.headers['Access-Control-Allow-Origin'] = origin
        resp.headers['Access-Control-Allow-Credentials'] = 'true'
        resp.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        resp.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
        return resp

    @bp.route('/reset', methods=['POST', 'GET'])
    def reset_detection():
        monitor.reset()
        return jsonify({"status": "success", "message": "MITM detection state reset"})

    @bp.route('/reset', methods=['OPTIONS'])
    def options_reset():
        from flask import make_response
        origin = request.headers.get('Origin', '*')
        resp = make_response("", 200)
        resp.headers['Access-Control-Allow-Origin'] = origin
        resp.headers['Access-Control-Allow-Credentials'] = 'true'
        resp.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        resp.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
        return resp

    @bp.route('/stop', methods=['POST', 'GET'])
    def stop_detection():
        stopped = monitor.stop()
        if stopped:
            return jsonify({"status": "success", "message": "MITM detection stopped"})
        else:
            return jsonify({"status": "error", "message": "MITM detection not running"}), 400

    @bp.route('/stop', methods=['OPTIONS'])
    def options_stop():
        from flask import make_response
        origin = request.headers.get('Origin', '*')
        resp = make_response("", 200)
        resp.headers['Access-Control-Allow-Origin'] = origin
        resp.headers['Access-Control-Allow-Credentials'] = 'true'
        resp.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        resp.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
        return resp

    @bp.route('/status', methods=['GET'])
    def get_status():
        return jsonify({
            "status": "success",
            "mitm_detection": monitor.get_stats()
        })

    @bp.route('/status', methods=['OPTIONS'])
    def options_status():
        from flask import make_response
        origin = request.headers.get('Origin', '*')
        resp = make_response("", 200)
        resp.headers['Access-Control-Allow-Origin'] = origin
        resp.headers['Access-Control-Allow-Credentials'] = 'true'
        resp.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        resp.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
        return resp

    # CORS preflight for any subpath
    @bp.route('/<path:_any>', methods=['OPTIONS'])
    def options_passthrough(_any: str):
        from flask import make_response
        origin = request.headers.get('Origin', '*')
        resp = make_response("", 200)
        resp.headers['Access-Control-Allow-Origin'] = origin
        resp.headers['Access-Control-Allow-Credentials'] = 'true'
        resp.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        resp.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
        return resp

    # Root-level OPTIONS for /api/mitm
    @bp.route('', methods=['OPTIONS'])
    def options_root():
        from flask import make_response
        origin = request.headers.get('Origin', '*')
        resp = make_response("", 200)
        resp.headers['Access-Control-Allow-Origin'] = origin
        resp.headers['Access-Control-Allow-Credentials'] = 'true'
        resp.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        resp.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
        return resp

    @bp.route('/report', methods=['GET'])
    def generate_report():
        stats = monitor.get_stats()
        threats = stats.get("recent_threats", [])
        now = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.pdfgen import canvas
            from reportlab.lib.units import inch

            buf = io.BytesIO()
            c = canvas.Canvas(buf, pagesize=letter)
            width, height = letter

            y = height - 1 * inch
            c.setFont("Helvetica-Bold", 14)
            c.drawString(1 * inch, y, "CyberX MITM/Threat Report")
            y -= 0.3 * inch
            c.setFont("Helvetica", 10)
            c.drawString(1 * inch, y, f"Generated: {now}")
            y -= 0.2 * inch
            c.drawString(1 * inch, y, f"Threats Detected: {stats.get('threats_detected', 0)} | Packets Analyzed: {stats.get('packets_analyzed', 0)}")
            y -= 0.4 * inch

            c.setFont("Helvetica-Bold", 12)
            c.drawString(1 * inch, y, "Recent Threats:")
            y -= 0.25 * inch
            c.setFont("Helvetica", 10)
            if not threats:
                c.drawString(1 * inch, y, "No threats recorded.")
            else:
                for t in threats:
                    lines = []
                    # Header line
                    lines.append(f"[{t.get('severity','info').upper()}] {t.get('type','Threat')} - {t.get('message','')}")
                    # Primary identities
                    attacker_ip = t.get('attacker_ip') or t.get('source_ip')
                    victim_ip = t.get('victim_ip') or t.get('target_ip')
                    attacker_mac = t.get('attacker_mac') or t.get('source_mac') or t.get('mac2')
                    os_guess = t.get('os_guess')
                    id_line_parts = []
                    if attacker_ip: id_line_parts.append(f"Attacker IP: {attacker_ip}")
                    if attacker_mac: id_line_parts.append(f"Attacker MAC: {attacker_mac}")
                    if os_guess: id_line_parts.append(f"Attacker OS: {os_guess}")
                    if victim_ip: id_line_parts.append(f"Victim IP: {victim_ip}")
                    if id_line_parts:
                        lines.append(" | ".join(id_line_parts))
                    # Ports and targets
                    ports = t.get('ports_targeted')
                    targets = t.get('targets')
                    if ports:
                        lines.append("Ports: " + ", ".join(str(p) for p in ports))
                    if targets:
                        lines.append("Targets: " + ", ".join(targets))
                    # Extra details (fallback keys)
                    extra_keys = ("ip","mac1","mac2","gateway_ip","domain","target_port")
                    extra_vals = [f"{k}: {t.get(k)}" for k in extra_keys if t.get(k) is not None]
                    if extra_vals:
                        lines.append(" | ".join(extra_vals))

                    for line in lines:
                        if y < 1 * inch:
                            c.showPage()
                            y = height - 1 * inch
                            c.setFont("Helvetica", 10)
                        c.drawString(1 * inch, y, line[:100])
                        y -= 0.2 * inch

                    y -= 0.1 * inch

            c.showPage()
            c.save()
            buf.seek(0)
            filename = f"mitm_report_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            return send_file(buf, as_attachment=True, download_name=filename, mimetype='application/pdf')
        except Exception as e:
            return jsonify({
                "status": "error",
                "message": "PDF generation requires reportlab. Please install it.",
            }), 501

    return bp

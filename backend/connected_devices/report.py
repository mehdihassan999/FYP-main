# backend/connected_devices/report.py
import os
import datetime
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

OUT_DIR = os.path.join(os.path.dirname(__file__), "reports")
os.makedirs(OUT_DIR, exist_ok=True)

def generate_pdf_report(device: dict, vulnerabilities: list, filename: str = None) -> str:
    if filename is None:
        safe = device.get("ip", device.get("id")).replace(":", "_").replace(".", "_")
        filename = f"report_{safe}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"

    path = os.path.join(OUT_DIR, filename)
    c = canvas.Canvas(path, pagesize=letter)
    width, height = letter

    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, height - 50, f"Security Report for {device.get('name', device.get('ip'))}")

    c.setFont("Helvetica", 10)
    y = height - 80
    lines = [
        f"IP: {device.get('ip')}",
        f"MAC: {device.get('mac')}",
        f"Vendor: {device.get('vendor')}",
        f"Authorized: {device.get('authorized')}",
        f"Status: {device.get('status')}",
        f"Last Seen: {device.get('lastSeen')}",
        f"Risk Level: {device.get('riskLevel')}"
    ]
    for line in lines:
        c.drawString(50, y, line)
        y -= 14

    y -= 8
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "Vulnerabilities:")
    y -= 18
    c.setFont("Helvetica", 10)

    if not vulnerabilities:
        c.drawString(60, y, "No vulnerabilities found.")
        y -= 14
    else:
        for v in vulnerabilities:
            if y < 80:
                c.showPage()
                y = height - 50
            desc = f"- [{v.get('severity','unknown').upper()}] {v.get('description')}"
            c.drawString(60, y, desc)
            y -= 14

    c.showPage()
    c.save()
    return path
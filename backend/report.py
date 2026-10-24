# # report.py
# import time
# from sniffer import devices, lock

# def generate_report():
#     """Generate vulnerability report"""
#     with lock:
#         return {
#             "total_packets": len(devices),
#             "suspicious": sum(d["suspicious"] for d in devices),
#             "blocked": sum(d["blocked"] for d in devices),
#             "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
#             "devices": devices[-50:]
#         }










# backend/connected_devices/report.py
import json
import time
import datetime
from typing import Dict, List, Optional
from io import BytesIO
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics.charts.piecharts import Pie

# Import our services for vulnerability data
from .services import comprehensive_vulnerability_scan, VULNERABILITY_DEFINITIONS, _load_store

def generate_vulnerability_report(device_id: str = None) -> Dict:
    """
    Generate comprehensive vulnerability report for all devices or specific device
    """
    store = _load_store()
    report_data = {
        "generated_at": datetime.datetime.now().isoformat(),
        "summary": {
            "total_devices": 0,
            "vulnerable_devices": 0,
            "total_vulnerabilities": 0,
            "critical_vulnerabilities": 0,
            "high_vulnerabilities": 0,
            "auto_fixable_count": 0,
            "fixed_count": 0
        },
        "devices": [],
        "risk_distribution": {
            "critical": 0,
            "high": 0,
            "medium": 0,
            "low": 0
        },
        "recommendations": []
    }

    # Filter devices if specific device ID provided
    devices_to_report = []
    if device_id:
        device = store.get(device_id)
        if device:
            devices_to_report = [(device_id, device)]
    else:
        devices_to_report = list(store.items())

    report_data["summary"]["total_devices"] = len(devices_to_report)

    for device_id, device in devices_to_report:
        device_vulns = device.get("comprehensive_vulnerabilities", [])
        total_vulns = len(device_vulns)
        
        if total_vulns > 0:
            report_data["summary"]["vulnerable_devices"] += 1
            report_data["summary"]["total_vulnerabilities"] += total_vulns

        # Count vulnerabilities by severity
        critical_count = len([v for v in device_vulns if v.get("severity") == "critical"])
        high_count = len([v for v in device_vulns if v.get("severity") == "high"])
        auto_fixable_count = len([v for v in device_vulns if v.get("category") == "auto-fixable" and v.get("status") != "fixed"])
        fixed_count = len([v for v in device_vulns if v.get("status") == "fixed"])

        report_data["summary"]["critical_vulnerabilities"] += critical_count
        report_data["summary"]["high_vulnerabilities"] += high_count
        report_data["summary"]["auto_fixable_count"] += auto_fixable_count
        report_data["summary"]["fixed_count"] += fixed_count

        # Update risk distribution
        if device.get("riskLevel") in report_data["risk_distribution"]:
            report_data["risk_distribution"][device["riskLevel"]] += 1

        # Device details
        device_info = {
            "id": device_id,
            "name": device.get("name", "Unknown"),
            "ip": device.get("ip", "Unknown"),
            "mac": device.get("mac", "Unknown"),
            "type": device.get("type", "unknown"),
            "vendor": device.get("vendor", "Unknown"),
            "risk_level": device.get("riskLevel", "low"),
            "last_scanned": device.get("last_scanned"),
            "vulnerability_count": total_vulns,
            "critical_count": critical_count,
            "high_count": high_count,
            "auto_fixable_count": auto_fixable_count,
            "fixed_count": fixed_count,
            "vulnerabilities": device_vulns
        }
        report_data["devices"].append(device_info)

    # Generate recommendations
    report_data["recommendations"] = _generate_recommendations(report_data)

    return report_data

def _generate_recommendations(report_data: Dict) -> List[str]:
    """Generate security recommendations based on report data"""
    recommendations = []
    summary = report_data["summary"]

    if summary["critical_vulnerabilities"] > 0:
        recommendations.append(f"🚨 IMMEDIATE ACTION: {summary['critical_vulnerabilities']} critical vulnerabilities detected. Prioritize fixing these immediately.")

    if summary["high_vulnerabilities"] > 0:
        recommendations.append(f"⚠️ HIGH PRIORITY: {summary['high_vulnerabilities']} high-severity vulnerabilities require attention within 48 hours.")

    if summary["auto_fixable_count"] > 0:
        recommendations.append(f"🔧 QUICK WINS: {summary['auto_fixable_count']} vulnerabilities can be auto-fixed. Use the 'Fix All Auto-fixable' feature.")

    if summary["vulnerable_devices"] > summary["total_devices"] * 0.5:
        recommendations.append("🌐 NETWORK HEALTH: Over 50% of devices have vulnerabilities. Consider network-wide security assessment.")

    if summary["fixed_count"] > 0:
        recommendations.append(f"✅ PROGRESS: {summary['fixed_count']} vulnerabilities have been successfully fixed. Continue remediation efforts.")

    # IoT-specific recommendations
    iot_devices = [d for d in report_data["devices"] if d["type"] == "iot"]
    if iot_devices:
        iot_vulns = sum(d["vulnerability_count"] for d in iot_devices)
        recommendations.append(f"📱 IOT SECURITY: {len(iot_devices)} IoT devices with {iot_vulns} vulnerabilities. Isolate IoT devices on separate network.")

    if not recommendations:
        recommendations.append("🎉 EXCELLENT: No critical issues detected. Maintain regular security scanning.")

    return recommendations

def generate_pdf_report(device_id: str = None, output_file: str = None) -> Optional[BytesIO]:
    """
    Generate PDF vulnerability report
    """
    try:
        if output_file:
            doc = SimpleDocTemplate(output_file, pagesize=letter)
        else:
            buffer = BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter)

        styles = getSampleStyleSheet()
        story = []

        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            spaceAfter=30,
            alignment=1,  # Center
            textColor=colors.darkblue
        )
        title = Paragraph("CYBERX SECURITY VULNERABILITY REPORT", title_style)
        story.append(title)

        # Report metadata
        meta_style = ParagraphStyle(
            'Meta',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.gray,
            alignment=1
        )
        meta = Paragraph(f"Generated on {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", meta_style)
        story.append(meta)
        story.append(Spacer(1, 20))

        # Get report data
        report_data = generate_vulnerability_report(device_id)

        # Executive Summary
        story.append(Paragraph("EXECUTIVE SUMMARY", styles['Heading2']))
        summary_data = report_data["summary"]
        
        summary_text = f"""
        Total Devices Scanned: <b>{summary_data['total_devices']}</b><br/>
        Vulnerable Devices: <b>{summary_data['vulnerable_devices']}</b><br/>
        Total Vulnerabilities: <b>{summary_data['total_vulnerabilities']}</b><br/>
        Critical Vulnerabilities: <b>{summary_data['critical_vulnerabilities']}</b><br/>
        High Severity Vulnerabilities: <b>{summary_data['high_vulnerabilities']}</b><br/>
        Auto-fixable Vulnerabilities: <b>{summary_data['auto_fixable_count']}</b><br/>
        Fixed Vulnerabilities: <b>{summary_data['fixed_count']}</b>
        """
        story.append(Paragraph(summary_text, styles["Normal"]))
        story.append(Spacer(1, 20))

        # Risk Distribution
        story.append(Paragraph("RISK DISTRIBUTION", styles['Heading2']))
        risk_data = [
            ['Risk Level', 'Device Count'],
            ['Critical', str(report_data["risk_distribution"]["critical"])],
            ['High', str(report_data["risk_distribution"]["high"])],
            ['Medium', str(report_data["risk_distribution"]["medium"])],
            ['Low', str(report_data["risk_distribution"]["low"])]
        ]
        
        risk_table = Table(risk_data, colWidths=[2*inch, 1*inch])
        risk_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(risk_table)
        story.append(Spacer(1, 20))

        # Recommendations
        story.append(Paragraph("SECURITY RECOMMENDATIONS", styles['Heading2']))
        for i, recommendation in enumerate(report_data["recommendations"], 1):
            story.append(Paragraph(f"{i}. {recommendation}", styles["Normal"]))
        story.append(Spacer(1, 20))

        # Device Details
        story.append(Paragraph("DEVICE VULNERABILITY DETAILS", styles['Heading2']))
        for device in report_data["devices"]:
            # Device header
            device_header = f"Device: {device['name']} ({device['ip']}) - Risk: {device['risk_level'].upper()}"
            story.append(Paragraph(device_header, styles['Heading3']))
            
            # Device info
            device_info = f"Type: {device['type']} | Vendor: {device['vendor']} | MAC: {device['mac']}"
            story.append(Paragraph(device_info, styles["Normal"]))
            
            # Vulnerability summary
            vuln_summary = f"Vulnerabilities: {device['vulnerability_count']} total, {device['critical_count']} critical, {device['high_count']} high, {device['auto_fixable_count']} auto-fixable"
            story.append(Paragraph(vuln_summary, styles["Normal"]))
            
            # Vulnerabilities table
            if device['vulnerabilities']:
                vuln_data = [['ID', 'Name', 'Severity', 'Status', 'Category']]
                for vuln in device['vulnerabilities'][:10]:  # Show first 10 vulnerabilities
                    vuln_data.append([
                        vuln.get('vulnerability_number', 'N/A'),
                        vuln.get('name', 'Unknown')[:30],
                        vuln.get('severity', 'unknown').upper(),
                        vuln.get('status', 'found'),
                        vuln.get('category', 'unknown')
                    ])
                
                vuln_table = Table(vuln_data, colWidths=[0.5*inch, 2*inch, 0.8*inch, 0.8*inch, 1*inch])
                vuln_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 8),
                    ('FONTSIZE', (0, 1), (-1, -1), 7),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
                    ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
                ]))
                story.append(vuln_table)
            
            story.append(Spacer(1, 15))

        # Footer
        story.append(Spacer(1, 20))
        footer = Paragraph(
            "Generated by CyberX Security Platform - Automated Vulnerability Management System",
            ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=colors.gray, alignment=1)
        )
        story.append(footer)

        # Build PDF
        doc.build(story)
        
        if output_file:
            return output_file
        else:
            buffer.seek(0)
            return buffer

    except Exception as e:
        print(f"❌ PDF report generation failed: {e}")
        return None

def generate_quick_fix_report(device_id: str) -> Dict:
    """
    Generate a quick fix report with actionable items
    """
    store = _load_store()
    device = store.get(device_id)
    
    if not device:
        return {"error": "Device not found"}
    
    vulnerabilities = device.get("comprehensive_vulnerabilities", [])
    auto_fixable = [v for v in vulnerabilities if v.get("category") == "auto-fixable" and v.get("status") != "fixed"]
    manual_fix = [v for v in vulnerabilities if v.get("category") == "manual" and v.get("status") != "fixed"]
    
    return {
        "device_name": device.get("name", "Unknown"),
        "device_ip": device.get("ip", "Unknown"),
        "risk_level": device.get("riskLevel", "low"),
        "quick_wins": {
            "count": len(auto_fixable),
            "vulnerabilities": auto_fixable
        },
        "manual_attention": {
            "count": len(manual_fix),
            "vulnerabilities": manual_fix
        },
        "estimated_fix_time": {
            "auto_fix": len(auto_fixable) * 2,  # 2 minutes per auto-fix
            "manual_fix": len(manual_fix) * 15   # 15 minutes per manual fix
        },
        "priority_order": sorted(
            vulnerabilities, 
            key=lambda x: {"critical": 0, "high": 1, "medium": 2, "low": 3}.get(x.get("severity", "low"), 4)
        )[:5]  # Top 5 priorities
    }

def export_vulnerability_csv(device_id: str = None) -> str:
    """
    Export vulnerabilities to CSV format
    """
    report_data = generate_vulnerability_report(device_id)
    csv_lines = []
    
    # Header
    csv_lines.append("Device Name,IP Address,Device Type,Risk Level,Vulnerability Name,Severity,Category,Status,Description")
    
    for device in report_data["devices"]:
        for vuln in device["vulnerabilities"]:
            csv_lines.append(
                f'"{device["name"]}","{device["ip"]}","{device["type"]}","{device["risk_level"]}",'
                f'"{vuln.get("name", "Unknown")}","{vuln.get("severity", "unknown")}",'
                f'"{vuln.get("category", "unknown")}","{vuln.get("status", "found")}",'
                f'"{vuln.get("description", "").replace(",", ";")}"'
            )
    
    return "\n".join(csv_lines)

# Legacy function for compatibility
def generate_report():
    """Legacy function - now uses vulnerability data instead of packet data"""
    store = _load_store()
    vulnerable_devices = [device for device in store.values() 
                         if device.get("comprehensive_vulnerabilities") 
                         and len(device["comprehensive_vulnerabilities"]) > 0]
    
    return {
        "total_devices": len(store),
        "vulnerable_devices": len(vulnerable_devices),
        "total_vulnerabilities": sum(len(device.get("comprehensive_vulnerabilities", [])) for device in store.values()),
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "high_risk_devices": [device for device in store.values() if device.get("riskLevel") in ["high", "critical"]]
    }
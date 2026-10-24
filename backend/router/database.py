# backend/router/database.py
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class RouterScan(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    router_ip = db.Column(db.String(15), nullable=False)
    scan_timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    router_info = db.Column(db.JSON)
    vulnerabilities_found = db.Column(db.Integer)
    scan_duration = db.Column(db.Float)

class Vulnerability(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    vuln_id = db.Column(db.String(50), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    severity = db.Column(db.String(20), nullable=False)
    description = db.Column(db.Text)
    fixable = db.Column(db.Boolean, default=True)
    status = db.Column(db.String(20), default='open')
    scan_id = db.Column(db.Integer, db.ForeignKey('router_scan.id'))

class FixLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    vuln_id = db.Column(db.String(50), nullable=False)
    fix_timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    fix_method = db.Column(db.String(100))
    status = db.Column(db.String(20))
    details = db.Column(db.JSON)
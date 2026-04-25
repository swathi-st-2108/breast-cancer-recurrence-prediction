from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

class PatientRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    # 9 Features
    clump_thickness = db.Column(db.Integer, nullable=False)
    cell_size_uniformity = db.Column(db.Integer, nullable=False)
    cell_shape_uniformity = db.Column(db.Integer, nullable=False)
    marginal_adhesion = db.Column(db.Integer, nullable=False)
    single_epithelial_cell_size = db.Column(db.Integer, nullable=False)
    bare_nuclei = db.Column(db.Integer, nullable=False)
    bland_chromatin = db.Column(db.Integer, nullable=False)
    normal_nucleoli = db.Column(db.Integer, nullable=False)
    mitoses = db.Column(db.Integer, nullable=False)
    
    # Results
    risk_level = db.Column(db.String(10), nullable=False) # 'High' or 'Low'
    probability = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'clump_thickness': self.clump_thickness,
            'cell_size_uniformity': self.cell_size_uniformity,
            'cell_shape_uniformity': self.cell_shape_uniformity,
            'marginal_adhesion': self.marginal_adhesion,
            'single_epithelial_cell_size': self.single_epithelial_cell_size,
            'bare_nuclei': self.bare_nuclei,
            'bland_chromatin': self.bland_chromatin,
            'normal_nucleoli': self.normal_nucleoli,
            'mitoses': self.mitoses,
            'risk_level': self.risk_level,
            'probability': self.probability,
            'timestamp': self.timestamp.isoformat() + 'Z'
        }

import os
import pickle
import pandas as pd
import numpy as np
import shap
from flask import Flask, request, jsonify, session, send_file
from flask_cors import CORS
from models import db, User, PatientRecord
from werkzeug.security import generate_password_hash, check_password_hash
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import io

app = Flask(__name__)
app.config['SECRET_KEY'] = 'super-secret-key' # Use proper env var in prod
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///bcrp.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app, supports_credentials=True)
db.init_app(app)

# Load the ML model
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.pkl')
try:
    with open(MODEL_PATH, 'rb') as f:
        data = pickle.load(f)
        ml_model = data['model']
        imputer = data['imputer']
except FileNotFoundError:
    print("Warning: Model not found. Please run train_model.py first.")
    ml_model = None
    imputer = None

with app.app_context():
    db.create_all()
    # Create default doctor user if none exists
    if not User.query.first():
        hashed_pw = generate_password_hash('doctor123')
        default_user = User(username='doctor', password_hash=hashed_pw)
        db.session.add(default_user)
        db.session.commit()

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password_hash, password):
        session['user_id'] = user.id
        return jsonify({"message": "Login successful", "username": username}), 200
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({"message": "Logged out"}), 200

@app.route('/predict', methods=['POST'])
def predict():
    if not ml_model:
        return jsonify({"error": "Model not loaded"}), 500
        
    data = request.json
    feature_names = [
        'clump_thickness', 'cell_size_uniformity', 'cell_shape_uniformity',
        'marginal_adhesion', 'single_epithelial_cell_size', 'bare_nuclei',
        'bland_chromatin', 'normal_nucleoli', 'mitoses'
    ]
    
    try:
        # Extract features
        features = []
        for name in feature_names:
            features.append(int(data.get(name, 1)))
            
        # Create DataFrame for prediction
        input_df = pd.DataFrame([features], columns=feature_names)
        
        # Predict probability
        prob = ml_model.predict_proba(input_df)[0][1] # Probability of class 1 (Malignant/High Risk)
        risk_level = "High" if prob > 0.5 else "Low"
        
        # Generate SHAP values dynamically
        explainer = shap.TreeExplainer(ml_model)
        shap_values = explainer.shap_values(input_df)
        
        # shap_values could be a list of arrays (one per class) or a single array
        if isinstance(shap_values, list):
            sv = shap_values[1][0] # Get values for class 1
        else:
            sv = shap_values[0]
            
        # Create feature importance dictionary
        feature_importance = [{"feature": f, "value": float(v)} for f, v in zip(feature_names, sv)]
        
        # Save to database
        record = PatientRecord(
            clump_thickness=features[0],
            cell_size_uniformity=features[1],
            cell_shape_uniformity=features[2],
            marginal_adhesion=features[3],
            single_epithelial_cell_size=features[4],
            bare_nuclei=features[5],
            bland_chromatin=features[6],
            normal_nucleoli=features[7],
            mitoses=features[8],
            risk_level=risk_level,
            probability=float(prob)
        )
        db.session.add(record)
        db.session.commit()
        
        return jsonify({
            "id": record.id,
            "risk_level": risk_level,
            "probability": float(prob),
            "feature_importance": feature_importance
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/patients', methods=['GET'])
def get_patients():
    records = PatientRecord.query.order_by(PatientRecord.timestamp.desc()).all()
    return jsonify([r.to_dict() for r in records])

@app.route('/dashboard-stats', methods=['GET'])
def get_dashboard_stats():
    total = PatientRecord.query.count()
    high_risk = PatientRecord.query.filter_by(risk_level='High').count()
    low_risk = PatientRecord.query.filter_by(risk_level='Low').count()
    
    return jsonify({
        "total": total,
        "high_risk": high_risk,
        "low_risk": low_risk
    })

@app.route('/generate-report/<int:patient_id>', methods=['GET'])
def generate_report(patient_id):
    record = PatientRecord.query.get_or_404(patient_id)
    
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Header
    p.setFont("Helvetica-Bold", 16)
    p.drawString(50, height - 50, "Breast Cancer Recurrence Prediction")
    p.setFont("Helvetica", 12)
    p.drawString(50, height - 70, "Clinical Decision Support Report")
    
    # Patient Details
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, height - 110, f"Patient Record ID: {record.id}")
    
    p.setFont("Helvetica", 12)
    features = [
        ("Clump Thickness", record.clump_thickness),
        ("Cell Size Uniformity", record.cell_size_uniformity),
        ("Cell Shape Uniformity", record.cell_shape_uniformity),
        ("Marginal Adhesion", record.marginal_adhesion),
        ("Single Epithelial Cell Size", record.single_epithelial_cell_size),
        ("Bare Nuclei", record.bare_nuclei),
        ("Bland Chromatin", record.bland_chromatin),
        ("Normal Nucleoli", record.normal_nucleoli),
        ("Mitoses", record.mitoses)
    ]
    
    y = height - 140
    for name, val in features:
        p.drawString(70, y, f"{name}: {val}")
        y -= 20
        
    # Prediction Result
    y -= 20
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, y, "Prediction Result")
    y -= 20
    
    p.setFont("Helvetica", 12)
    p.drawString(70, y, f"Risk Level: {record.risk_level}")
    y -= 20
    p.drawString(70, y, f"Probability (High Risk): {record.probability * 100:.1f}%")
    
    # Explanation
    y -= 30
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, y, "Explanation")
    y -= 20
    p.setFont("Helvetica", 12)
    p.drawString(70, y, "Key tumor-related features influenced this prediction.")
    
    # Footer
    p.setFont("Helvetica-Oblique", 10)
    p.drawString(50, 50, f"Generated on: {record.timestamp.strftime('%Y-%m-%d %H:%M:%S')}")
    p.drawString(50, 35, "Assistive tool for clinical decision support")
    
    p.showPage()
    p.save()
    
    buffer.seek(0)
    return send_file(
        buffer,
        as_attachment=True,
        download_name=f'patient_{record.id}_report.pdf',
        mimetype='application/pdf'
    )

if __name__ == '__main__':
    app.run(debug=True, port=5000)

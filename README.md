# Breast Cancer Recurrence Prediction (CDSS)

A full-stack Clinical Decision Support System (CDSS) designed to assist medical professionals in predicting the likelihood of breast cancer recurrence. The system uses a machine learning model to evaluate tumor characteristics and provides explainable, data-driven insights.

## Features

*   **Risk Prediction**: Analyzes 9 distinct tumor characteristics (clump thickness, cell size uniformity, marginal adhesion, etc.) to predict recurrence risk.
*   **Explainable AI (XAI)**: Uses SHAP (SHapley Additive exPlanations) to provide real-time feature importance, explaining *why* a specific prediction was made.
*   **Patient History Dashboard**: Securely stores patient records in an SQLite database, allowing doctors to view past predictions and aggregated statistics.
*   **PDF Report Generation**: Automatically generates printable clinical reports containing patient details, prediction results, and risk probabilities.
*   **Modern UI**: Built with React and Vite, featuring a responsive, hospital-themed interface.

## Technology Stack

*   **Frontend**: React, Vite, CSS
*   **Backend**: Python, Flask, Flask-SQLAlchemy, Flask-CORS
*   **Machine Learning**: Scikit-Learn, pandas, numpy
*   **Explainability & Reporting**: SHAP, ReportLab (for PDF generation)
*   **Database**: SQLite

---

## How to Run the Project Locally

Follow these steps to get both the frontend and backend servers running on your local machine.

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [Python](https://www.python.org/downloads/) (v3.8 or higher)

### 1. Backend Setup

Open a terminal in the root directory of the project.

```bash
# 1. Activate the existing virtual environment (Windows)
venv\Scripts\activate
# If on Mac/Linux: source venv/bin/activate

# 2. Navigate to the backend folder
cd backend

# 3. Install the required Python packages
pip install -r requirements.txt

# 4. Train the machine learning model (Generates model.pkl)
python train_model.py

# 5. Start the Flask server
python app.py
```
*The backend server will run on `http://127.0.0.1:5000`.*

### 2. Frontend Setup

Open a **new** terminal window (keep the backend server running) in the root directory.

```bash
# 1. Navigate to the frontend folder
cd frontend

# 2. Install the Node dependencies
npm install

# 3. Start the Vite development server
npm run dev
```
*The frontend application will be available at `http://localhost:5173` (or the port specified in your terminal).*


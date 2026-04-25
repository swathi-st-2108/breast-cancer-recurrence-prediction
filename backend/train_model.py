import pandas as pd
import numpy as np
from sklearn.datasets import fetch_openml
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.impute import SimpleImputer
import pickle
import os

def train():
    print("Fetching dataset...")
    try:
        # ID 15 is breast-cancer-wisconsin (original)
        data = fetch_openml(data_id=15, as_frame=True, parser='auto')
        X = data.data
        y = data.target
        
        feature_names = [
            'clump_thickness',
            'cell_size_uniformity',
            'cell_shape_uniformity',
            'marginal_adhesion',
            'single_epithelial_cell_size',
            'bare_nuclei',
            'bland_chromatin',
            'normal_nucleoli',
            'mitoses'
        ]
        
        X.columns = feature_names
        
        # The target in openml dataset 15 is usually '2' for benign and '4' for malignant
        # But sometimes it's 'benign' and 'malignant'. Let's handle both.
        if y.dtype == 'O' or y.dtype.name == 'category':
            if 'malignant' in y.values or 'benign' in y.values:
                y = (y == 'malignant').astype(int)
            else:
                # String '2' and '4'
                y = (y == '4').astype(int)
        else:
            y = (y == 4).astype(int)
            
        # Handle missing values
        imputer = SimpleImputer(strategy='median')
        X_imputed = pd.DataFrame(imputer.fit_transform(X), columns=X.columns)
        
    except Exception as e:
        print(f"Failed to fetch from OpenML: {e}. Creating synthetic dataset.")
        np.random.seed(42)
        n_samples = 699
        feature_names = [
            'clump_thickness', 'cell_size_uniformity', 'cell_shape_uniformity',
            'marginal_adhesion', 'single_epithelial_cell_size', 'bare_nuclei',
            'bland_chromatin', 'normal_nucleoli', 'mitoses'
        ]
        X_imputed = pd.DataFrame(np.random.randint(1, 11, size=(n_samples, 9)), columns=feature_names)
        
        # Synthetic rule
        score = X_imputed.sum(axis=1)
        y = (score > 35).astype(int)
        imputer = SimpleImputer(strategy='median')
        imputer.fit(X_imputed)

    X_train, X_test, y_train, y_test = train_test_split(X_imputed, y, test_size=0.2, random_state=42)

    print("Training model...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    accuracy = model.score(X_test, y_test)
    print(f"Model accuracy: {accuracy:.4f}")

    os.makedirs(os.path.dirname(os.path.abspath(__file__)), exist_ok=True)
    model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'model.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump({'model': model, 'imputer': imputer}, f)

    print(f"Model saved to {model_path}")

if __name__ == '__main__':
    train()

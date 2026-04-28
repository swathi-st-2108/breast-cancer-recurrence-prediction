import { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Download, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Result = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!result);

  useEffect(() => {
    // If accessed directly without state, we would fetch from API, but we just need the SHAP feature importances.
    // For simplicity in this demo, if no state, we redirect to history.
    if (!result) {
      navigate('/history');
    }
  }, [result, navigate]);

  if (loading || !result) return <div>Loading result...</div>;

  const { risk_level, probability, feature_importance } = result;
  
  // Sort features by absolute SHAP value for better visualization
  const sortedFeatures = [...feature_importance].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  
  const chartData = {
    labels: sortedFeatures.map(f => f.feature.replace(/_/g, ' ')),
    datasets: [
      {
        label: 'Feature Contribution (SHAP Value)',
        data: sortedFeatures.map(f => f.value),
        backgroundColor: sortedFeatures.map(f => f.value > 0 ? 'rgba(255, 107, 107, 0.7)' : 'rgba(81, 207, 102, 0.7)'),
        borderColor: sortedFeatures.map(f => f.value > 0 ? '#ff6b6b' : '#51cf66'),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false }
    }
  };

  const isHighRisk = risk_level === 'High';
  const probPercent = (probability * 100).toFixed(1);

  const handleDownload = () => {
    window.open(`${API_URL}/generate-report/${id}`, '_blank');
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <button className="btn" style={{ padding: '0', backgroundColor: 'transparent', color: 'var(--text-muted)', marginBottom: '1rem' }} onClick={() => navigate('/history')}>
        <ArrowLeft size={18} /> Back to History
      </button>

      <h2 style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Prediction Result
        <button onClick={handleDownload} className="btn btn-outline">
          <Download size={18} /> Download Report
        </button>
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
          {isHighRisk ? (
            <AlertTriangle color="var(--danger-color)" size={64} style={{ marginBottom: '1rem' }} />
          ) : (
             <CheckCircle color="var(--success-color)" size={64} style={{ marginBottom: '1rem' }} />
          )}
          
          <h3 style={{ fontSize: '1.5rem', color: isHighRisk ? 'var(--danger-color)' : 'var(--success-color)', marginBottom: '0.5rem' }}>
            {risk_level} Risk
          </h3>
          
          <div style={{ width: '100%', backgroundColor: 'var(--border-color)', borderRadius: '10px', height: '8px', margin: '1rem 0' }}>
            <div style={{ 
              width: `${probPercent}%`, 
              backgroundColor: isHighRisk ? 'var(--danger-color)' : 'var(--success-color)', 
              height: '100%', 
              borderRadius: '10px',
              transition: 'width 1s ease-in-out'
            }}></div>
          </div>
          
          <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>{probPercent}% Probability</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '1rem' }}>
            {isHighRisk ? "This patient has a high probability of recurrence." : "This patient has a low probability of recurrence."}
          </p>
          <p style={{ color: '#adb5bd', fontSize: '0.75rem', marginTop: '2rem' }}>
            Assistive tool for clinical decision support. Always verify with clinical judgment.
          </p>
        </div>
        
        <div className="card">
          <h4 style={{ marginBottom: '0.5rem' }}>Explainability Insights</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Key tumor-related features influenced this prediction. Features pushing risk higher are in <span style={{ color: 'var(--danger-color)' }}>red</span>, lower in <span style={{ color: 'var(--success-color)' }}>green</span>.
          </p>
          
          <div style={{ height: '350px' }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Result;

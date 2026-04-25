import { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, high_risk: 0, low_risk: 0 });
  const [recentPatients, setRecentPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await axios.get('http://localhost:5000/dashboard-stats');
        setStats(statsRes.data);
        
        const patientsRes = await axios.get('http://localhost:5000/patients');
        setRecentPatients(patientsRes.data.slice(0, 5)); // Last 5 patients
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  const chartData = {
    labels: ['High Risk', 'Low Risk'],
    datasets: [
      {
        data: [stats.high_risk, stats.low_risk],
        backgroundColor: ['rgba(255, 107, 107, 0.8)', 'rgba(81, 207, 102, 0.8)'],
        borderColor: ['#ff6b6b', '#51cf66'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Overview
        <Link to="/add-patient" className="btn btn-primary">Add New Patient</Link>
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ backgroundColor: 'var(--primary-light)', padding: '1rem', borderRadius: '50%' }}>
            <Users color="var(--primary-color)" size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Total Patients</p>
            <h3 style={{ fontSize: '1.8rem', margin: 0 }}>{stats.total}</h3>
          </div>
        </div>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ backgroundColor: 'rgba(255, 107, 107, 0.1)', padding: '1rem', borderRadius: '50%' }}>
            <AlertTriangle color="var(--danger-color)" size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>High Risk Cases</p>
            <h3 style={{ fontSize: '1.8rem', margin: 0 }}>{stats.high_risk}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ backgroundColor: 'rgba(81, 207, 102, 0.1)', padding: '1rem', borderRadius: '50%' }}>
            <CheckCircle color="var(--success-color)" size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Low Risk Cases</p>
            <h3 style={{ fontSize: '1.8rem', margin: 0 }}>{stats.low_risk}</h3>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        <div className="card">
          <h4 style={{ marginBottom: '1rem', textAlign: 'center' }}>Risk Distribution</h4>
          {stats.total > 0 ? (
            <div style={{ maxWidth: '250px', margin: '0 auto' }}>
              <Pie data={chartData} />
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No data available</p>
          )}
        </div>
        
        <div className="card" style={{ overflowX: 'auto' }}>
          <h4 style={{ marginBottom: '1rem' }}>Recent Predictions</h4>
          {recentPatients.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Risk Level</th>
                  <th>Probability</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentPatients.map(p => (
                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    <td>{new Date(p.timestamp).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${p.risk_level === 'High' ? 'badge-danger' : 'badge-success'}`}>
                        {p.risk_level}
                      </span>
                    </td>
                    <td>{(p.probability * 100).toFixed(1)}%</td>
                    <td><Link to={`/result/${p.id}`} style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 500 }}>View Details</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
             <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No patients analyzed yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { History as HistoryIcon, Search } from 'lucide-react';

const PatientHistory = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get('http://localhost:5000/patients');
        setPatients(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch patients", err);
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(p => 
    p.id.toString().includes(searchTerm) || 
    p.risk_level.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <HistoryIcon color="var(--primary-color)" /> Patient History
      </h2>
      
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search by ID or Risk Level..." 
              style={{ paddingLeft: '2.2rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div>Loading history...</div>
        ) : filteredPatients.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Date & Time</th>
                  <th>Risk Level</th>
                  <th>Probability</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 500 }}>#{p.id}</td>
                    <td>{new Date(p.timestamp).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${p.risk_level === 'High' ? 'badge-danger' : 'badge-success'}`}>
                        {p.risk_level}
                      </span>
                    </td>
                    <td>{(p.probability * 100).toFixed(1)}%</td>
                    <td>
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                        onClick={() => window.open(`http://localhost:5000/generate-report/${p.id}`, '_blank')}
                      >
                        PDF Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No patients found.
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientHistory;

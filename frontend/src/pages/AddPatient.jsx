import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Activity } from 'lucide-react';

const AddPatient = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clump_thickness: 1,
    cell_size_uniformity: 1,
    cell_shape_uniformity: 1,
    marginal_adhesion: 1,
    single_epithelial_cell_size: 1,
    bare_nuclei: 1,
    bland_chromatin: 1,
    normal_nucleoli: 1,
    mitoses: 1
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: parseInt(e.target.value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/predict', formData);
      navigate(`/result/${res.data.id}`, { state: { result: res.data } });
    } catch (err) {
      console.error(err);
      alert('Failed to process prediction. Check backend connection.');
      setLoading(false);
    }
  };

  const features = [
    { name: 'clump_thickness', label: 'Clump Thickness' },
    { name: 'cell_size_uniformity', label: 'Cell Size Uniformity' },
    { name: 'cell_shape_uniformity', label: 'Cell Shape Uniformity' },
    { name: 'marginal_adhesion', label: 'Marginal Adhesion' },
    { name: 'single_epithelial_cell_size', label: 'Single Epithelial Cell Size' },
    { name: 'bare_nuclei', label: 'Bare Nuclei' },
    { name: 'bland_chromatin', label: 'Bland Chromatin' },
    { name: 'normal_nucleoli', label: 'Normal Nucleoli' },
    { name: 'mitoses', label: 'Mitoses' }
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Activity color="var(--primary-color)" /> Enter Patient Data
      </h2>
      
      <div className="card">
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Please enter the cytological attributes (1-10 scale) to predict the risk of breast cancer recurrence.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem 2rem' }}>
            {features.map(f => (
              <div key={f.name} className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">{f.label}</label>
                <input 
                  type="number" 
                  min="1" 
                  max="10" 
                  className="form-control" 
                  name={f.name}
                  value={formData[f.name]}
                  onChange={handleChange}
                  required 
                />
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Processing...' : 'Run Prediction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatient;

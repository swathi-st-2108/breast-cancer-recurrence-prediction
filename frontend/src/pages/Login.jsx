import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldPlus } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('doctor');
  const [password, setPassword] = useState('doctor123');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/login', { username, password });
      if (res.status === 200) {
        localStorage.setItem('isAuth', 'true');
        navigate('/');
      }
    } catch (err) {
      setError('Invalid credentials. Try doctor/doctor123');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <ShieldPlus size={48} color="var(--primary-color)" />
          <h2 style={{ marginTop: '1rem' }}>Doctor Login</h2>
          <p style={{ color: 'var(--text-muted)' }}>Clinical Decision Support System</p>
        </div>
        
        {error && <div style={{ backgroundColor: 'rgba(255, 107, 107, 0.1)', color: 'var(--danger-color)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              type="text" 
              className="form-control" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;

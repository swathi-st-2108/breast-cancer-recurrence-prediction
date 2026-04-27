import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Activity, LayoutDashboard, UserPlus, History, LogOut } from 'lucide-react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddPatient from './pages/AddPatient';
import Result from './pages/Result';
import PatientHistory from './pages/History';
import './index.css';

// Simple auth check
const PrivateRoute = ({ children }) => {
  const isAuth = localStorage.getItem('isAuth');
  return isAuth ? children : <Navigate to="/login" />;
};

const Navigation = () => {
  const location = useLocation();
  if (location.pathname === '/login') return null;

  const handleLogout = () => {
    localStorage.removeItem('isAuth');
    window.location.href = '/login';
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <Activity color="var(--primary-color)" size={28} />
        OncoRisk
      </Link>
      <div className="nav-links">
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
          <LayoutDashboard size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} />
          Dashboard
        </Link>
        <Link to="/add-patient" className={`nav-link ${location.pathname === '/add-patient' ? 'active' : ''}`}>
          <UserPlus size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} />
          Add Patient
        </Link>
        <Link to="/history" className={`nav-link ${location.pathname === '/history' ? 'active' : ''}`}>
          <History size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} />
          History
        </Link>
        <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <Navigation />
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/add-patient" element={<PrivateRoute><AddPatient /></PrivateRoute>} />
          <Route path="/result/:id" element={<PrivateRoute><Result /></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><PatientHistory /></PrivateRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

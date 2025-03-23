import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="gradient-bg text-white shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold tracking-tight hover:text-white/90 transition">
            CampusConnect
          </Link>
          <div className="flex items-center space-x-6">
            {token ? (
              <>
              <Link 
                  to="/Profile" 
                  className="text-sm font-medium hover:text-white/90 transition"
                >
                  Profile
                </Link>
                <Link 
                  to="/" 
                  className="text-sm font-medium hover:text-white/90 transition"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium bg-white/10 rounded-lg hover:bg-white/20 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-sm font-medium hover:text-white/90 transition"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 text-sm font-medium bg-white/10 rounded-lg hover:bg-white/20 transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
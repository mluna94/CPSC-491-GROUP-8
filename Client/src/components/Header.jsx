import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';

const Header = ({ user, setUser, showAuthLinks = true }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear both token and user data (FIX FOR REFRESH LOGOUT)
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="dashboard-header">
      <div className="flex items-center space-x-3">
        <div className="logo-container">
          <div className="logo-inner"></div>
        </div>
        <span className="font-bold text-lg">Quizzy</span>
        <nav className="flex space-x-6 ml-8">
          <Link to="/" className="nav-link">Home</Link>
          <span className="nav-link">How It Works</span>
          <span className="nav-link">FAQ</span>
        </nav>
      </div>
      <div className="flex items-center space-x-4">
        {user ? (
          <div className="flex flex-col items-end">
            <div className="flex items-center space-x-4">
              <div className="user-avatar bg-blue-500">
                <User className="text-black" size={20} />
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
            <span className="text-gray-600 text-sm mt-1">{user.name}</span>
          </div>
        ) : showAuthLinks ? (
          <>
            <Link to="/login" className="px-4 py-2 text-gray-700 hover:bg-blue-400 rounded transition-colors">
              Login
            </Link>
            <Link to="/signup" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
              Sign up
            </Link>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default Header;

// src/components/Header.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Header.css';

function Header() {
  const { user } = useAuth();

  // Get dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="user-info">
          <div className="avatar-container">
            <img 
              src="/fuma.jpeg" 
              alt="Avatar" 
              className="avatar"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="avatar-fallback">
              {user?.name?.charAt(0)?.toUpperCase() || 'F'}
            </div>
          </div>
          <div className="user-details">
            <div className="greeting">{getGreeting()}! 👋</div>
            <div className="name">{user?.name || 'Fuma Mpho'}</div>
            <div className="role">{user?.role || 'Student'}</div>
          </div>
        </div>
        
        <div className="header-actions">
          <div className="status-indicator">
            <div className="status-dot"></div>
            <span>Online</span>
          </div>
          <div className="current-time">
            {new Date().toLocaleTimeString('en-ZA', { 
              hour: '2-digit', 
              minute: '2-digit',
              timeZone: 'Africa/Johannesburg'
            })}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
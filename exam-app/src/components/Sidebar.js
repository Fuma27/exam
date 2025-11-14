// src/components/Sidebar.js
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';
import { useAuth } from '../context/AuthContext';

function Sidebar() {
  const [isDark, setIsDark] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const studentMenu = [
    { path: '/register-exam', icon: '/icons/plus.svg', label: 'Register for exams' },
    { path: '/', icon: '/icons/home.svg', label: 'Home' },
    { path: '/calendar', icon: '/icons/calendar.svg', label: 'Calendar' },
    { path: '/confirm', icon: '/icons/list.svg', label: 'View registered exams' },
    { path: '/messages', icon: '/icons/messages.svg', label: 'Messages', },
  ];

  const commonMenu = [
    { path: '/settings', icon: '/icons/settings.svg', label: 'Settings' },
    { path: '/support', icon: '/icons/support.svg', label: 'Support' },
  ];

  const adminMenu = [
    { path: '/admin/faculties', icon: '/icons/building.svg', label: 'Manage Faculties' },
    { path: '/admin/courses', icon: '/icons/book.svg', label: 'Manage Courses' },
    { path: '/admin/students', icon: '/icons/users.svg', label: 'View Students' },
  ];

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle menu">
        <img src="/icons/menu.svg" alt="Menu" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="mobile-overlay" 
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
 
        <div className="search-bar">
          <img src="/icons/search.svg" alt="Search" />
          <input 
            type="text" 
            placeholder="Search" 
            aria-label="Search"
          />
        </div>

        <nav className="sidebar-menu" aria-label="Main navigation">
          {/* STUDENT MENU */}
          {user?.role !== 'admin' && studentMenu.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
              aria-current={({ isActive }) => isActive ? 'page' : undefined}
            >
              <img src={item.icon} alt="" className="menu-icon" />
              <span>{item.label}</span>
              {item.badge && <span className="badge">{item.badge}</span>}
            </NavLink>
          ))}

          {/* ADMIN MENU */}
          {user?.role === 'admin' && adminMenu.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
              aria-current={({ isActive }) => isActive ? 'page' : undefined}
            >
              <img src={item.icon} alt="" className="menu-icon" />
              <span>{item.label}</span>
            </NavLink>
          ))}

          <div className="menu-divider" />

          {/* COMMON MENU */}
          {commonMenu.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
              aria-current={({ isActive }) => isActive ? 'page' : undefined}
            >
              <img src={item.icon} alt="" className="menu-icon" />
              <span>{item.label}</span>
            </NavLink>
          ))}

          <button 
            onClick={handleLogout} 
            className="menu-item logout"
            aria-label="Logout"
          >
            <img src="/icons/logout.svg" alt="Logout" className="menu-icon" />
            <span>Logout</span>
          </button>
        </nav>

      
      </aside>
    </>
  );
}

export default Sidebar;
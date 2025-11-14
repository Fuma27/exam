// src/components/Layout.js
import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

function Layout({ children }) {
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="app-layout">
      {!isAuthPage && <Header />}
      <div className="main-container">
        {!isAuthPage && <Sidebar />}
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
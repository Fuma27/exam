// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
const API = 'http://localhost:5000/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await res.json();

      if (data.success && data.user && data.token) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        return { success: true };
      } else {
        alert(data.error || 'Login failed');
        return { success: false };
      }
    } catch (err) {
      alert('Cannot connect to server. Is backend running on port 5000?');
      console.error(err);
      return { success: false };
    }
  };

  const register = async (name, email, password, role, studentId = '', faculty = '') => {
    try {
      console.log('📝 Registration attempt:', { name, email, role, studentId, faculty });
      
      const userData = {
        name: name.trim(),
        email: email.trim(),
        password: password,
        role: role,
        studentId: studentId?.trim() || null,
        faculty: faculty?.trim() || null
      };

      console.log('📤 Sending registration data:', userData);

      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await res.json();
      console.log('📨 Registration response:', data);

      if (data.success) {
        alert(data.message || 'Registration successful!');
        return { success: true, user: data.user };
      } else {
        const errorMessage = data.error || 'Registration failed';
        alert(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      console.error('❌ Registration error:', err);
      const errorMessage = 'Cannot connect to server. Please try again.';
      alert(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
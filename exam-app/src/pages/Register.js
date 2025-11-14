// src/pages/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.css';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const result = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.role,
        formData.studentId
      );
      
      if (result.success) {
        alert(`Account created as ${formData.role.toUpperCase()}! Please login.`);
        navigate('/login');
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page container">
      <h1>Create your new account now.</h1>
      
      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Enter your Full Name"
          required
          value={formData.name}
          onChange={handleChange}
          disabled={loading}
        />
        
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          required
          value={formData.email}
          onChange={handleChange}
          disabled={loading}
        />
        
        <input
          type="text"
          name="studentId"
          placeholder="Enter your student ID"
          value={formData.studentId}
          onChange={handleChange}
          disabled={loading}
        />

        {/* ROLE DROPDOWN */}
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="role-select"
          required
          disabled={loading}
        >
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>

        <div className="input-wrapper">
          <input
            type="password"
            name="password"
            placeholder="Enter your password (min. 6 characters)"
            required
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            minLength="6"
          />
        </div>
        
        <div className="input-wrapper">
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={loading}
        >
          {loading ? 'Creating Account...' : `Sign up as ${formData.role.toUpperCase()}`}
        </button>
      </form>

      <div className="link">
        Have an account? <a href="/login">Login</a>
      </div>

      <div className="divider"><span>Or Login with</span></div>
      <div className="social-login">
        <img src="/facebook.svg" alt="Facebook" />
        <img src="/google.svg" alt="Google" />
        <img src="/x.svg" alt="X" />
      </div>
    </div>
  );
}

export default Register;
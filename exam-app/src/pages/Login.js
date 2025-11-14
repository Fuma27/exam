// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', email);
      const result = await login(email, password);
      
      if (result.success) {
        console.log('Login successful, navigating to home...');
        navigate('/');
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page">
      <h1>Welcome back!</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form className="login-form" onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="Enter your email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          autoComplete="email"
        />
        
        <div className="password-input">
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="Enter your password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            autoComplete="current-password"
          />
          <span 
            className="password-eye" 
            onClick={togglePasswordVisibility}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && togglePasswordVisibility()}
          >
            {showPassword ? '🙈' : '👁️'}
          </span>
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="submit-btn"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="link">
        Don't have an account? <a href="/register">Sign Up</a>
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

export default Login;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, handleApiError } from '../utils/api';
import '../styles/Settings.css';

function Settings() {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [gdprData, setGdprData] = useState(null);
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    emailNotifications: true,
    securityAlerts: true
  });
  const [userPreferences, setUserPreferences] = useState({
    theme: 'light',
    language: 'en',
    notifications: true,
    autoSave: true
  });

  useEffect(() => {
    // Load user preferences from localStorage
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      setUserPreferences(JSON.parse(savedPreferences));
    }

    // Load security settings
    const savedSecurity = localStorage.getItem('securitySettings');
    if (savedSecurity) {
      setSecuritySettings(JSON.parse(savedSecurity));
    }
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // In a real app, you would call an API to update user profile
      const formData = new FormData(e.target);
      const updates = {
        name: formData.get('name'),
        email: formData.get('email'),
        faculty: formData.get('faculty')
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateUser(updates);
      setMessage('✅ Profile updated successfully!');
    } catch (error) {
      setMessage('❌ Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData(e.target);
      const currentPassword = formData.get('currentPassword');
      const newPassword = formData.get('newPassword');
      const confirmPassword = formData.get('confirmPassword');

      if (newPassword !== confirmPassword) {
        throw new Error('New passwords do not match');
      }

      if (newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Simulate password change API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage('✅ Password changed successfully!');
      e.target.reset();
    } catch (error) {
      setMessage('❌ ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDataExport = async () => {
    setLoading(true);
    setMessage('');

    try {
      // Fetch user data for export
      const userData = {
        profile: user,
        preferences: userPreferences,
        security: securitySettings,
        exportDate: new Date().toISOString()
      };

      // Create and download JSON file
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `user-data-export-${new Date().getTime()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage('✅ Data exported successfully!');
    } catch (error) {
      setMessage('❌ Failed to export data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDataErasure = async () => {
    if (!window.confirm(
      '🚨 WARNING: This action is irreversible!\n\n' +
      'All your personal data will be permanently deleted including:\n' +
      '• Profile information\n' +
      '• Exam registrations\n' +
      '• Payment records\n' +
      '• All account data\n\n' +
      'Are you absolutely sure you want to proceed?'
    )) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Simulate GDPR data erasure API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMessage('✅ Your data has been erased successfully. Logging out...');
      
      // Logout after successful erasure
      setTimeout(() => {
        logout();
      }, 3000);
    } catch (error) {
      setMessage('❌ Failed to erase data: ' + error.message);
      setLoading(false);
    }
  };

  const handleSecuritySettingChange = (setting, value) => {
    const newSettings = {
      ...securitySettings,
      [setting]: value
    };
    setSecuritySettings(newSettings);
    localStorage.setItem('securitySettings', JSON.stringify(newSettings));
  };

  const handlePreferenceChange = (preference, value) => {
    const newPreferences = {
      ...userPreferences,
      [preference]: value
    };
    setUserPreferences(newPreferences);
    localStorage.setItem('userPreferences', JSON.stringify(newPreferences));
    
    // Apply theme immediately
    if (preference === 'theme') {
      document.documentElement.setAttribute('data-theme', value);
    }
  };

  const fetchGDPRData = async () => {
    try {
      const data = await api.getGDPRCompliance();
      setGdprData(data);
    } catch (error) {
      console.error('Failed to fetch GDPR data:', error);
    }
  };

  const renderProfileTab = () => (
    <div className="settings-section">
      <h3>Profile Information</h3>
      <form onSubmit={handleProfileUpdate} className="settings-form">
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            defaultValue={user.name}
            placeholder="Enter your full name"
          />
        </div>
        
        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            defaultValue={user.email}
            placeholder="Enter your email"
          />
        </div>
        
        <div className="form-group">
          <label>Student ID</label>
          <input
            type="text"
            value={user.studentId || user.student_id || 'Not set'}
            disabled
            className="disabled-input"
          />
        </div>
        
        <div className="form-group">
          <label>Faculty/Department</label>
          <input
            type="text"
            name="faculty"
            defaultValue={user.faculty || ''}
            placeholder="Enter your faculty"
          />
        </div>
        
        <div className="form-group">
          <label>Account Role</label>
          <input
            type="text"
            value={user.role}
            disabled
            className="disabled-input"
          />
        </div>
        
        <button type="submit" disabled={loading} className="save-btn">
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="settings-section">
      <h3>Security Settings</h3>
      
      <div className="security-settings">
        <div className="setting-item">
          <div className="setting-info">
            <h4>Two-Factor Authentication</h4>
            <p>Add an extra layer of security to your account</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={securitySettings.twoFactorAuth}
              onChange={(e) => handleSecuritySettingChange('twoFactorAuth', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h4>Session Timeout</h4>
            <p>Automatically log out after period of inactivity</p>
          </div>
          <select
            value={securitySettings.sessionTimeout}
            onChange={(e) => handleSecuritySettingChange('sessionTimeout', parseInt(e.target.value))}
            className="session-select"
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={60}>1 hour</option>
            <option value={120}>2 hours</option>
          </select>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h4>Email Notifications</h4>
            <p>Receive email alerts for important activities</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={securitySettings.emailNotifications}
              onChange={(e) => handleSecuritySettingChange('emailNotifications', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h4>Security Alerts</h4>
            <p>Get notified about suspicious login attempts</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={securitySettings.securityAlerts}
              onChange={(e) => handleSecuritySettingChange('securityAlerts', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      <div className="password-section">
        <h4>Change Password</h4>
        <form onSubmit={handlePasswordChange} className="password-form">
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              name="currentPassword"
              placeholder="Enter current password"
              required
            />
          </div>
          
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              placeholder="Enter new password"
              required
              minLength="6"
            />
          </div>
          
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm new password"
              required
              minLength="6"
            />
          </div>
          
          <button type="submit" disabled={loading} className="save-btn">
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="settings-section">
      <h3>User Preferences</h3>
      
      <div className="preference-settings">
        <div className="setting-item">
          <div className="setting-info">
            <h4>Theme</h4>
            <p>Choose your preferred interface theme</p>
          </div>
          <select
            value={userPreferences.theme}
            onChange={(e) => handlePreferenceChange('theme', e.target.value)}
            className="theme-select"
          >
            <option value="light">Light Mode</option>
            <option value="dark">Dark Mode</option>
            <option value="auto">Auto (System)</option>
          </select>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h4>Language</h4>
            <p>Select your preferred language</p>
          </div>
          <select
            value={userPreferences.language}
            onChange={(e) => handlePreferenceChange('language', e.target.value)}
            className="language-select"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </select>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h4>Notifications</h4>
            <p>Enable or disable all notifications</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={userPreferences.notifications}
              onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h4>Auto-save</h4>
            <p>Automatically save form progress</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={userPreferences.autoSave}
              onChange={(e) => handlePreferenceChange('autoSave', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="settings-section">
      <h3>Privacy & Data Management</h3>
      
      <div className="privacy-info">
        <div className="gdpr-compliance">
          <h4>🔒 GDPR Compliance</h4>
          <p>Your data is protected under GDPR regulations. You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request data deletion</li>
            <li>Export your data</li>
            <li>Restrict data processing</li>
          </ul>
        </div>

        <div className="data-actions">
          <div className="data-action-card">
            <h5>📥 Export Your Data</h5>
            <p>Download a copy of all your personal data in JSON format</p>
            <button 
              onClick={handleDataExport} 
              disabled={loading}
              className="export-btn"
            >
              Export My Data
            </button>
          </div>

          <div className="data-action-card danger">
            <h5>🗑️ Erase All Data</h5>
            <p>Permanently delete all your personal data from our systems (GDPR Right to Erasure)</p>
            <button 
              onClick={handleDataErasure} 
              disabled={loading}
              className="erase-btn"
            >
              Erase My Data
            </button>
          </div>
        </div>

        <div className="privacy-notice">
          <h4>Privacy Notice</h4>
          <p>
            We collect and process your data solely for the purpose of exam registration and academic administration. 
            Your data is stored securely and is never shared with third parties without your explicit consent, 
            except as required by law or educational regulations.
          </p>
          <p>
            <strong>Data Retention:</strong> Your data will be retained for the duration of your academic program 
            plus 5 years as required by educational compliance standards.
          </p>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'privacy', label: 'Privacy', icon: '📊' }
  ];

  return (
    <div className="settings-page">
      <div className="page-title">Settings & Preferences</div>
      
      <div className="settings-container">
        <div className="settings-sidebar">
          <div className="user-card">
            <div className="user-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-info">
              <h3>{user.name}</h3>
              <p>{user.email}</p>
              <span className="user-role">{user.role}</span>
            </div>
          </div>
          
          <nav className="settings-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="nav-icon">{tab.icon}</span>
                <span className="nav-label">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="settings-content">
          {message && (
            <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'security' && renderSecurityTab()}
          {activeTab === 'preferences' && renderPreferencesTab()}
          {activeTab === 'privacy' && renderPrivacyTab()}
        </div>
      </div>
    </div>
  );
}

export default Settings;
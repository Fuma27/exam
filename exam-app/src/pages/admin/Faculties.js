// src/pages/admin/Faculties.js
import React, { useState, useEffect } from 'react';
import { api, handleApiError } from '../../utils/api';
import '../../styles/Admin.css';

function Faculties() {
  const [faculties, setFaculties] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('📚 Fetching faculties...');
      
      const data = await api.getFaculties();
      console.log('✅ Faculties data:', data);
      
      setFaculties(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Error fetching faculties:', err);
      const errorMessage = handleApiError(err, 'Failed to load faculties');
      setError(errorMessage);
      setFaculties([]);
    } finally {
      setLoading(false);
    }
  };

  const addFaculty = async () => {
    if (!name.trim()) {
      alert('Please enter a faculty name');
      return;
    }

    try {
      setActionLoading(true);
      console.log('➕ Adding faculty:', name);
      
      // ONLY send name, no description
      const facultyData = {
        name: name.trim()
      };

      console.log('📤 Sending faculty data:', facultyData);

      const newFaculty = await api.createFaculty(facultyData);
      console.log('✅ Faculty added successfully:', newFaculty);

      setName('');
      fetchFaculties();
      alert('Faculty added successfully!');
    } catch (err) {
      console.error('❌ Error adding faculty:', err);
      const errorMessage = handleApiError(err, 'Failed to add faculty');
      alert(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const updateFaculty = async () => {
    if (!name.trim()) {
      alert('Please enter a faculty name');
      return;
    }

    try {
      setActionLoading(true);
      console.log('✏️ Updating faculty:', editingFaculty.id, name);
      
      // ONLY send name, no description
      const facultyData = {
        name: name.trim()
      };

      console.log('📤 Sending faculty update data:', facultyData);

      const updatedFaculty = await api.updateFaculty(editingFaculty.id, facultyData);
      console.log('✅ Faculty updated successfully:', updatedFaculty);

      setName('');
      setEditingFaculty(null);
      fetchFaculties();
      alert('Faculty updated successfully!');
    } catch (err) {
      console.error('❌ Error updating faculty:', err);
      const errorMessage = handleApiError(err, 'Failed to update faculty');
      alert(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const deleteFaculty = async (id) => {
    if (!window.confirm('Are you sure you want to delete this faculty? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(true);
      console.log('🗑️ Deleting faculty ID:', id);
      
      await api.deleteFaculty(id);
      fetchFaculties();
      alert('Faculty deleted successfully!');
    } catch (err) {
      console.error('❌ Error deleting faculty:', err);
      const errorMessage = handleApiError(err, 'Failed to delete faculty');
      alert(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (faculty) => {
    setEditingFaculty(faculty);
    setName(faculty.name);
  };

  const handleCancelEdit = () => {
    setEditingFaculty(null);
    setName('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (editingFaculty) {
        updateFaculty();
      } else {
        addFaculty();
      }
    }
  };

  const getCourseCount = (facultyId) => {
    // This would normally come from the API, but for now we'll return 0
    return 0;
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <h1>Manage Faculties</h1>
        </div>
        <div className="loading">
          <div className="spinner"></div>
          Loading faculties...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page faculties-page">
      <div className="admin-header">
        <h1>
          <i className="fas fa-university"></i> Manage Faculties
        </h1>
        <p>Add and manage university faculties and academic departments</p>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <div>
            <strong>Error:</strong> {error}
          </div>
          <button onClick={fetchFaculties} className="retry-btn" disabled={actionLoading}>
            <i className="fas fa-redo"></i> Try Again
          </button>
        </div>
      )}

      {/* Add/Edit Faculty Form */}
      <div className="card form-card">
        <div className="card-header">
          <h3>
            <i className={editingFaculty ? "fas fa-edit" : "fas fa-plus"}></i>
            {editingFaculty ? ' Edit Faculty' : ' Add New Faculty'}
          </h3>
          {editingFaculty && (
            <button onClick={handleCancelEdit} className="cancel-btn">
              <i className="fas fa-times"></i> Cancel Edit
            </button>
          )}
        </div>
        
        <div className="form-content">
          <div className="form-group">
            <label>
              <i className="fas fa-university"></i> Faculty Name *
            </label>
            <input 
              placeholder="e.g., Faculty of Engineering, School of Medicine" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={actionLoading}
            />
            <div className="form-hint">
              Enter the full name of the faculty or academic department
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              onClick={editingFaculty ? updateFaculty : addFaculty} 
              className="save-btn"
              disabled={!name.trim() || actionLoading}
            >
              {actionLoading ? (
                <>
                  <div className="spinner small"></div>
                  {editingFaculty ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  <i className="fas fa-check"></i>
                  {editingFaculty ? ' Update Faculty' : ' Add Faculty'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Faculties List */}
      <div className="card">
        <div className="card-header">
          <h3>
            <i className="fas fa-list"></i> Existing Faculties ({faculties.length})
          </h3>
          <div className="card-actions">
            <button onClick={fetchFaculties} className="refresh-btn" disabled={actionLoading}>
              <i className="fas fa-sync-alt"></i> Refresh
            </button>
          </div>
        </div>
        
        {faculties.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-university empty-icon"></i>
            <h4>No Faculties Found</h4>
            <p>Add your first faculty to get started with course management.</p>
          </div>
        ) : (
          <div className="faculties-grid">
            {faculties.map(faculty => (
              <div key={faculty.id} className="faculty-card">
                <div className="faculty-header">
                  <div className="faculty-info">
                    <h4>{faculty.name}</h4>
                    <div className="faculty-meta">
                      <span className="meta-item">
                        <i className="fas fa-hashtag"></i> ID: {faculty.id}
                      </span>
                      <span className="meta-item">
                        <i className="fas fa-book"></i> Courses: {getCourseCount(faculty.id)}
                      </span>
                      <span className="meta-item">
                        <i className="fas fa-calendar"></i> Created: {faculty.created_at ? new Date(faculty.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="faculty-actions">
                    <button 
                      onClick={() => handleEdit(faculty)} 
                      className="edit-btn"
                      disabled={actionLoading}
                    >
                      <i className="fas fa-edit"></i> Edit
                    </button>
                    <button 
                      onClick={() => deleteFaculty(faculty.id)} 
                      className="delete-btn"
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-trash"></i>
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-university"></i>
          </div>
          <div className="stat-content">
            <h4>Total Faculties</h4>
            <span className="stat-number">{faculties.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-book"></i>
          </div>
          <div className="stat-content">
            <h4>Active Courses</h4>
            <span className="stat-number">
              {faculties.reduce((total, faculty) => total + getCourseCount(faculty.id), 0)}
            </span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-content">
            <h4>Last Updated</h4>
            <span className="stat-text">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="help-section">
        <h4>
          <i className="fas fa-info-circle"></i> About Faculties
        </h4>
        <p>
          Faculties are the main academic divisions of the university. Each faculty organizes related courses 
          and programs under specific academic disciplines.
        </p>
        <div className="help-points">
          <div className="help-point">
            <i className="fas fa-graduation-cap"></i>
            <div>
              <strong>Academic Organization</strong>
              <p>Faculties group related courses by discipline (Engineering, Science, Arts, etc.)</p>
            </div>
          </div>
          <div className="help-point">
            <i className="fas fa-book"></i>
            <div>
              <strong>Course Management</strong>
              <p>Each course must be associated with a faculty for proper organization</p>
            </div>
          </div>
          <div className="help-point">
            <i className="fas fa-users"></i>
            <div>
              <strong>Student Association</strong>
              <p>Students are enrolled in specific faculties based on their programs</p>
            </div>
          </div>
          <div className="help-point">
            <i className="fas fa-exclamation-triangle"></i>
            <div>
              <strong>Important Notes</strong>
              <p>Faculties with existing courses cannot be deleted. Remove all courses first.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Faculties;
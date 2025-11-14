// src/pages/admin/Courses.js
import React, { useState, useEffect } from 'react';
import { api, handleApiError } from '../../utils/api';
import '../../styles/Admin.css';

function Courses() {
  const [courses, setCourses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  const [form, setForm] = useState({
    code: '',
    name: '',
    faculty_id: '',
    price: '',
    description: '',
    duration: '3 hours',
    credits: '3',
    exam_date: '',
    exam_time: '',
    venue: ''
  });

  useEffect(() => {
    fetchCourses();
    fetchFaculties();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('📚 Fetching courses...');
      
      const data = await api.getCourses();
      console.log('✅ Courses data:', data);
      
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Error fetching courses:', err);
      const errorMessage = handleApiError(err, 'Failed to load courses');
      setError(errorMessage);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculties = async () => {
    try {
      console.log('🏛️ Fetching faculties...');
      const data = await api.getFaculties();
      console.log('✅ Faculties data:', data);
      setFaculties(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Error fetching faculties:', err);
      const errorMessage = handleApiError(err, 'Failed to load faculties');
      // Don't set main error for faculties as it's not critical
      setFaculties([]);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      setError('');

      const courseData = {
        ...form,
        price: parseFloat(form.price),
        credits: parseInt(form.credits),
        faculty_id: parseInt(form.faculty_id)
      };

      console.log('➕ Adding course:', courseData);
      
      const newCourse = await api.createCourse(courseData);
      console.log('✅ Course added successfully:', newCourse);
      
      setCourses(prev => [...prev, newCourse]);
      setShowAddForm(false);
      resetForm();
      
      alert('Course added successfully!');
      
    } catch (err) {
      console.error('❌ Error adding course:', err);
      const errorMessage = handleApiError(err, 'Failed to add course');
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setForm({
      code: course.code || '',
      name: course.name || '',
      faculty_id: course.faculty_id?.toString() || '',
      price: course.price?.toString() || '',
      description: course.description || '',
      duration: course.duration || '3 hours',
      credits: course.credits?.toString() || '3',
      exam_date: course.exam_date || '',
      exam_time: course.exam_time || '',
      venue: course.venue || ''
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      setError('');

      const courseData = {
        ...form,
        price: parseFloat(form.price),
        credits: parseInt(form.credits),
        faculty_id: parseInt(form.faculty_id)
      };

      console.log('✏️ Updating course:', editingCourse.id, courseData);
      
      const updatedCourse = await api.updateCourse(editingCourse.id, courseData);
      console.log('✅ Course updated successfully:', updatedCourse);
      
      setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
      setEditingCourse(null);
      resetForm();
      
      alert('Course updated successfully!');
      
    } catch (err) {
      console.error('❌ Error updating course:', err);
      const errorMessage = handleApiError(err, 'Failed to update course');
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;

    try {
      setActionLoading(true);
      setError('');

      console.log('🗑️ Deleting course ID:', id);
      await api.deleteCourse(id);
      
      setCourses(prev => prev.filter(c => c.id !== id));
      alert('Course deleted successfully!');
      
    } catch (err) {
      console.error('❌ Error deleting course:', err);
      const errorMessage = handleApiError(err, 'Failed to delete course');
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      code: '', 
      name: '', 
      faculty_id: '', 
      price: '', 
      description: '',
      duration: '3 hours', 
      credits: '3', 
      exam_date: '', 
      exam_time: '', 
      venue: ''
    });
  };

  const getFacultyName = (facultyId) => {
    const faculty = faculties.find(f => f.id == facultyId);
    return faculty ? faculty.name : 'Unknown Faculty';
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <h1>Manage Courses</h1>
        </div>
        <div className="loading">
          <div className="spinner"></div>
          Loading courses...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page courses-page">
      {/* HEADER */}
      <div className="admin-header">
        <h1>
          <i className="fas fa-book"></i> Manage Courses
        </h1>
        <p>Add and manage university courses for exam registration</p>
        <button 
          className="add-btn" 
          onClick={() => setShowAddForm(true)}
          disabled={actionLoading}
        >
          <i className="fas fa-plus"></i> Add Course
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <div>
            <strong>Error:</strong> {error}
          </div>
          <button onClick={fetchCourses} className="retry-btn" disabled={actionLoading}>
            <i className="fas fa-redo"></i> Refresh
          </button>
        </div>
      )}

      {/* MODAL */}
      {(showAddForm || editingCourse) && (
        <div className="modal-overlay" onClick={() => { 
          if (!actionLoading) {
            setShowAddForm(false); 
            setEditingCourse(null); 
            resetForm(); 
          }
        }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className="fas fa-book"></i> 
                {editingCourse ? 'Edit Course' : 'Add New Course'}
              </h2>
              <button 
                className="close-btn"
                onClick={() => { setShowAddForm(false); setEditingCourse(null); resetForm(); }}
                disabled={actionLoading}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={editingCourse ? handleUpdate : handleAdd}>
              <div className="form-grid">
                <div className="form-group">
                  <label>
                    <i className="fas fa-code"></i> Course Code *
                  </label>
                  <input 
                    placeholder="e.g., CS101" 
                    value={form.code} 
                    onChange={e => setForm({ ...form, code: e.target.value })} 
                    required 
                    disabled={actionLoading}
                  />
                </div>
                <div className="form-group">
                  <label>
                    <i className="fas fa-book"></i> Course Name *
                  </label>
                  <input 
                    placeholder="e.g., Introduction to Computer Science" 
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })} 
                    required 
                    disabled={actionLoading}
                  />
                </div>
                <div className="form-group">
                  <label>
                    <i className="fas fa-university"></i> Faculty *
                  </label>
                  <select 
                    value={form.faculty_id} 
                    onChange={e => setForm({ ...form, faculty_id: e.target.value })} 
                    required
                    disabled={actionLoading}
                  >
                    <option value="">Select Faculty</option>
                    {faculties.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>
                    <i className="fas fa-money-bill-wave"></i> Price (M) *
                  </label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    placeholder="2000.00" 
                    value={form.price} 
                    onChange={e => setForm({ ...form, price: e.target.value })} 
                    required 
                    disabled={actionLoading}
                  />
                </div>
                <div className="form-group full-width">
                  <label>
                    <i className="fas fa-align-left"></i> Description
                  </label>
                  <textarea 
                    placeholder="Course overview, learning objectives, etc." 
                    value={form.description} 
                    onChange={e => setForm({ ...form, description: e.target.value })} 
                    rows="3" 
                    disabled={actionLoading}
                  />
                </div>
                <div className="form-group">
                  <label>
                    <i className="fas fa-clock"></i> Duration
                  </label>
                  <select 
                    value={form.duration} 
                    onChange={e => setForm({ ...form, duration: e.target.value })}
                    disabled={actionLoading}
                  >
                    <option value="2 hours">2 hours</option>
                    <option value="3 hours">3 hours</option>
                    <option value="4 hours">4 hours</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>
                    <i className="fas fa-star"></i> Credits
                  </label>
                  <select 
                    value={form.credits} 
                    onChange={e => setForm({ ...form, credits: e.target.value })}
                    disabled={actionLoading}
                  >
                    <option value="2">2 Credits</option>
                    <option value="3">3 Credits</option>
                    <option value="4">4 Credits</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>
                    <i className="fas fa-calendar"></i> Exam Date *
                  </label>
                  <input 
                    type="date" 
                    value={form.exam_date} 
                    onChange={e => setForm({ ...form, exam_date: e.target.value })} 
                    required 
                    disabled={actionLoading}
                  />
                </div>
                <div className="form-group">
                  <label>
                    <i className="fas fa-clock"></i> Exam Time *
                  </label>
                  <input 
                    type="time" 
                    value={form.exam_time} 
                    onChange={e => setForm({ ...form, exam_time: e.target.value })} 
                    required 
                    disabled={actionLoading}
                  />
                </div>
                <div className="form-group">
                  <label>
                    <i className="fas fa-map-marker-alt"></i> Venue *
                  </label>
                  <input 
                    placeholder="e.g., Main Hall A, Science Building B" 
                    value={form.venue} 
                    onChange={e => setForm({ ...form, venue: e.target.value })} 
                    required 
                    disabled={actionLoading}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => { setShowAddForm(false); setEditingCourse(null); resetForm(); }} 
                  className="cancel-btn"
                  disabled={actionLoading}
                >
                  <i className="fas fa-times"></i> Cancel
                </button>
                <button 
                  type="submit" 
                  className="save-btn"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <div className="spinner small"></div>
                      {editingCourse ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check"></i> 
                      {editingCourse ? 'Update Course' : 'Add Course'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COURSES GRID */}
      <div className="courses-list">
        <div className="courses-header">
          <h3>
            <i className="fas fa-list"></i> Available Courses ({courses.length})
          </h3>
          <p>These courses are available for student exam registration</p>
        </div>

        {courses.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-book empty-icon"></i>
            <h4>No Courses Available</h4>
            <p>Add your first course to get started.</p>
            <button 
              className="add-btn" 
              onClick={() => setShowAddForm(true)}
              disabled={actionLoading}
            >
              <i className="fas fa-plus"></i> Add First Course
            </button>
          </div>
        ) : (
          <div className="courses-grid">
            {courses.map(course => (
              <div key={course.id} className="course-card">
                <div className="course-header">
                  <div className="course-title">
                    <h4>{course.code}</h4>
                    <h3>{course.name}</h3>
                  </div>
                  <div className="course-price">M{course.price}</div>
                </div>
                
                <div className="course-details">
                  <div className="detail-item">
                    <i className="fas fa-university"></i>
                    <span><strong>Faculty:</strong> {getFacultyName(course.faculty_id)}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-star"></i>
                    <span><strong>Credits:</strong> {course.credits}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-clock"></i>
                    <span><strong>Duration:</strong> {course.duration}</span>
                  </div>
                  
                  {course.description && (
                    <div className="course-description">
                      <p>{course.description}</p>
                    </div>
                  )}
                  
                  {course.exam_date && (
                    <div className="exam-info">
                      <div className="detail-item">
                        <i className="fas fa-calendar"></i>
                        <span><strong>Exam Date:</strong> {formatDate(course.exam_date)}</span>
                      </div>
                      <div className="detail-item">
                        <i className="fas fa-clock"></i>
                        <span><strong>Exam Time:</strong> {formatTime(course.exam_time)}</span>
                      </div>
                      <div className="detail-item">
                        <i className="fas fa-map-marker-alt"></i>
                        <span><strong>Venue:</strong> {course.venue}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="course-actions">
                  <button 
                    onClick={() => handleEdit(course)} 
                    className="edit-btn"
                    disabled={actionLoading}
                  >
                    <i className="fas fa-edit"></i> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(course.id)} 
                    className="delete-btn"
                    disabled={actionLoading}
                  >
                    <i className="fas fa-trash"></i> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STATS */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-book"></i>
          </div>
          <div className="stat-content">
            <h4>Total Courses</h4>
            <span className="stat-number">{courses.length}</span>
          </div>
        </div>
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
            <i className="fas fa-money-bill-wave"></i>
          </div>
          <div className="stat-content">
            <h4>Average Price</h4>
            <span className="stat-number">
              M{courses.length > 0 
                ? (courses.reduce((sum, c) => sum + parseFloat(c.price || 0), 0) / courses.length).toFixed(2)
                : '0.00'
              }
            </span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-star"></i>
          </div>
          <div className="stat-content">
            <h4>Total Credits</h4>
            <span className="stat-number">
              {courses.reduce((sum, c) => sum + parseInt(c.credits || 0), 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Courses;
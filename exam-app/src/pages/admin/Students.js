// src/pages/admin/Students.js
import React, { useState, useEffect } from 'react';
import { api, handleApiError } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Admin.css';

function Students() {
  const [studentsWithRegistrations, setStudentsWithRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchStudentsWithRegistrations();
    }
  }, [user]);

  const fetchStudentsWithRegistrations = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('📊 Fetching students and registrations...');
      
      // Get users and registrations
      const usersData = await api.getAllUsers();
      const registrationsData = await api.getAllRegistrations();

      console.log('👥 Users data:', usersData);
      console.log('📝 Registrations data:', registrationsData);

      // Filter students and combine with their registrations
      const studentsWithExams = usersData
        .filter(user => user.role === 'student')
        .map(student => {
          const studentRegistrations = registrationsData.filter(
            reg => reg.studentId === (student.studentId || student.student_id)
          );

          return {
            ...student,
            registrations: studentRegistrations,
            totalRegistrations: studentRegistrations.length,
            totalAmountPaid: studentRegistrations.reduce((sum, reg) => sum + parseFloat(reg.totalAmount || reg.amountPaid || 0), 0)
          };
        })
        .filter(student => student.registrations.length > 0);

      console.log('✅ Students with exams:', studentsWithExams);
      setStudentsWithRegistrations(studentsWithExams);
    } catch (err) {
      console.error('❌ Error loading student data:', err);
      const errorMessage = handleApiError(err, 'Failed to load student registration data');
      setError(errorMessage);
      setStudentsWithRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const parseSelectedCourses = (selectedCourses) => {
    if (!selectedCourses) return [];
    try {
      // If it's already an array, return it
      if (Array.isArray(selectedCourses)) return selectedCourses;
      
      // Try to parse JSON
      const parsed = JSON.parse(selectedCourses);
      if (Array.isArray(parsed)) return parsed;
      if (typeof parsed === 'object') return Object.values(parsed);
      if (typeof parsed === 'string') return parsed.split(',').map(item => item.trim());
      return [];
    } catch {
      // If JSON parsing fails, try to handle as string
      if (typeof selectedCourses === 'string') {
        return selectedCourses.split(',').map(item => item.trim());
      }
      return [];
    }
  };

  const filteredStudents = studentsWithRegistrations.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    return (
      student.name?.toLowerCase().includes(searchLower) ||
      student.email?.toLowerCase().includes(searchLower) ||
      (student.studentId || student.student_id)?.toLowerCase().includes(searchLower) ||
      student.faculty?.toLowerCase().includes(searchLower)
    );
  });

  const totalStudents = studentsWithRegistrations.length;
  const totalRegistrations = studentsWithRegistrations.reduce((sum, s) => sum + s.totalRegistrations, 0);
  const totalRevenue = studentsWithRegistrations.reduce((sum, s) => sum + s.totalAmountPaid, 0);

  if (user?.role !== 'admin') {
    return (
      <div className="admin-page">
        <div className="card">
          <h2>Access Denied</h2>
          <p>You need administrator privileges to view this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <h1>Student Exam Registrations</h1>
        </div>
        <div className="loading">
          <div className="spinner"></div>
          Loading students...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page students-page">
      <div className="admin-header">
        <h1>📊 Student Exam Registrations</h1>
        <p>View all registered students and their exam details</p>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <div>
            <strong>Error:</strong> {error}
          </div>
          <button onClick={fetchStudentsWithRegistrations} className="retry-btn">
            <i className="fas fa-redo"></i> Try Again
          </button>
        </div>
      )}

      {/* SEARCH + STATS */}
      <div className="filters-section">
        <div className="search-container">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search by name, email, ID, or faculty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button onClick={fetchStudentsWithRegistrations} className="refresh-btn">
          <i className="fas fa-sync-alt"></i> Refresh
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-content">
            <h3>Registered Students</h3>
            <span className="stat-number">{totalStudents}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-clipboard-list"></i>
          </div>
          <div className="stat-content">
            <h3>Total Registrations</h3>
            <span className="stat-number">{totalRegistrations}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-money-bill-wave"></i>
          </div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <span className="stat-number">M{totalRevenue.toFixed(2)}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="stat-content">
            <h3>Average per Student</h3>
            <span className="stat-number">
              M{totalStudents > 0 ? (totalRevenue / totalStudents).toFixed(2) : '0.00'}
            </span>
          </div>
        </div>
      </div>

      {/* CARD GRID */}
      <div className="students-grid">
        {filteredStudents.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-user-graduate empty-icon"></i>
            <h4>No Students Found</h4>
            <p>
              {studentsWithRegistrations.length === 0
                ? 'No students have registered for exams yet.'
                : 'No students match your search criteria.'}
            </p>
            <button onClick={fetchStudentsWithRegistrations} className="refresh-btn">
              <i className="fas fa-sync-alt"></i> Refresh Data
            </button>
          </div>
        ) : (
          filteredStudents.map((student) => (
            <div key={student.id} className="student-card">
              {/* STUDENT HEADER */}
              <div className="student-header">
                <div className="student-avatar">
                  {student.name?.charAt(0).toUpperCase() || 'S'}
                </div>
                <div className="student-info">
                  <h3>{student.name || 'Unknown Student'}</h3>
                  <p className="student-id">
                    <i className="fas fa-id-card"></i> 
                    ID: {student.studentId || student.student_id || 'N/A'}
                  </p>
                  <p className="student-email">
                    <i className="fas fa-envelope"></i> 
                    {student.email}
                  </p>
                  <p className="student-faculty">
                    <i className="fas fa-university"></i> 
                    {student.faculty || 'No Faculty'}
                  </p>
                </div>
                <div className="student-stats">
                  <div className="stat">
                    <span className="label">Courses</span>
                    <span className="value">{student.totalRegistrations}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Paid</span>
                    <span className="value">M{student.totalAmountPaid.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* REGISTRATIONS */}
              <div className="registrations-list">
                <h4>
                  <i className="fas fa-clipboard-check"></i> 
                  Exam Registrations ({student.registrations.length})
                </h4>
                {student.registrations.map((reg, index) => {
                  const courses = parseSelectedCourses(reg.selectedCourses);
                  return (
                    <div key={reg.id || index} className="registration-card">
                      <div className="reg-header">
                        <span className="reg-id">
                          <i className="fas fa-hashtag"></i> #{reg.id}
                        </span>
                        <span className="reg-date">
                          <i className="fas fa-calendar"></i> 
                          {reg.created_at ? new Date(reg.created_at).toLocaleDateString() : 'Unknown Date'}
                        </span>
                        <span className={`reg-status status-${reg.status || 'registered'}`}>
                          {reg.status || 'Registered'}
                        </span>
                      </div>
                      <div className="reg-body">
                        <div className="reg-info">
                          <p>
                            <i className="fas fa-money-bill-wave"></i>
                            <strong>Amount Paid:</strong> M{parseFloat(reg.amountPaid || reg.totalAmount || 0).toFixed(2)}
                          </p>
                          <p>
                            <i className="fas fa-credit-card"></i>
                            <strong>Payment Method:</strong> {reg.paymentMethod || 'N/A'}
                          </p>
                          {reg.transactionId && (
                            <p>
                              <i className="fas fa-receipt"></i>
                              <strong>Transaction ID:</strong> {reg.transactionId}
                            </p>
                          )}
                        </div>
                        <div className="reg-courses">
                          <p>
                            <i className="fas fa-book"></i>
                            <strong>Registered Courses ({courses.length}):</strong>
                          </p>
                          <div className="course-tags">
                            {courses.slice(0, 3).map((course, idx) => (
                              <span key={idx} className="course-tag">
                                {typeof course === 'object' ? course.name || course.code || course.id : course}
                              </span>
                            ))}
                            {courses.length > 3 && (
                              <span className="more-courses">+{courses.length - 3} more</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {reg.slipFilename && (
                        <a
                          href={`http://localhost:5000/uploads/${reg.slipFilename}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="slip-link"
                        >
                          <i className="fas fa-file-invoice"></i> View Payment Slip
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="summary-section">
        <i className="fas fa-info-circle"></i>
        Showing <strong>{filteredStudents.length}</strong> of <strong>{studentsWithRegistrations.length}</strong> registered students
      </div>
    </div>
  );
}

export default Students;
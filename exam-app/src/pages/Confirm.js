import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import '../styles/Confirm.css';

function RegisteredExams() {
  const { user } = useAuth();
  const [registeredExams, setRegisteredExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchRegisteredExams();
    }
  }, [user]);

  const fetchRegisteredExams = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 User object:', user);
      
      // Get student ID from user object - try different possible property names
      const studentId = user.studentId || user.student_id || user.id;
      
      if (!studentId) {
        throw new Error('Student ID not found in user profile. Please contact support.');
      }
      
      console.log('📋 Fetching exams for student ID:', studentId);
      
      // Since authFetch automatically returns response.data, we get the array directly
      const registrations = await api.getStudentRegistrations(studentId);
      
      console.log('✅ Registration data received:', registrations);
      
      // Now registrations should be the array directly
      if (Array.isArray(registrations)) {
        setRegisteredExams(registrations);
      } else {
        console.warn('Unexpected response format:', registrations);
        setRegisteredExams([]);
      }
    } catch (err) {
      console.error('❌ Error fetching registered exams:', err);
      setError(err.message || 'Failed to load registered exams. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalAmount = () => {
    return registeredExams.reduce((total, exam) => total + parseFloat(exam.totalAmount || 0), 0);
  };

  const getExamStatus = (exam) => {
    if (exam.status === 'approved') return 'Approved';
    if (exam.status === 'pending') return 'Pending Review';
    if (exam.status === 'rejected') return 'Rejected';
    return 'Registered';
  };

  const getStatusClass = (exam) => {
    if (exam.status === 'approved') return 'status-approved';
    if (exam.status === 'pending') return 'status-pending';
    if (exam.status === 'rejected') return 'status-rejected';
    return 'status-registered';
  };

  // Safe function to parse selected courses
  const parseSelectedCourses = (selectedCourses) => {
    if (!selectedCourses) return [];
    
    try {
      // Try to parse as JSON
      const parsed = JSON.parse(selectedCourses);
      
      // Handle different possible formats
      if (Array.isArray(parsed)) {
        return parsed;
      } else if (typeof parsed === 'object' && parsed !== null) {
        // If it's an object, convert to array of course IDs or names
        return Object.values(parsed);
      } else if (typeof parsed === 'string') {
        // If it's a string, try to split by comma
        return parsed.split(',').map(item => item.trim());
      }
      
      return [];
    } catch (error) {
      console.error('Error parsing selectedCourses:', error);
      console.log('Raw selectedCourses:', selectedCourses);
      
      // If JSON parsing fails, try to handle as string
      if (typeof selectedCourses === 'string') {
        // Check if it's already an array-like string
        if (selectedCourses.startsWith('[') && selectedCourses.endsWith(']')) {
          // Remove brackets and split
          return selectedCourses.slice(1, -1).split(',').map(item => item.trim().replace(/"/g, ''));
        }
        // Try comma separation
        return selectedCourses.split(',').map(item => item.trim());
      }
      
      return [];
    }
  };

  // Format course ID for display - enhanced to handle course objects
  const formatCourseDisplay = (courseId) => {
    if (typeof courseId === 'number') {
      return `Course #${courseId}`;
    }
    if (typeof courseId === 'string') {
      // Check if it's a course name or just an ID
      if (courseId.length > 20) {
        return `${courseId.substring(0, 20)}...`;
      }
      return courseId;
    }
    if (typeof courseId === 'object' && courseId !== null) {
      // If it's a course object, return the name
      return courseId.name || courseId.code || 'Unknown Course';
    }
    return 'Unknown Course';
  };

  // Get course details if available
  const getCourseDetails = (courseId) => {
    if (typeof courseId === 'object' && courseId !== null) {
      return {
        name: courseId.name || 'Unknown Course',
        code: courseId.code || 'N/A',
        price: courseId.price || 0
      };
    }
    return {
      name: formatCourseDisplay(courseId),
      code: 'N/A',
      price: 0
    };
  };

  // If user is not loaded yet
  if (!user) {
    return (
      <>
        <div className="page-title">My Registered Exams</div>
        <div className="confirm-page container">
          <div className="loading">Loading user information...</div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <div className="page-title">My Registered Exams</div>
        <div className="confirm-page container">
          <div className="loading">
            <div className="spinner"></div>
            Loading your registered exams...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-title">My Registered Exams</div>
      <div className="confirm-page container">
        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
            <button onClick={fetchRegisteredExams} className="retry-btn">
              Try Again
            </button>
          </div>
        )}

        {!registeredExams || registeredExams.length === 0 ? (
          <div className="no-exams">
            <div className="no-exams-icon">📝</div>
            <h3>No Exams Registered</h3>
            <p>You haven't registered for any exams yet.</p>
            <button 
              className="register-btn"
              onClick={() => window.location.href = '/register-exam'}
            >
              Register for Exams
            </button>
          </div>
        ) : (
          <>
            <div className="student-info">
              <h3>Student Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <strong>Name:</strong> {user.name}
                </div>
                <div className="info-item">
                  <strong>Student ID:</strong> {user.studentId || user.student_id || 'N/A'}
                </div>
                <div className="info-item">
                  <strong>Email:</strong> {user.email}
                </div>
                <div className="info-item">
                  <strong>Faculty:</strong> {user.faculty || 'Not specified'}
                </div>
              </div>
            </div>

            <div className="exams-summary">
              <div className="summary-card">
                <h3>Total Registrations</h3>
                <span className="summary-number">{registeredExams.length}</span>
              </div>
              <div className="summary-card">
                <h3>Total Amount Paid</h3>
                <span className="summary-number">M{calculateTotalAmount().toFixed(2)}</span>
              </div>
              <div className="summary-card">
                <h3>Latest Verification Code</h3>
                <span className="summary-code">
                  {registeredExams[0]?.verificationCode || 'N/A'}
                </span>
              </div>
            </div>

            <div className="registered-exams-list">
              <h3>Your Registered Exams</h3>
              
              {registeredExams.map((exam, index) => {
                const courses = parseSelectedCourses(exam.selectedCourses);
                
                return (
                  <div key={exam.id || index} className="exam-item">
                    <div className="exam-header">
                      <span className="exam-number">Registration #{exam.id}</span>
                      <span className={`exam-status ${getStatusClass(exam)}`}>
                        {getExamStatus(exam)}
                      </span>
                    </div>
                    
                    <div className="exam-details">
                      <div className="exam-info">
                        <div className="info-row">
                          <strong>Registration Date:</strong>
                          <span>{new Date(exam.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="info-row">
                          <strong>Total Amount:</strong>
                          <span>M{parseFloat(exam.totalAmount || 0).toFixed(2)}</span>
                        </div>
                        <div className="info-row">
                          <strong>Amount Paid:</strong>
                          <span>M{parseFloat(exam.amountPaid || 0).toFixed(2)}</span>
                        </div>
                        <div className="info-row">
                          <strong>Payment Method:</strong>
                          <span>{exam.paymentMethod || 'Not specified'}</span>
                        </div>
                        {exam.transactionId && (
                          <div className="info-row">
                            <strong>Transaction ID:</strong>
                            <span className="transaction-id">{exam.transactionId}</span>
                          </div>
                        )}
                        {exam.verificationCode && (
                          <div className="info-row">
                            <strong>Verification Code:</strong>
                            <span className="verification-code">{exam.verificationCode}</span>
                          </div>
                        )}
                      </div>

                      <div className="courses-list">
                        <h4>Registered Courses ({courses.length})</h4>
                        {courses.length > 0 ? (
                          <div className="courses-grid">
                            {courses.map((course, courseIndex) => {
                              const courseDetails = getCourseDetails(course);
                              return (
                                <div key={courseIndex} className="course-chip">
                                  <div className="course-name">{courseDetails.name}</div>
                                  {courseDetails.code !== 'N/A' && (
                                    <div className="course-code">{courseDetails.code}</div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="no-courses">
                            <p>No course information available</p>
                            <small>Contact administration for course details</small>
                          </div>
                        )}
                      </div>
                    </div>

                    {exam.slipFilename && (
                      <div className="slip-download">
                        <a 
                          href={`http://localhost:5000/uploads/${exam.slipFilename}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="download-btn"
                        >
                          📄 View Payment Slip
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="actions-section">
              <button 
                className="print-btn"
                onClick={() => window.print()}
              >
                📄 Print Registration Summary
              </button>
              <button 
                className="new-registration-btn"
                onClick={() => window.location.href = '/register-exam'}
              >
                ➕ Register More Exams
              </button>
              <button 
                className="refresh-btn"
                onClick={fetchRegisteredExams}
              >
                🔄 Refresh
              </button>
            </div>

            <div className="help-section">
              <h4>Need Help?</h4>
              <p>
                If you notice any issues with your registration or have questions about your exams, 
                please contact the administration office at{' '}
                <a href="mailto:registrar@university.edu">registrar@university.edu</a>
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default RegisteredExams;
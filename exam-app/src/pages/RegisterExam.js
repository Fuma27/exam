// src/pages/RegisterExam.js - UPDATED WITH FACULTY-BASED COURSE FILTERING
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/RegisterExam.css';

function RegisterExam() {
  const { user, token } = useAuth();
  const [slip, setSlip] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [formData, setFormData] = useState({
    studentName: '',
    studentId: '',
    department: '',
    degree: '',
    academicYear: '',
    examDate: '',
    faculty_id: '',
    amountPaid: '',
    paymentMethod: '',
    transactionId: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verification, setVerification] = useState(null);

  // Filter courses based on selected faculty
  const filteredCourses = formData.faculty_id 
    ? courses.filter(course => course.faculty_id == formData.faculty_id)
    : courses;

  // Fetch courses and faculties from backend
  useEffect(() => {
    fetchCourses();
    fetchFaculties();
    generateVerificationCode();
    
    // Pre-fill user data if available
    if (user) {
      setFormData(prev => ({
        ...prev,
        studentName: user.name || '',
        studentId: user.studentId || user.student_id || '',
        faculty: user.faculty || ''
      }));
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch('http://localhost:5000/api/courses', {
        headers
      });
      
      if (res.ok) {
        const response = await res.json();
        console.log('Courses API response:', response);
        
        // Handle both response structures
        if (response.success && Array.isArray(response.data)) {
          setCourses(response.data);
        } else if (Array.isArray(response)) {
          setCourses(response);
        } else {
          console.error('Unexpected courses response format:', response);
          setCourses([]);
          setMessage('Failed to load courses. Invalid response format.');
        }
      } else {
        console.error('Failed to fetch courses, status:', res.status);
        setCourses([]);
        setMessage('Failed to load courses. Please refresh the page.');
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      setCourses([]);
      setMessage('Network error loading courses. Please try again.');
    }
  };

  const fetchFaculties = async () => {
    try {
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch('http://localhost:5000/api/admin/faculties', {
        headers
      });
      
      if (res.ok) {
        const response = await res.json();
        console.log('Faculties API response:', response);
        
        // Handle both response structures
        if (response.success && Array.isArray(response.data)) {
          setFaculties(response.data);
        } else if (Array.isArray(response)) {
          setFaculties(response);
        } else {
          console.error('Unexpected faculties response format:', response);
          setFaculties([]);
        }
      } else {
        console.error('Failed to fetch faculties, status:', res.status);
        setFaculties([]);
      }
    } catch (err) {
      console.error('Failed to fetch faculties:', err);
      setFaculties([]);
    }
  };

  const generateVerificationCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);
    return code;
  };

  // Calculate total price for selected courses
  const total = selectedCourses.reduce((sum, courseId) => {
    const course = courses.find(c => c.id === courseId);
    return sum + (parseFloat(course?.price) || 0);
  }, 0);

  const validateForm = () => {
    // Student information validation
    if (!formData.studentName.trim()) {
      setMessage('Please enter your full name');
      return false;
    }

    if (!formData.studentId.trim()) {
      setMessage('Please enter your student ID');
      return false;
    }

    if (!formData.faculty_id) {
      setMessage('Please select your faculty');
      return false;
    }

    if (!formData.department.trim()) {
      setMessage('Please enter your department');
      return false;
    }

    if (!formData.degree.trim()) {
      setMessage('Please enter your degree/diploma');
      return false;
    }

    if (!formData.academicYear.trim()) {
      setMessage('Please enter academic year');
      return false;
    }

    // Course selection validation
    if (selectedCourses.length === 0) {
      setMessage('Please select at least one course');
      return false;
    }

    // Payment validation
    if (!formData.amountPaid || parseFloat(formData.amountPaid) <= 0) {
      setMessage('Please enter a valid payment amount');
      return false;
    }

    if (parseFloat(formData.amountPaid) < total) {
      setMessage(`Insufficient payment. Required: M${total.toFixed(2)}, Paid: M${parseFloat(formData.amountPaid).toFixed(2)}`);
      return false;
    }

    if (!formData.paymentMethod) {
      setMessage('Please select a payment method');
      return false;
    }

    if (!formData.transactionId.trim()) {
      setMessage('Please enter transaction ID/reference');
      return false;
    }

    if (!slip) {
      setMessage('Please upload payment slip');
      return false;
    }

    return true;
  };

  const handleSlipVerification = async () => {
    if (!slip || selectedCourses.length === 0) {
      setMessage('Please select courses and upload payment slip first');
      return;
    }

    setLoading(true);
    setMessage('');
    
    try {
      const formData = new FormData();
      formData.append('slip', slip);
      formData.append('courseIds', selectedCourses.join(','));
      formData.append('totalRequired', total);

      console.log('Verifying slip...');

      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('http://localhost:5000/api/admin/verify-slip', {
        method: 'POST',
        body: formData,
        headers
      });

      if (!res.ok) {
        throw new Error('Verification failed');
      }

      const data = await res.json();
      setVerification(data);
      
      if (data.verified) {
        setMessage(`✅ ${data.message}`);
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (err) {
      console.error('Error verifying slip:', err);
      setMessage('Failed to verify payment slip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Starting registration process...');
    console.log('Form data:', formData);
    console.log('Selected courses:', selectedCourses);
    console.log('Slip file:', slip);
    console.log('Total amount:', total);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage('');
    
    try {
      // Prepare submission data
      const submissionData = {
        ...formData,
        selectedCourses,
        totalAmount: total,
        amountPaid: parseFloat(formData.amountPaid),
        verificationCode: verificationCode
      };

      console.log('Submitting registration data:', submissionData);

      const formDataToSend = new FormData();
      formDataToSend.append('studentData', JSON.stringify(submissionData));
      
      if (slip) {
        formDataToSend.append('slip', slip);
      }

      // Add authorization header if token exists
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Submit registration
      const res = await fetch('http://localhost:5000/api/exam/register', {
        method: 'POST',
        body: formDataToSend,
        headers
      });

      console.log('Response status:', res.status);

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        const errorText = await res.text();
        console.error('Server error response:', errorText);
        throw new Error(`Registration failed: ${res.status}`);
      }

      const result = await res.json();
      console.log('Registration success:', result);
      
      setMessage(`🎉 ${result.message}`);
      setRegistrationComplete(true);
      
      // Reset form after successful registration
      setTimeout(() => {
        resetForm();
      }, 5000);
      
    } catch (err) {
      console.error('Error submitting registration:', err);
      setMessage(err.message || 'Failed to submit registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedCourses([]);
    setSlip(null);
    setVerification(null);
    setFormData({
      studentName: user?.name || '',
      studentId: user?.studentId || user?.student_id || '',
      department: '',
      degree: '',
      academicYear: '',
      examDate: '',
      faculty_id: '',
      amountPaid: '',
      paymentMethod: '',
      transactionId: ''
    });
    setVerificationCode(generateVerificationCode());
    setRegistrationComplete(false);
    setMessage('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // If faculty is changed, clear selected courses
    if (name === 'faculty_id' && value !== formData.faculty_id) {
      setSelectedCourses([]);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCourseSelection = (courseId) => {
    if (registrationComplete) return;
    
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleFileUpload = (e) => {
    if (registrationComplete) return;
    
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setMessage('File size too large. Maximum 10MB allowed.');
        return;
      }
      setSlip(file);
      setVerification(null);
      setMessage('');
    }
  };

  // Get faculty name for display
  const getFacultyName = (facultyId) => {
    const faculty = faculties.find(f => f.id == facultyId);
    return faculty ? faculty.name : 'Selected Faculty';
  };

  return (
    <div className="main-area">
      <div className="page-title">Exam Registration</div>
      
      {!user && (
        <div className="auth-warning">
          <p>⚠️ Please log in to register for exams. Your registration will be linked to your account.</p>
        </div>
      )}
      
      <form className="form-container" onSubmit={handleSubmit}>
        {/* Student Information Section */}
        <div className="form-section">
          <h3>Student Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input 
                name="studentName"
                type="text"
                placeholder="Enter your full name"
                value={formData.studentName}
                onChange={handleInputChange}
                required
                disabled={registrationComplete}
              />
            </div>

            <div className="form-group">
              <label>Student ID *</label>
              <input 
                name="studentId"
                type="text"
                placeholder="Enter your student ID"
                value={formData.studentId}
                onChange={handleInputChange}
                required
                disabled={registrationComplete}
              />
            </div>
          </div>
        </div>

        {/* Academic Information Section */}
        <div className="form-section">
          <h3>Academic Information</h3>
          
          <div className="form-group">
            <label>Select Faculty/Department *</label>
            <select 
              name="faculty_id"
              value={formData.faculty_id} 
              onChange={handleInputChange}
              required
              disabled={registrationComplete}
            >
              <option value="">Select Faculty</option>
              {Array.isArray(faculties) && faculties.map(faculty => (
                <option key={faculty.id} value={faculty.id}>
                  {faculty.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Department *</label>
              <input 
                name="department"
                type="text"
                placeholder="e.g., Computer Science Department"
                value={formData.department}
                onChange={handleInputChange}
                required
                disabled={registrationComplete}
              />
            </div>

            <div className="form-group">
              <label>Degree/Diploma *</label>
              <input 
                name="degree"
                type="text"
                placeholder="e.g., BSc Computer Science"
                value={formData.degree}
                onChange={handleInputChange}
                required
                disabled={registrationComplete}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Academic Year *</label>
              <input 
                name="academicYear"
                type="text"
                placeholder="e.g., 2024-2025"
                value={formData.academicYear}
                onChange={handleInputChange}
                required
                disabled={registrationComplete}
              />
            </div>

            <div className="form-group">
              <label>Preferred Exam Date</label>
              <input 
                name="examDate"
                type="date" 
                value={formData.examDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                disabled={registrationComplete}
              />
            </div>
          </div>
        </div>

        {/* Course Selection Section */}
        <div className="form-section">
          <h3>Course Selection</h3>
          
          <div className="form-group">
            <label>
              Select Courses from {formData.faculty_id ? getFacultyName(formData.faculty_id) : 'Faculty'} 
              (Total: M{total.toFixed(2)}) *
            </label>
            
            {/* Faculty Selection Reminder */}
            {!formData.faculty_id && (
              <div className="faculty-reminder">
                <i className="fas fa-info-circle"></i>
                Please select a faculty first to view available courses
              </div>
            )}

            {/* Courses Display */}
            <div className="multi-select">
              {!formData.faculty_id ? (
                <div className="no-faculty-selected">
                  <i className="fas fa-university"></i>
                  <p>Select a faculty above to view available courses</p>
                </div>
              ) : !Array.isArray(filteredCourses) || filteredCourses.length === 0 ? (
                <div className="loading-courses">
                  {loading ? 'Loading courses...' : `No courses available for ${getFacultyName(formData.faculty_id)}`}
                </div>
              ) : (
                <div className="courses-list">
                  <div className="courses-header">
                    <h4>Available Courses in {getFacultyName(formData.faculty_id)}</h4>
                    <span className="courses-count">
                      {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} available
                    </span>
                  </div>
                  
                  {filteredCourses.map(course => (
                    <div key={course.id} className="course-item">
                      <label className="course-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedCourses.includes(course.id)}
                          onChange={() => handleCourseSelection(course.id)}
                          disabled={registrationComplete}
                        />
                        <span className="checkmark"></span>
                        <div className="course-info">
                          <div className="course-header">
                            <strong>{course.code}</strong> - {course.name}
                            <span className="course-price">M{course.price}</span>
                          </div>
                          <div className="course-details">
                            <span className="faculty-badge">
                              <i className="fas fa-university"></i>
                              {getFacultyName(course.faculty_id)}
                            </span>
                            {course.credits && (
                              <span className="credits-badge">
                                <i className="fas fa-star"></i>
                                {course.credits} Credits
                              </span>
                            )}
                            {course.duration && (
                              <span className="duration-badge">
                                <i className="fas fa-clock"></i>
                                {course.duration}
                              </span>
                            )}
                            {course.exam_date && (
                              <span className="exam-date">
                                <i className="fas fa-calendar"></i>
                                Exam: {new Date(course.exam_date).toLocaleDateString()}
                                {course.exam_time && ` at ${course.exam_time}`}
                              </span>
                            )}
                            {course.venue && (
                              <span className="venue-badge">
                                <i className="fas fa-map-marker-alt"></i>
                                {course.venue}
                              </span>
                            )}
                          </div>
                          {course.description && (
                            <div className="course-description">
                              {course.description}
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected Courses Summary */}
          {selectedCourses.length > 0 && (
            <div className="selected-courses-summary">
              <h4>Selected Courses ({selectedCourses.length})</h4>
              <div className="selected-courses-list">
                {selectedCourses.map(courseId => {
                  const course = courses.find(c => c.id === courseId);
                  return course ? (
                    <div key={course.id} className="selected-course-item">
                      <span className="course-code">{course.code}</span>
                      <span className="course-name">{course.name}</span>
                      <span className="course-price">M{course.price}</span>
                      <button 
                        type="button"
                        className="remove-course"
                        onClick={() => handleCourseSelection(course.id)}
                        disabled={registrationComplete}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Total Price Display */}
          <div className="total-price-section">
            <div className="total-price">
              <span>Total Amount Due:</span>
              <strong>M{total.toFixed(2)}</strong>
            </div>
            {selectedCourses.length > 0 && (
              <div className="course-count">
                {selectedCourses.length} course{selectedCourses.length !== 1 ? 's' : ''} selected
              </div>
            )}
          </div>
        </div>

        {/* Payment Information Section */}
        <div className="form-section">
          <h3>Payment Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Amount Paid (M) *</label>
              <input 
                name="amountPaid"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amountPaid}
                onChange={handleInputChange}
                required
                disabled={registrationComplete}
              />
              <small>Enter the exact amount shown on your payment slip</small>
            </div>

            <div className="form-group">
              <label>Payment Method *</label>
              <select 
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                required
                disabled={registrationComplete}
              >
                <option value="">Select Payment Method</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="cash">Cash Deposit</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Transaction ID/Reference *</label>
            <input 
              name="transactionId"
              type="text"
              placeholder="e.g., TXN123456789"
              value={formData.transactionId}
              onChange={handleInputChange}
              required
              disabled={registrationComplete}
            />
            <small>Enter the transaction reference from your payment</small>
          </div>

          {/* Payment Slip Upload */}
          <div className="form-group">
            <label className="file-upload-label">
              Upload Payment Slip (PDF, JPG, PNG - Max 10MB) *
            </label>
            <div className="file-upload-area">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                disabled={loading || registrationComplete}
                id="slip-upload"
              />
              <label htmlFor="slip-upload" className="file-upload-button">
                Choose File
              </label>
              {slip && (
                <div className="file-info">
                  <span className="file-name">{slip.name}</span>
                  <span className="file-size">({(slip.size / 1024 / 1024).toFixed(2)} MB)</span>
                  <button 
                    type="button" 
                    className="remove-file"
                    onClick={() => setSlip(null)}
                    disabled={registrationComplete}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            
            {/* Slip Verification Button */}
            {slip && selectedCourses.length > 0 && (
              <button 
                type="button" 
                onClick={handleSlipVerification}
                disabled={loading || registrationComplete}
                className="verify-slip-btn"
              >
                {loading ? 'Verifying...' : 'Verify Payment Slip'}
              </button>
            )}
          </div>

          {/* Verification Result */}
          {verification && (
            <div className={`verification-result ${verification.verified ? 'verified' : 'not-verified'}`}>
              <div className="verification-icon">
                {verification.verified ? '✅' : '❌'}
              </div>
              <div className="verification-details">
                <h4>Payment Verification Result</h4>
                <div className="verification-info">
                  <div className="amount-row">
                    <span>Extracted Amount:</span>
                    <strong>M{verification.extractedAmount}</strong>
                  </div>
                  <div className="amount-row">
                    <span>Required Amount:</span>
                    <strong>M{verification.requiredAmount}</strong>
                  </div>
                  <div className="amount-row">
                    <span>Difference:</span>
                    <strong className={verification.verified ? 'positive' : 'negative'}>
                      M{verification.amountDifference}
                    </strong>
                  </div>
                </div>
                {verification.verified && verification.verificationCode && (
                  <div className="verification-code-section">
                    <div className="verification-code">
                      Verification Code: <strong>{verification.verificationCode}</strong>
                    </div>
                    <small>Keep this code for your records</small>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Registration Verification Code */}
        <div className="verification-code-display">
          <div className="code-container">
            <span className="code-label">Registration Code:</span>
            <span className="code-value">{verificationCode}</span>
          </div>
          <small>This code will be associated with your registration</small>
        </div>

        {/* Payment Summary */}
        {formData.amountPaid && (
          <div className="payment-summary">
            <h4>Payment Summary</h4>
            <div className="summary-grid">
              <div className="summary-item">
                <span>Courses Total:</span>
                <span>M{total.toFixed(2)}</span>
              </div>
              <div className="summary-item">
                <span>Amount Paid:</span>
                <span>M{parseFloat(formData.amountPaid || 0).toFixed(2)}</span>
              </div>
              <div className="summary-item difference">
                <span>Difference:</span>
                <span className={parseFloat(formData.amountPaid) >= total ? 'positive' : 'negative'}>
                  M{(parseFloat(formData.amountPaid || 0) - total).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Message Display */}
        {message && (
          <div className={`message ${message.includes('🎉') || message.includes('✅') ? 'success' : 'error'}`}>
            <div className="message-content">
              {message}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            type="submit" 
            className="submit-btn primary"
            disabled={loading || registrationComplete || selectedCourses.length === 0}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Processing Registration...
              </>
            ) : registrationComplete ? (
              'Registration Complete!'
            ) : (
              'Submit Exam Registration'
            )}
          </button>
          
          {!registrationComplete && (
            <button 
              type="button" 
              className="reset-btn secondary"
              onClick={resetForm}
              disabled={loading}
            >
              Reset Form
            </button>
          )}
        </div>

        {/* Registration Requirements */}
        <div className="requirements-section">
          <h4>Registration Process & Requirements</h4>
          <div className="requirements-list">
            <div className="requirement-item">
              <span className="step-number">1</span>
              <span>Fill in your personal and academic information</span>
            </div>
            <div className="requirement-item">
              <span className="step-number">2</span>
              <span>Select your faculty to view available courses</span>
            </div>
            <div className="requirement-item">
              <span className="step-number">3</span>
              <span>Select the courses you want to register for</span>
            </div>
            <div className="requirement-item">
              <span className="step-number">4</span>
              <span>Enter payment details and upload payment slip</span>
            </div>
            <div className="requirement-item">
              <span className="step-number">5</span>
              <span>Verify payment slip (optional but recommended)</span>
            </div>
            <div className="requirement-item">
              <span className="step-number">6</span>
              <span>Submit your registration</span>
            </div>
          </div>
          
          <div className="important-notes">
            <h5>Important Notes:</h5>
            <ul>
              <li>Ensure all information is accurate before submission</li>
              <li>Courses are filtered by the faculty you select</li>
              <li>Payment amount must meet or exceed the course total</li>
              <li>Keep your registration code for future reference</li>
              <li>Contact administration if you encounter any issues</li>
              {!user && <li>⚠️ You are not logged in. Registration will work but won't be linked to your account.</li>}
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
}

export default RegisterExam;
// src/utils/api.js
// API helper with automatic token inclusion
const API_BASE_URL = 'http://localhost:5000/api';

// Enhanced authFetch with better error handling
export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  // Ensure URL is properly formatted
  let fullUrl;
  if (url.startsWith('http')) {
    fullUrl = url;
  } else {
    // Remove leading slash if present to avoid double slashes
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    fullUrl = `${API_BASE_URL}/${cleanUrl}`;
  }
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  console.log(`🌐 API Request: ${options.method || 'GET'} ${fullUrl}`, { headers });

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    console.log(`📨 API Response: ${response.status} for ${fullUrl}`);

    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Authentication failed. Please login again.');
    }

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Handle server response structure
    if (result && result.success === false) {
      throw new Error(result.error || 'Request failed');
    }
    
    // Return data property if exists, otherwise return the whole result
    return result.data !== undefined ? result.data : result;
    
  } catch (error) {
    console.error(`❌ API Error for ${fullUrl}:`, error);
    
    // Handle network errors specifically
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    
    throw error;
  }
};

// For file uploads with authentication
export const authFetchFormData = async (url, formData, options = {}) => {
  const token = localStorage.getItem('token');
  
  // Ensure URL is properly formatted
  let fullUrl;
  if (url.startsWith('http')) {
    fullUrl = url;
  } else {
    // Remove leading slash if present to avoid double slashes
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    fullUrl = `${API_BASE_URL}/${cleanUrl}`;
  }
  
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  console.log(`🌐 API Upload Request: ${options.method || 'POST'} ${fullUrl}`, { headers });

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
      body: formData,
    });

    console.log(`📨 API Upload Response: ${response.status} for ${fullUrl}`);

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Authentication failed. Please login again.');
    }

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Handle server response structure
    if (result && result.success === false) {
      throw new Error(result.error || 'Request failed');
    }
    
    // Return data property if exists, otherwise return the whole result
    return result.data !== undefined ? result.data : result;
    
  } catch (error) {
    console.error(`❌ API Upload Error for ${fullUrl}:`, error);
    
    // Handle network errors specifically
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    
    throw error;
  }
};

// Specific API methods
export const api = {
  // ======================
  // AUTHENTICATION ENDPOINTS
  // ======================
  login: (email, password) => 
    authFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  register: (userData) =>
    authFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),

  getCurrentUser: () => authFetch('/auth/me'),

  // ======================
  // STUDENT ENDPOINTS
  // ======================
  getStudentRegistrations: (studentId) => 
    authFetch(`/student/registrations/${studentId}`),

  registerExam: (formData) =>
    authFetchFormData('/exam/register', formData, {
      method: 'POST'
    }),

  // ======================
  // ADMIN ENDPOINTS
  // ======================
  getFaculties: () => authFetch('/admin/faculties'),
  getCourses: () => authFetch('/admin/courses'),
  getAllUsers: () => authFetch('/admin/users'),
  getAllRegistrations: () => authFetch('/admin/registrations'),
  
  deleteUser: (id) =>
    authFetch(`/admin/users/${id}`, {
      method: 'DELETE'
    }),
    
  updateUserRole: (id, role) =>
    authFetch(`/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    }),

  // ======================
  // COURSES MANAGEMENT ENDPOINTS
  // ======================
  createCourse: (courseData) =>
    authFetch('/admin/courses', {
      method: 'POST',
      body: JSON.stringify(courseData)
    }),

  updateCourse: (id, courseData) =>
    authFetch(`/admin/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData)
    }),

  deleteCourse: (id) =>
    authFetch(`/admin/courses/${id}`, {
      method: 'DELETE'
    }),

  // ======================
  // FACULTIES MANAGEMENT ENDPOINTS
  // ======================
  createFaculty: (facultyData) =>
    authFetch('/admin/faculties', {
      method: 'POST',
      body: JSON.stringify(facultyData)
    }),

  updateFaculty: (id, facultyData) =>
    authFetch(`/admin/faculties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(facultyData)
    }),

  deleteFaculty: (id) =>
    authFetch(`/admin/faculties/${id}`, {
      method: 'DELETE'
    }),

  // ======================
  // MESSAGES ENDPOINTS
  // ======================
  getMessages: () => authFetch('/messages'),
  
  markMessageRead: (id) => 
    authFetch(`/messages/${id}/read`, { 
      method: 'PUT' 
    }),

  // ======================
  // CALENDAR ENDPOINTS
  // ======================
  getCalendarEvents: () => authFetch('/calendar/events'),

  // ======================
  // COURSES ENDPOINTS
  // ======================
  getAvailableCourses: () => authFetch('/courses'),

  // ======================
  // AI ENDPOINTS
  // ======================
  getAIPrediction: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return authFetch(`/ai/predict?${queryString}`);
  },
  
  getAITrends: () => authFetch('/ai/trends'),
  
  getAIMetrics: () => authFetch('/ai/metrics'),
  
  trainAIModel: () => 
    authFetch('/ai/train', { 
      method: 'POST' 
    }),

  // ======================
  // BLOCKCHAIN ENDPOINTS
  // ======================
  getBlockchainStatus: () => authFetch('/blockchain/status'),
  
  getBlockchainStudentRecords: (studentId) => 
    authFetch(`/blockchain/student/${studentId}`),
    
  verifyBlockchain: () => authFetch('/blockchain/verify'),

  // ======================
  // SECURITY ENDPOINTS
  // ======================
  getSecurityPermissions: () => authFetch('/security/permissions'),
  
  getGDPRCompliance: () => authFetch('/security/gdpr-compliance'),
  
  getDataClassification: () => authFetch('/security/data-classification'),

  // ======================
  // SYSTEM ENDPOINTS
  // ======================
  getHealth: () => authFetch('/health'),
  
  getDatabaseStatus: () => authFetch('/debug/database-status'),
  
  getSystemStatus: () => authFetch('/debug/system-status')
};

// Enhanced error handler with more specific messages
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  console.error('API Error:', error);
  
  const errorMessage = error.message || '';
  
  if (errorMessage.includes('401')) {
    return 'Authentication failed. Please login again.';
  } else if (errorMessage.includes('403')) {
    return 'You do not have permission to perform this action.';
  } else if (errorMessage.includes('404')) {
    return 'The requested resource was not found.';
  } else if (errorMessage.includes('500')) {
    return 'Server error. Please try again later.';
  } else if (errorMessage.includes('Network Error') || errorMessage.includes('Failed to fetch')) {
    return 'Network error. Please check your connection and try again.';
  } else if (errorMessage.includes('Faculty name already exists')) {
    return 'A faculty with this name already exists.';
  } else if (errorMessage.includes('Course code already exists')) {
    return 'A course with this code already exists.';
  } else if (errorMessage.includes('Cannot delete faculty with existing courses')) {
    return 'Cannot delete faculty that has courses. Remove all courses first.';
  } else if (errorMessage.includes('Cannot delete course with active registrations')) {
    return 'Cannot delete course that has active registrations.';
  }
  
  return errorMessage || defaultMessage;
};

// Helper to check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    // Simple token validation (in a real app, you might want to decode and check expiry)
    return token.length > 10;
  } catch {
    return false;
  }
};

// Helper to get auth headers for direct fetch calls
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Batch request helper for multiple API calls
export const batchRequests = async (requests) => {
  try {
    const results = await Promise.allSettled(requests);
    
    const successful = results.filter(result => result.status === 'fulfilled').map(result => result.value);
    const failed = results.filter(result => result.status === 'rejected').map(result => result.reason);
    
    if (failed.length > 0) {
      console.warn(`Batch completed with ${failed.length} failed requests:`, failed);
    }
    
    return {
      successful,
      failed,
      total: requests.length,
      successCount: successful.length,
      failureCount: failed.length
    };
  } catch (error) {
    console.error('Batch request error:', error);
    throw error;
  }
};

// Export everything
export default {
  authFetch,
  authFetchFormData,
  api,
  handleApiError,
  isAuthenticated,
  getAuthHeaders,
  batchRequests
};
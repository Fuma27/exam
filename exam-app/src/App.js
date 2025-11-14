// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import Home from './pages/Home';
import RegisterExam from './pages/RegisterExam';
import Confirm from './pages/Confirm';
import Faculties from './pages/admin/Faculties';
import Courses from './pages/admin/Courses';
import Students from './pages/admin/Students';
import Settings from './pages/Settings';
import Support from './pages/Support';
import Calendar from './pages/Calendar'; // Add this import
import Messages from './pages/Messages'; // Add this import

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<ProtectedRoute><Layout><Home /></Layout></ProtectedRoute>} />
          <Route path="/register-exam" element={<ProtectedRoute><Layout><RegisterExam /></Layout></ProtectedRoute>} />
          <Route path="/confirm" element={<ProtectedRoute><Layout><Confirm /></Layout></ProtectedRoute>} />
          
          {/* Add the missing routes */}
          <Route path="/calendar" element={<ProtectedRoute><Layout><Calendar /></Layout></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Layout><Messages /></Layout></ProtectedRoute>} />
          
          <Route path="/admin/faculties" element={<ProtectedRoute allowedRoles={['admin']}><Layout><Faculties /></Layout></ProtectedRoute>} />
          <Route path="/admin/courses" element={<ProtectedRoute allowedRoles={['admin']}><Layout><Courses /></Layout></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['admin']}><Layout><Students /></Layout></ProtectedRoute>} />
          
          <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><Layout><Support /></Layout></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
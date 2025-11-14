import React, { useState } from 'react';
import { faculties, courses } from '../../data/db';

function AdminDashboard() {
  const [newFaculty, setNewFaculty] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examTime, setExamTime] = useState('');

  const addFaculty = () => {
    if (newFaculty) {
      faculties.push({ id: Date.now(), name: newFaculty });
      setNewFaculty('');
    }
  };

  const assignExam = () => {
    if (selectedCourse && examDate && examTime) {
      const course = courses.find(c => c.id === parseInt(selectedCourse));
      course.date = examDate;
      course.time = examTime;
      alert(`Exam scheduled: ${course.name} on ${examDate} at ${examTime}`);
    }
  };

  return (
    <div className="main-area">
      <div className="page-title">Admin Dashboard</div>

      {/* Add Faculty */}
      <div className="admin-section">
        <h3>Add Faculty</h3>
        <input value={newFaculty} onChange={(e) => setNewFaculty(e.target.value)} placeholder="Faculty name" />
        <button onClick={addFaculty}>Add Faculty</button>
      </div>

      {/* Assign Exam Date/Time */}
      <div className="admin-section">
        <h3>Assign Exam Schedule</h3>
        <select onChange={(e) => setSelectedCourse(e.target.value)}>
          <option value="">Select Course</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
        <input type="time" value={examTime} onChange={(e) => setExamTime(e.target.value)} />
        <button onClick={assignExam}>Assign Date & Time</button>
      </div>

      {/* Course Stats */}
      <div className="admin-section">
        <h3>Registered Students per Course</h3>
        {courses.map(c => (
          <div key={c.id} className="stat-card">
            <strong>{c.name}</strong>
            <p>Registered: {c.registered} students</p>
            <p>Date: {c.date || "Not set"} | Time: {c.time || "Not set"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
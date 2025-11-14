import React from 'react';
import { useAuth } from '../context/AuthContext';

function ExamList() {
  const { user } = useAuth();
  const exams = [
    { course: 'Cryptography & Network Security', date: '09/10/2023' },
    { course: 'Loops, Arrays & Functions', date: '09/10/2023' },
  ];

  return (
    <div>
      <h1>Exam List</h1>
      {user.role === 'examiner' ? (
        <ul>
          {exams.map((exam, index) => (
            <li key={index}>{exam.course} - {exam.date} <button>Grade</button></li>
          ))}
        </ul>
      ) : (
        <ul>
          {exams.map((exam, index) => (
            <li key={index}>{exam.course} - {exam.date}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ExamList;
import React from 'react';

function Dashboard() {
  const successRates = [
    { course: 'Cryptography', rate: 0.85 },
    { course: 'Programming', rate: 0.75 },
  ];

  return (
    <div>
      <h1>Success Rate Dashboard</h1>
      <ul>
        {successRates.map((data, index) => (
          <li key={index}>{data.course}: {data.rate * 100}%</li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
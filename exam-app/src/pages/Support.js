// src/pages/Support.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Support.css';

function Support() {
  const { user } = useAuth();
  const [supportTopic, setSupportTopic] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const currentTime = new Date().toLocaleTimeString('en-ZA', { 
    timeZone: 'Africa/Johannesburg', 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Support Request:', { user: user?.name, topic: supportTopic, description });
    setSubmitted(true);
    setSupportTopic('');
    setDescription('');
  };

  const faqs = [
    { question: 'How do I register for an exam?', answer: 'Go to the "Register for exams" section and fill out the form with your details.' },
    { question: 'What should I do if I forget my password?', answer: 'Use the "Forgot Password" link on the login page to reset it.' },
    { question: 'How can I view my registered exams?', answer: 'Navigate to "View registered exams" in the sidebar to see your schedule.' },
  ];

  return (
    <div className="support-page">
      <div className="support-header">
        <h1>Support</h1>
        <p className="time-greeting">
          Good {currentTime < '12:00' ? 'Morning' : currentTime < '17:00' ? 'Afternoon' : 'Evening'}!{' '}
          {currentTime === '07:02' ? 'We’re here to help you start your day!' : 'We’re here to assist you!'} {user?.name}
        </p>
      </div>

      {/* Support Request Form */}
      <div className="support-card">
        <h2>Submit a Support Request</h2>
        {!submitted ? (
          <form onSubmit={handleSubmit} className="support-form">
            <select 
              value={supportTopic} 
              onChange={(e) => setSupportTopic(e.target.value)} 
              required
              className="support-select"
            >
              <option value="">Select a topic</option>
              <option value="Registration Issue">Registration Issue</option>
              <option value="Login Problem">Login Problem</option>
              <option value="Other">Other</option>
            </select>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your issue..."
              required
              className="support-textarea"
            />
            <button type="submit" className="submit-btn">
              Submit Request
            </button>
          </form>
        ) : (
          <div className="success-message">
            Thank you! Your support request has been submitted. We will get back to you soon.
          </div>
        )}
      </div>

      {/* FAQs */}
      <div className="support-card">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Info */}
      <div className="support-card">
        <h2>Contact Us</h2>
        <div className="contact-info">
          <p><strong>Email:</strong> support@examapp.com</p>
          <p><strong>Phone:</strong> +27 123 456 789</p>
          <p><strong>Hours:</strong> 08:00 AM - 05:00 PM SAST, Monday - Friday</p>
        </div>
      </div>
    </div>
  );
}

export default Support;